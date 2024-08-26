import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ClienteService } from '../../../services/api/cliente.service';
import { Router } from '@angular/router';
import { ClienteInterface } from 'src/app/models/cliente.interface';
import { TipoDocumentoInterface } from 'src/app/models/tipo-documento.interface';
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
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;


@Component({
  selector: 'app-list-clientes',
  templateUrl: './list-clientes.component.html',
  styleUrls: ['./list-clientes.component.scss']
})
export class ListClientesComponent implements OnInit, OnDestroy {

  constructor(
    private api: ClienteService,
    private router: Router,
    private dialog: MatDialog,
  ) { }

  private subscriptions: Subscription = new Subscription();

  clientes: ClienteInterface[] = [];
  tiposDocumento: TipoDocumentoInterface[] = [];
  dataSource = new MatTableDataSource(this.clientes);
  loading: boolean = true;
  dataToExport: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator; //para la paginacion, y los del ! pal not null
  @ViewChild(MatSort) sort!: MatSort; //para el ordenamiento
  @ViewChild('viewClienteDialog') viewClienteDialog!: TemplateRef<any>;

  ngOnInit(): void {
    this.loading = true;

    const forkJoinSub = forkJoin([
      this.api.getAllClientes(),
      this.api.getTipoDocumento()
    ]).subscribe(([clientes, tiposDocumento]) => {
      this.clientes = clientes;
      this.dataSource.data = this.clientes;
      if (this.dataSource.data.length < 1) {
        Swal.fire({
          title: 'No hay clientes registrados',
          text: 'No se encontraron clientes en el sistema.',
          icon: 'info',
          toast: true,
          showConfirmButton: false,
          timer: 5000,
          position: 'top-end',
          timerProgressBar: true,
          showCloseButton: true,
        })
      }
      this.tiposDocumento = tiposDocumento;
      this.loading = false;
    },
      error => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error en el servidor',
          text: 'Ha ocurrido un error al comunicarse con el servidor. Por favor, revisa tu conexión a internet o inténtalo nuevamente.',
        });
      });
    this.subscriptions.add(forkJoinSub);
  }

  ngAfterViewInit() { //para la paginacion y el ordenamiento
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    // Desuscribirse de todas las suscripciones
    this.subscriptions.unsubscribe();
  }


  viewCliente(cliente: ClienteInterface): void {
    this.dialog.open(this.viewClienteDialog, {
      data: cliente,
      width: '35%',
      height: 'auto',
    });
  }

  editCliente(id: any) {
    this.loading = true;
    this.router.navigate(['cliente/edit-cliente', id]);
  }

  newCliente() {
    this.loading = true;
    this.router.navigate(['cliente/new-cliente']);
  }

  deleteCliente(id: any): void {
    Swal.fire({
      icon: 'question',
      title: '¿Estás seguro de que deseas eliminar este cliente?',
      showDenyButton: true,
      showCancelButton: true,
      showConfirmButton: false,
      reverseButtons: true,
      denyButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isDenied) {
        this.loading = true;
        this.api.deleteCliente(id).subscribe(
          data => {
            if (data.status == 'ok') {
              this.clientes = this.clientes.filter(cliente => cliente.idCliente !== id);
              this.dataSource.data = this.clientes; // Actualizar el dataSource con los nuevos datos
              Swal.fire({
                icon: 'success',
                title: 'Cliente eliminado',
                text: 'El cliente ha sido eliminado exitosamente.',
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
          error => {
            this.loading = false;
            Swal.fire({
              icon: 'error',
              title: 'Error en el servidor',
              text: 'Ha ocurrido un error al comunicarse con el servidor. Por favor, revisa tu conexión a internet o inténtalo nuevamente.',
            });
          });
      }
    });
  }

  getTipoDocumento(idTipoDocumento: any): string {
    const tipoDocumento = this.tiposDocumento.find(tipo => tipo.idTipoDocumento === idTipoDocumento);
    return tipoDocumento?.nombreTipo || '';
  }

  generateExcel(): void {
    const dataToExport = this.clientes.map(cliente => ({
      'Nombre': cliente.nombreCliente,
      'Documento': cliente.documentoCliente,
      'Tipo documento': this.getTipoDocumento(cliente.idTipoDocumento),
      'Teléfono': cliente.telefonoCliente,
      'Correo electrónico': cliente.correoCliente,
      'Dirección': cliente.direccionCliente,
      'Detalle dirección': cliente.detalleDireccionCliente,
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const excelFileURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = excelFileURL;
    link.download = 'clientes.xlsx';
    link.click();
  }



  generatePDF(): void {
    this.dataToExport = this.clientes.map(cliente => ({
      'Nombre': cliente.nombreCliente,
      'Documento': cliente.documentoCliente,
      'Tipo documento': this.getTipoDocumento(cliente.idTipoDocumento),
      'Teléfono': cliente.telefonoCliente,
      'Email': cliente.correoCliente,
      'Dirección': cliente.direccionCliente,
      'Detalle dirección': cliente.detalleDireccionCliente,
    }));

    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Lista de Clientes', style: 'header' },
        {
          style: 'tableExample',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              ['Nombre', 'Documento', 'Tipo documento', 'Teléfono', 'Email', 'Dirección', 'Detalle dirección'],
              ...this.dataToExport.map(cliente => [
                cliente['Nombre'],
                cliente['Documento'],
                cliente['Tipo documento'],
                cliente['Teléfono'],
                cliente['Email'],
                cliente['Dirección'],
                cliente['Detalle dirección']
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

  removeAccents(cadena: string): string {
    return cadena.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }  

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
