import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { RolService } from '../../../services/api/rol.service';
import { Router } from '@angular/router';
import { RolInterface } from 'src/app/models/rol.interface';
import { PermisoInterface } from 'src/app/models/permiso.interface';
import { RolPermisoInterface } from 'src/app/models/rol-permiso.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';

import * as XLSX from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-list-roles',
  templateUrl: './list-roles.component.html',
  styleUrls: ['./list-roles.component.scss']
})
export class ListRolesComponent implements OnInit, OnDestroy {

  constructor(
    private api: RolService,
    private router: Router,
    private dialog: MatDialog,
  ) { }

  private subscriptions: Subscription = new Subscription();

  roles: RolInterface[] = [];
  dataSource: MatTableDataSource<RolInterface> = new MatTableDataSource();
  loading: boolean = true;
  totalPermisosCargados = 0;
  dataToExport: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort; //para el ordenamiento
  @ViewChild('viewRolDialog') viewRolDialog!: TemplateRef<any>;

  ngOnInit(): void {
    this.loadRoles();
  }

  ngAfterViewInit() { //para la paginacion
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    // Desuscribirse de todas las suscripciones
    this.subscriptions.unsubscribe();
  }


  loadPermisosPorRol(idRol: string): void {
    const rolPermiSub = this.api.getRolPermisos(idRol).subscribe(data => {
      const permisos: PermisoInterface[] = data.idPermiso
        ? data.idPermiso.filter((rolPermiso: RolPermisoInterface | null | undefined) => rolPermiso !== null && rolPermiso !== undefined)
          .map((rolPermiso: RolPermisoInterface) => rolPermiso.permiso!)
        : [];

      const rol = this.roles.find((r: RolInterface) => r.idRol === idRol);  // Encuentra el rol correspondiente en el arreglo 'roles'

      if (rol) {  // Asigna los permisos al rol encontrado
        rol.permisos = permisos;
        this.totalPermisosCargados++;

        if (this.totalPermisosCargados === this.roles.length) {
          this.loading = false;
        }
      }
    });
    this.subscriptions.add(rolPermiSub);
  }

  loadRoles(): void {
    const allRolesSub = this.api.getAllRoles().subscribe(data => {
      this.roles = data;
      this.dataSource.data = this.roles;

      data.forEach((rol: RolInterface) => {   // Obtener los permisos por cada rol
        this.loadPermisosPorRol(rol.idRol);
      });
    });
    this.subscriptions.add(allRolesSub);
  }

  viewRol(rol: RolInterface): void {
    this.dialog.open(this.viewRolDialog, {
      data: rol,
      width: '25%',
      height: 'auto',
    });
  }

  editRol(id: any): void {
    this.loading = true;
    this.router.navigate(['rol/edit-rol', id]);
  }

  newRol(): void {
    this.loading = true;
    this.router.navigate(['rol/new-rol']);
  }

  deleteRol(id: any): void {
    Swal.fire({
      icon: 'question',
      title: '¿Estás seguro de que deseas eliminar este rol?',
      showDenyButton: true,
      showCancelButton: true,
      showConfirmButton: false,
      reverseButtons: true,
      denyButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isDenied) {
        this.loading = true;
        this.api.deleteRol(id).subscribe(data => {
          if (data.status == 'ok') {
            this.roles = this.roles.filter(rol => rol.idRol !== id);
            this.dataSource.data = this.roles;
            Swal.fire({
              icon: 'success',
              title: 'Rol eliminado',
              text: 'El rol ha sido eliminado exitosamente.',
              toast: true,
              showConfirmButton: false,
              timer: 5000,
              position: 'top-end',
              timerProgressBar: true,
              showCloseButton: true,
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al eliminar',
              text: data.msj,
            });
          }
          this.loading = false;
        },
          (error) => {
            this.loading = false;
            Swal.fire({
              icon: 'error',
              title: 'Error en el servidor',
              text: 'Ha ocurrido un error al comunicarse con el servidor. Por favor, revisa tu conexión a internet o inténtalo nuevamente',
            });
          });
      }
    });
  }

  generateExcel(): void {
    const dataToExport = this.roles.map(rol => ({
      'Nombre': rol.nombreRol,
      'Permisos': rol.permisos?.map(permiso => permiso.nombrePermiso).join(', ') || '',
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Roles');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const excelFileURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = excelFileURL;
    link.download = 'roles.xlsx';
    link.click();
  }

  generatePDF(): void {
    this.dataToExport = this.roles.map(rol => ({
      'Nombre': rol.nombreRol,
      'Permisos': rol.permisos?.map(permiso => permiso.nombrePermiso).join(', ') || '',
    }));

    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Lista de Roles', style: 'header' },
        {
          style: 'tableExample',
          table: {
            widths: ['auto', 'auto'],
            body: [
              ['Nombre', 'Permisos'],
              ...this.dataToExport.map(rol => [
                rol['Nombre'],
                rol['Permisos'],
              ])
            ]
          }
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },
        tableExample: {
          margin: [0, 5, 0, 15]
        }
      },
      pageOrientation: 'landscape'
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBlob((blob: Blob) => {
      const pdfBlobUrl = URL.createObjectURL(blob);
      window.open(pdfBlobUrl, '_blank');
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
