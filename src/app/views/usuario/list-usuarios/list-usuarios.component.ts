import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { UsuarioService } from '../../../services/api/usuario.service';
import { Router } from '@angular/router';
import { UsuarioInterface } from 'src/app/models/usuario.interface';
import { TipoDocumentoInterface } from 'src/app/models/tipo-documento.interface';
import { EstadoUsuarioInterface } from 'src/app/models/estado-usuario.interface';
import { RolInterface } from 'src/app/models/rol.interface';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subscription, forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

import * as XLSX from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { PaqueteService } from 'src/app/services/api/paquete.service';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;


@Component({
  selector: 'app-list-usuarios',
  templateUrl: './list-usuarios.component.html',
  styleUrls: ['./list-usuarios.component.scss']
})
export class ListUsuariosComponent implements OnInit, OnDestroy {

  constructor(
    private api: UsuarioService,
    private apiPaquete: PaqueteService,
    private router: Router,
    private dialog: MatDialog,
  ) { }

  private subscriptions: Subscription = new Subscription();

  cont: any;
  usuarios: any[] = [];
  tiposDocumento: TipoDocumentoInterface[] = [];
  estadosUsuario: EstadoUsuarioInterface[] = [];
  rolUsuario: RolInterface[] = [];
  paquetes: any[] = [];
  dataSource = new MatTableDataSource(this.usuarios);
  loading: boolean = true;
  dataToExport: any[] = [];

  uid = localStorage.getItem('uid');

  @ViewChild(MatPaginator) paginator!: MatPaginator; //para la paginacion, y los del ! pal not null
  @ViewChild(MatSort) sort!: MatSort; //para el ordenamiento
  @ViewChild('viewUsuarioDialog') viewUsuarioDialog!: TemplateRef<any>;

  ngOnInit(): void {

    const getAllUsuarios$ = this.api.getAllUsuarios();
    const getTipoDocumento$ = this.api.getTipoDocumento();
    const getEstadoUsuario$ = this.api.getEstadoUsuario();
    const getRolUsuario$ = this.api.getRolUsuario();
    const getPaquetes$ = this.apiPaquete.getAllPaquetes();

    const forkJoinSub = forkJoin([getAllUsuarios$, getTipoDocumento$, getEstadoUsuario$, getRolUsuario$, getPaquetes$]).subscribe(
      ([usuarios, tiposDocumento, estadosUsuario, rolUsuario, paquete]) => {
        this.usuarios = usuarios;
        this.tiposDocumento = tiposDocumento;
        this.estadosUsuario = estadosUsuario;
        this.rolUsuario = rolUsuario;
        this.paquetes = paquete;
        this.dataSource.data = this.usuarios;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      }
    );
    this.subscriptions.add(forkJoinSub);
  }

  ngAfterViewInit() { //para la paginacion
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    // Desuscribirse de todas las suscripciones
    this.subscriptions.unsubscribe();
  }

  async viewUsuario(usuario: UsuarioInterface) {
    await this.getContPaquete(usuario.idUsuario);
    const cont = this.cont;
    this.dialog.open(this.viewUsuarioDialog, {
      data: { usuario, conta: cont },
      width: '35%',
      height: 'auto',
    });
  }

  editUsuario(id: any) {
    this.loading = true;

    this.router.navigate(['usuario/edit-usuario', id]);
  }

  newUsuario() {
    this.loading = true;
    this.router.navigate(['usuario/new-usuario']);
  }

