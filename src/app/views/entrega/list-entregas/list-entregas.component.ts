import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EntregaInterface } from 'src/app/models/entrega.interface';
import { RastreoInterface } from 'src/app/models/rastreo.interface';
import { EntregaService } from 'src/app/services/api/entrega.service';
import { Subscription, forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { PaqueteInterface } from 'src/app/models/paquete.interface';
import { PaqueteService } from 'src/app/services/api/paquete.service';
import { RastreoService } from 'src/app/services/api/rastreo.service';

import * as XLSX from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { UsuarioInterface } from 'src/app/models/usuario.interface';
import { UsuarioService } from 'src/app/services/api/usuario.service';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-list-entregas',
  templateUrl: './list-entregas.component.html',
  styleUrls: ['./list-entregas.component.scss']
})
export class ListEntregasComponent implements OnInit {
  constructor(
    private api: EntregaService,
    private apiRastreo: RastreoService,
    private apiPaquete: PaqueteService,
    private apiUsuario: UsuarioService,
    private dialog: MatDialog,
  ) { }

  private subscriptions: Subscription = new Subscription();

  entregas: EntregaInterface[] = [];
  rastreos: RastreoInterface[] = [];
  paquetes: PaqueteInterface[] = [];
  usuarios: any[] = [];
  dataSource = new MatTableDataSource(this.entregas); //pal filtro
  loading: boolean = true;
  dataToExport: any[] = [];
  base64UrlToShow: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator; //para la paginacion, y los del ! pal not null
  @ViewChild(MatSort) sort!: MatSort; //para el ordenamiento
  @ViewChild('viewEntregaDialog') viewEntregaDialog!: TemplateRef<any>;
  @ViewChild('viewFirma') viewFirma!: TemplateRef<any>;

  ngOnInit(): void {

    this.loading = true;

    const forkJoinSub = forkJoin([
      this.api.getAllEntregas(),
      this.apiRastreo.getRastreosByEntregado(),
      this.apiPaquete.getAllPaquetes(),
      this.apiUsuario.getAllUsuarios()
    ]).subscribe(([entrega, rastreo, paquete, usuario]) => {
      this.entregas = entrega;
      this.usuarios = usuario;
      this.dataSource.data = this.entregas;
      if (this.dataSource.data.length < 1) {
        Swal.fire({
          title: 'No hay entregas registradas',
          text: 'No se encontraron entregas en el sistema.',
          icon: 'info',
          toast: true,
          showConfirmButton: false,
          timer: 5000,
          position: 'top-end',
          timerProgressBar: true,
          showCloseButton: true
        })
      }
      this.rastreos = rastreo;
      this.paquetes = paquete;
      this.loading = false;
    },
      error => {
        Swal.fire({
          icon: 'error',
          title: 'Error en el servidor',
          text: 'Ha ocurrido un error al comunicarse con el servidor. Por favor, revisa tu conexión a internet o inténtalo nuevamente.',
        })
      });
    this.subscriptions.add(forkJoinSub);
  }

  openImageViewer(imgData: any): void {
    this.dialog.open(this.viewFirma, {
      data: { imgData },
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  viewEntrega(entrega: EntregaInterface): void {
    this.dialog.open(this.viewEntregaDialog, {
      data: entrega,
      width: '35%',
      height: 'auto',
    });
  }

  getEntrega(idEntrega: any): any {
    const entrega = this.entregas.find(tipo => tipo.idEntrega === idEntrega);
    return entrega || '';
  }

  getRastreo(idRastreo: any): any {
    const rastreo = this.rastreos.find(tipo => tipo.idRastreo === idRastreo);
    let paquete = this.getPaquete(rastreo?.idPaquete);
    let usuario = this.getUsuario(rastreo?.idUsuario);

    return { paquete, usuario }
  }


  getPaquete(idPaquete: any): any {
    const paquete = this.paquetes.find(tipo => tipo.idPaquete === idPaquete);
    return paquete || '';
  }

  getUsuario(idUsuario: any) {
    const user = this.usuarios.find(i => i.idUsuario === idUsuario);
    return user || '';
  }

  generateExcel(): void {
    const dataToExport = this.dataSource.data.map(entrega => ({
      'Código paquete': this.getPaquete(this.getRastreo(entrega.idRastreo).paquete.idPaquete).codigoPaquete,
      'Nombre destinatario': this.getPaquete(this.getRastreo(entrega.idRastreo).paquete.idPaquete).nombreDestinatario,
      'Documento destinatario': this.getPaquete(this.getRastreo(entrega.idRastreo).paquete.idPaquete).documentoDestinatario,
      'Dirección destinatario': this.getPaquete(this.getRastreo(entrega.idRastreo).paquete.idPaquete).direccionPaquete + ' - ' + this.getPaquete(this.getRastreo(entrega.idRastreo).paquete.idPaquete).detalleDireccionPaquete,
      'Teléfono destinatario': this.getPaquete(this.getRastreo(entrega.idRastreo).paquete.idPaquete).telefonoDestinatario,
      'Correo destinatario': this.getPaquete(this.getRastreo(entrega.idRastreo).paquete.idPaquete).correoDestinatario,
      'Contenido paquete': this.getPaquete(this.getRastreo(entrega.idRastreo).paquete.idPaquete).contenidoPaquete,
      'Fecha': entrega.fechaEntrega,
      'Mensajero': this.getUsuario(this.getRastreo(entrega.idRastreo).usuario.idUsuario).nombreUsuario + ' ' + this.getUsuario(this.getRastreo(entrega.idRastreo).usuario.idUsuario).apellidoUsuario,
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Entregas');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const excelFileURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = excelFileURL;
    link.download = 'entregas.xlsx';
    link.click();
  }

  generatePDF(): void {
    this.dataToExport = this.dataSource.data.map(entrega => ({
      'Código paquete': this.getPaquete(this.getRastreo(entrega.idRastreo).paquete.idPaquete).codigoPaquete,
      'Nombre destinatario': this.getPaquete(this.getRastreo(entrega.idRastreo).paquete.idPaquete).nombreDestinatario,
      'Documento destinatario': this.getPaquete(this.getRastreo(entrega.idRastreo).paquete.idPaquete).documentoDestinatario,
      'Dirección destinatario': this.getPaquete(this.getRastreo(entrega.idRastreo).paquete.idPaquete).direccionPaquete + ' - ' + this.getPaquete(this.getRastreo(entrega.idRastreo).paquete.idPaquete).detalleDireccionPaquete,
      'Teléfono destinatario': this.getPaquete(this.getRastreo(entrega.idRastreo).paquete.idPaquete).telefonoDestinatario,
      'Correo destinatario': this.getPaquete(this.getRastreo(entrega.idRastreo).paquete.idPaquete).correoDestinatario,
      'Contenido paquete': this.getPaquete(this.getRastreo(entrega.idRastreo).paquete.idPaquete).contenidoPaquete,
      'Fecha': entrega.fechaEntrega,
      'Mensajero': this.getUsuario(this.getRastreo(entrega.idRastreo).usuario.idUsuario).nombreUsuario + ' ' + this.getUsuario(this.getRastreo(entrega.idRastreo).usuario.idUsuario).apellidoUsuario,
    }));

    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Lista de Entregas', style: 'header' },
        {
          style: 'tableExample',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              ['Código paquete', 'Nombre destinatario', 'Documento destinatario', 'Dirección destinatario', 'Telefono destinatario', 'Correo destinatario', 'Contenido paquete', 'Fecha', 'Mensajero'],
              ...this.dataToExport.map(entrega => [
                entrega['Código paquete'],
                entrega['Nombre destinatario'],
                entrega['Documento destinatario'],
                entrega['Dirección destinatario'],
                entrega['Teléfono destinatario'],
                entrega['Correo destinatario'],
                entrega['Contenido paquete'],
                entrega['Fecha'],
                entrega['Mensajero'],
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
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (filterValue === '') {
      this.dataSource.data = this.entregas;
    } else {
      this.dataSource.data = this.entregas.filter(entrega =>
        entrega.fechaEntrega?.toLowerCase().includes(filterValue) ||
          this.getRastreo(entrega.idRastreo).paquete.codigoPaquete.toLowerCase().includes(filterValue) ||
          this.getRastreo(entrega.idRastreo).usuario.nombreUsuario.toLowerCase().includes(filterValue) ||
          this.removeAccents(this.getRastreo(entrega.idRastreo).usuario.nombreUsuario.toLowerCase()).includes(filterValue) ||
          this.getRastreo(entrega.idRastreo).usuario.apellidoUsuario.toLowerCase().includes(filterValue) ||
          this.removeAccents(this.getRastreo(entrega.idRastreo).usuario.apellidoUsuario.toLowerCase()).includes(filterValue) 
      )
    }
  }
}