  deleteUsuario(id: any): void {
    Swal.fire({
      icon: 'question',
      title: '¿Estás seguro de que deseas eliminar este usuario?',
      showDenyButton: true,
      showCancelButton: true,
      showConfirmButton: false,
      reverseButtons: true,
      denyButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isDenied) {
        this.loading = true;
        if (id == this.uid) {
          Swal.fire({
            icon: 'error',
            title: 'Operacion cancelada',
            text: 'No puedes eliminar tu propio usuario.',
          });
          this.loading = false;
          return;
        }
        const delUserSUb = this.api.deleteUsuario(id).subscribe(data => {
          if (data.status == 'ok') {
            this.usuarios = this.usuarios.filter(usuario => usuario.idUsuario !== id);
            this.dataSource.data = this.usuarios; // Actualizamos el dataSource con los nuevos datos
            Swal.fire({
              icon: 'success',
              title: 'Usuario eliminado',
              text: 'El usuario ha sido eliminado exitosamente.',
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
        this.subscriptions.add(delUserSUb);
      }
    });
  }



  toggleEstado(usuario: UsuarioInterface): void {
    const nuevoEstado = parseInt(usuario.idEstado, 10) === 1 ? 2 : 1;
    const { contrasenaUsuario, ...userWithOutPwd } = usuario;
    const updatedUsuario: UsuarioInterface = { ...userWithOutPwd, idEstado: nuevoEstado };

    Swal.fire({
      icon: 'question',
      title: '¿Estás seguro de que deseas cambiar el estado de este usuario?',
      showCancelButton: true,
      showCloseButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        if (usuario.idUsuario == this.uid) {
          Swal.fire({
            icon: 'warning',
            title: 'Operación cancelada',
            text: 'No puedes cambiar el estado de tu propio usuario.',
          });
          this.loading = false;
          return;
        }

        const putUserSub = this.api.putUsuario(updatedUsuario).subscribe(data => {
          if (data.status == 'ok') {
            this.usuarios = this.usuarios.map(u => (u.documentoUsuario === updatedUsuario.documentoUsuario ? updatedUsuario : u));
            this.dataSource.data = this.usuarios; // Actualizamos el dataSource con los nuevos datos
            Swal.fire({
              icon: 'success',
              title: 'Usuario actualizado',
              text: 'El estado del usuario ha sido actualizado exitosamente.',
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
              title: 'Error al actualizar',
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
        this.subscriptions.add(putUserSub);
      }
    });
  }

  async getContPaquete(idUsuario: any) {
    this.cont = await this.api.getPaqueteUsuario(idUsuario).toPromise();
  }


  getTipoDocumento(idTipoDocumento: any): string {
    const tipoDocumento = this.tiposDocumento.find(tipo => tipo.idTipoDocumento === idTipoDocumento);
    return tipoDocumento?.nombreTipo || '';
  }

  getEstadoUsuario(idEstado: any): string {
    const estadoUsuario = this.estadosUsuario.find(estado => estado.idEstado === idEstado);
    return estadoUsuario?.estadoUsuario || '';
  }

  getRolUsuario(idRol: any): string {
    const rolUsuario = this.rolUsuario.find(rol => rol.idRol === idRol);
    return rolUsuario?.nombreRol || '';
  }

  async generateExcel(): Promise<void> {
    const dataToExport: any[] = [];

    for (const usuario of this.usuarios) {
      try {
        await this.getContPaquete(usuario.idUsuario);

        const userData = {
          'Documento': usuario.documentoUsuario,
          'Tipo documento': this.getTipoDocumento(usuario.idTipoDocumento),
          'Nombre': usuario.nombreUsuario,
          'Apellido': usuario.apellidoUsuario,
          'Email': usuario.correoUsuario,
          'Teléfono': usuario.telefonoUsuario,
          'Rol': this.getRolUsuario(usuario.idRol),
          'Estado': this.getEstadoUsuario(usuario.idEstado),
          'Paquetes entregados': this.cont
        };

        dataToExport.push(userData);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al generar el Excel',
          text: 'Ha ocurrido un error al generar el Excel. Por favor, inténtalo nuevamente.',
        });
      }
    }

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const excelFileURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = excelFileURL;
    link.download = 'usuarios.xlsx';
    link.click();
  }

  generatePDF(): void {
    const dataToExport: any[] = [];

    const promiseArray: Promise<void>[] = this.usuarios.map(async usuario => {
      try {

        await this.getContPaquete(usuario.idUsuario);

        const userData = {
          'Documento': usuario.documentoUsuario,
          'Tipo documento': this.getTipoDocumento(usuario.idTipoDocumento),
          'Nombre': usuario.nombreUsuario,
          'Apellido': usuario.apellidoUsuario,
          'Email': usuario.correoUsuario,
          'Teléfono': usuario.telefonoUsuario,
          'Rol': this.getRolUsuario(usuario.idRol),
          'Estado': this.getEstadoUsuario(usuario.idEstado),
          'Paquetes entregados': this.cont
        };

        dataToExport.push(userData);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al generar el PDF',
          text: 'Ha ocurrido un error al generar el PDF. Por favor, inténtalo nuevamente.',
        });
      }
    });

    Promise.all(promiseArray).then(() => {
      const docDefinition: TDocumentDefinitions = {
        content: [
          { text: 'Lista de Usuarios', style: 'header' },
          {
            style: 'tableExample',
            table: {
              widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
              body: [
                ['Documento', 'Tipo documento', 'Nombre', 'Apellido', 'Email', 'Teléfono', 'Rol', 'Estado', 'Paquetes Entregados'],
                ...dataToExport.map(usuario => [
                  usuario['Documento'],
                  usuario['Tipo documento'],
                  usuario['Nombre'],
                  usuario['Apellido'],
                  usuario['Email'],
                  usuario['Teléfono'],
                  usuario['Rol'],
                  usuario['Estado'],
                  usuario['Paquetes entregados']
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
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}