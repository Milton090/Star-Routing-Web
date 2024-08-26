import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { PaqueteService } from '../../../services/api/paquete.service';
import { Router } from '@angular/router';
import { PaqueteInterface } from 'src/app/models/paquete.interface';
import { UsuarioInterface } from 'src/app/models/usuario.interface';
import { ClienteInterface } from 'src/app/models/cliente.interface';
import { EstadoPaqueteInterface } from 'src/app/models/estado-paquete.interface';
import { TamanoPaqueteInterface } from 'src/app/models/tamano-paquete.interface';
import { MatDialog } from '@angular/material/dialog';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import * as QRCode from 'qrcode';
import { DomSanitizer } from '@angular/platform-browser';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { TipoPaqueteInterface } from 'src/app/models/tipo-paquete.interface';
import Swal from 'sweetalert2';

import * as XLSX from 'xlsx';
import { FormControl, FormGroup } from '@angular/forms';
import { EntregaService } from 'src/app/services/api/entrega.service';
import { RastreoService } from 'src/app/services/api/rastreo.service';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;



@Component({
  selector: 'app-list-paquetes',
  templateUrl: './list-paquetes.component.html',
  styleUrls: ['./list-paquetes.component.scss']
})
export class ListPaquetesComponent implements OnInit {

  constructor(
    private api: PaqueteService,
    private apiEntregas: EntregaService,
    private apiRastreo: RastreoService,
    private router: Router,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) { }

  paquetes: PaqueteInterface[] = [];
  usuario: UsuarioInterface[] = [];
  entregas: any;
  rastreos: any;
  remitente: ClienteInterface[] = [];
  estadosPaquete: EstadoPaqueteInterface[] = [];
  tamano: TamanoPaqueteInterface[] = [];
  tipos: TipoPaqueteInterface[] = [];
  dataSource = new MatTableDataSource(this.paquetes);
  loading: boolean = true;
  cords: boolean = false;
  estadosFiltro = [
    { value: 1, label: 'Todos' },
    { value: 2, label: 'En bodega' },
    { value: 3, label: 'En ruta' },
    { value: 4, label: 'Entregado' },
    { value: 5, label: 'No entregado' }
  ];
  palFiltro = new FormGroup({
    filtroDeEstados: new FormControl(1)
  });
  fechaActualReal: any = new Date().toISOString().split('T')[0];
  fechaActual: any = new Date().toISOString().split('T')[0];
  melo: boolean = false;


  @ViewChild(MatPaginator) paginator!: MatPaginator; //para la paginacion, y los del ! pal not null
  @ViewChild(MatSort) sort!: MatSort; //para el ordenamiento
  @ViewChild('viewPaqueteDialog') viewPaqueteDialog!: TemplateRef<any>;
  @ViewChild('viewPaquetesEntregadosDialog') viewPaquetesEntregadosDialog!: TemplateRef<any>;
  @ViewChild('viewQR') viewQR!: TemplateRef<any>;


  ngOnInit(): void {
    this.api.getAllPaquetes().subscribe(async data => {
      if (Array.isArray(data)) {

        this.paquetes = data;
        this.dataSource.data = this.paquetes;
        this.paquetes.forEach(async (paquete) => {
          const qrData = [{ 'idPaquete': paquete.idPaquete, 'codigoPaquete': paquete.codigoPaquete }]
          const qrCodeBase64 = await this.generateQRCode(qrData);
          paquete.qrCodeUrl = this.sanitizer.bypassSecurityTrustUrl(qrCodeBase64);
        });
      }
      this.loading = false;
    });

    this.apiRastreo.getAllRastreos().subscribe(data => {
      this.rastreos = data;
      this.loading = false;
    });

    this.apiEntregas.getAllEntregas().subscribe(data => {
      this.entregas = data;
      this.loading = false;
    });

    this.api.getUsuario().subscribe(data => {
      this.usuario = data;
      this.loading = false;
    });

    this.api.getRemitenteAndDestinatario().subscribe(data => {
      this.remitente = data;
      this.loading = false;
    });

    this.api.getEstadoPaquete().subscribe(data => {
      this.estadosPaquete = data;
      this.loading = false;
    });

    this.api.getTamanoPaquete().subscribe(data => {
      this.tamano = data;
      this.loading = false;
    });

    this.api.getTipoPaquete().subscribe(data => {
      this.tipos = data;
      this.loading = false;
    });

    this.palFiltro.get('filtroDeEstados')?.valueChanges.subscribe((value) => {

      switch (value) {
        case 1:
          this.dataSource.data = this.paquetes;
          break;
        case 2:
          this.dataSource.data = this.paquetes;
          this.dataSource.data = this.dataSource.data.filter(filtro => filtro.idEstado == 1);
          break;
        case 3:
          this.dataSource.data = this.paquetes;
          this.dataSource.data = this.dataSource.data.filter(filtro => filtro.idEstado == 2);
          break;
        case 4:
          this.dataSource.data = this.paquetes;
          this.dataSource.data = this.dataSource.data.filter(filtro => filtro.idEstado == 3);
          break;
        case 5:
          this.dataSource.data = this.paquetes;
          this.dataSource.data = this.dataSource.data.filter(filtro => filtro.idEstado == 4);
          break;
      }
    });

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openQrDialog(qrCodeUrl: string): void {
    this.dialog.open(this.viewQR, {
      data: { qrCodeUrl },
    });
  }

  viewPaquete(paquete: PaqueteInterface): void {
    this.dialog.open(this.viewPaqueteDialog, {
      data: paquete,
      width: '35%',
      height: '600px',
    });
  }

  viewPaquetesEntregados(): void {
    this.dialog.open(this.viewPaquetesEntregadosDialog, {
      width: '35%',
      height: 'auto',
    });
  }

  async generateQRCode(data: any): Promise<string> {
    try {
      const jsonStr = JSON.stringify(data);
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, jsonStr);
      const qrCodeBase64 = canvas.toDataURL('image/png');
      return qrCodeBase64;
    } catch (error) {
      throw error;
    }
  }

  editPaquete(id: any) {
    this.loading = true;
    this.router.navigate(['paquete/edit-paquete', id]);
  }

  newPaquete() {
    this.loading = true;
    this.router.navigate(['paquete/new-paquete']);
  }

  deletePaquete(id: any): void {
    Swal.fire({
      icon: 'question',
      title: '¿Estás seguro de que deseas eliminar este paquete?',
      showDenyButton: true,
      showCancelButton: true,
      showConfirmButton: false,
      reverseButtons: true,
      denyButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isDenied) {
        this.loading = true;
        this.api.deletePaquete(id).subscribe(data => {
          if (data.status == 'ok') {
            this.paquetes = this.paquetes.filter(paquete => paquete.idPaquete !== id);
            this.dataSource.data = this.paquetes; //actualizamos el datasource
            Swal.fire({
              icon: 'success',
              title: 'Paquete eliminado',
              text: 'El paquete ha sido eliminado exitosamente.',
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
              title: 'Error en la eliminación',
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


  getUsuarioPaquete(idUsuario: any): { nombre: string, apellido: string } {
    const mensajero = this.usuario.find(documentoU => documentoU.idUsuario == idUsuario);
    if (mensajero && mensajero.nombreUsuario && mensajero.apellidoUsuario) {
      return { nombre: mensajero.nombreUsuario, apellido: mensajero.apellidoUsuario };
    }
    return { nombre: '', apellido: '' };
  }

  getRemitentePaquete(documentoRemitente: any): { nombre: string, telefono: string, correo: string } {
    const remitente = this.remitente.find(documentoR => documentoR.documentoCliente === documentoRemitente);
    if (remitente && remitente.nombreCliente && remitente.telefonoCliente && remitente.correoCliente) {
      return { nombre: remitente.nombreCliente, telefono: remitente.telefonoCliente, correo: remitente.correoCliente };
    }
    return { nombre: '', telefono: '', correo: '' };
  }

  getEstadoPaquete(idEstado: any): string {
    const estadoPaquete = this.estadosPaquete.find(estado => estado.idEstado === idEstado);
    return estadoPaquete?.estadoPaquete || '';
  }

  getTamanoPaquete(idTamano: any): string {
    const tamanoPaquete = this.tamano.find(tam => tam.idTamano === idTamano);
    return tamanoPaquete?.tamanoPaquete || '';
  }

  getTipoPaquete(idTipo: any): string {
    const tipoPaquete = this.tipos.find(tip => tip.idTipo === idTipo);
    return tipoPaquete?.tipoPaquete || '';
  }

  getPaquetesEntregados(idUsuario: any): any {
    let cont = 0;
    for (let i = 0; i < this.rastreos.length; i++) {
      if (this.rastreos[i].idUsuario == idUsuario && this.rastreos[i].idEstado == 1) {
        for (let j = 0; j < this.entregas.length; j++) {
          if (this.rastreos[i].idRastreo == this.entregas[j].idRastreo && this.entregas[j].fechaEntrega.split(' ')[0] == this.fechaActual) {
            cont++;
          }
        }
      }
    }
    return cont;
  }

  cambiarFecha(): void {
    const fechaIngresada = new Date(this.fechaActual);
    const fechaActual = new Date();
    if (fechaIngresada >= fechaActual) {
      this.fechaActual = fechaActual.toISOString().split('T')[0];
    } else {
      this.fechaActual = fechaIngresada.toISOString().split('T')[0];
    }
    if (this.fechaActualReal <= this.fechaActual) {
      this.melo = false;
    } else {
      this.melo = true;
    }
  }

  moverFecha(dias: number): void {
    this.fechaActual = new Date(new Date(this.fechaActual).setDate(new Date(this.fechaActual).getDate() + dias)).toISOString().split('T')[0];
    if (this.fechaActualReal <= this.fechaActual) {
      this.melo = false;
    } else {
      this.melo = true;
    }
  }

  async generatePDF(idPaquete: string): Promise<void> {
    const paquete = this.paquetes.find((paquete) => paquete.idPaquete === idPaquete);

    if (paquete && paquete.qrCodeUrl) {
      try {

        const qrCodePromises = this.paquetes.map(async (p) => {
          if (p.idPaquete !== undefined && p.codigoPaquete !== undefined) {
            const qrData = [{ 'idPaquete': p.idPaquete, 'codigoPaquete': p.codigoPaquete }];
            p.qrCodeUrl = await this.generateQRCode(qrData);
          }
        });
        await Promise.all(qrCodePromises);
        const docDefinition: TDocumentDefinitions = {
          content: [
            { text: 'Registro de paquete', style: 'header' },
            {
              style: 'tableExample',
              table: {
                widths: ['50%', '50%'],
                heights: (index) => (index === 9 ? 150 : 30),
                body: [
                  ['Código paquete', paquete.codigoPaquete],
                  ['Remitente', this.getRemitentePaquete(paquete.documentoRemitente).nombre],
                  ['Destinatario', paquete.nombreDestinatario],
                  ['Teléfono destinatario', paquete.telefonoDestinatario],
                  ['Correo destinatario', paquete.correoDestinatario],
                  ['Dirección destinatario', paquete.direccionPaquete],
                  ['Detalle dirección', paquete.detalleDireccionPaquete],
                  ['Peso paquete', paquete.pesoPaquete + ' kg'],
                  ['Contenido paquete', paquete.contenidoPaquete],
                  [
                    { text: 'Código QR', style: 'subheader' },
                    { image: paquete.qrCodeUrl.toString(), width: 100, height: 100, alignment: 'center' }
                  ]
                ] as any[][]
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
            subheader: {
              fontSize: 14,
              margin: [0, 10, 0, 5]
            },
            tableExample: {
              margin: [0, 5, 0, 15]
            }
          },
          pageOrientation: 'landscape',
          pageBreakBefore: (currentNode, followingNodesOnPage) => {
            return currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0 && currentNode.startPosition.top >= 750;
          }
        };

        const pdfDocGenerator = pdfMake.createPdf(docDefinition);
        pdfDocGenerator.getBlob((blob: Blob) => {
          const pdfBlobUrl = URL.createObjectURL(blob);
          window.open(pdfBlobUrl, '_blank');
        });
      } catch (error) {
      }
    }
  }

  generateExcel(): void {
    const dataToExport = this.dataSource.data.map(paquete => ({
      'Código paquete': paquete.codigoPaquete,
      'Mensajero': paquete.idUsuario ? this.getUsuarioPaquete(paquete.idUsuario).nombre + ' ' + this.getUsuarioPaquete(paquete.idUsuario).apellido : 'SIN ASIGNAR',
      'Remitente': this.getRemitentePaquete(paquete.documentoRemitente).nombre,
      'Destinatario': paquete.nombreDestinatario,
      'Teléfono destinatario': paquete.telefonoDestinatario,
      'Correo destinatario': paquete.correoDestinatario,
      'Dirección destinatario': paquete.direccionPaquete,
      'Detalle dirección': paquete.detalleDireccionPaquete,
      'Peso paquete': paquete.pesoPaquete + ' kg',
      'Contenido paquete': paquete.contenidoPaquete,
      'Estado': this.getEstadoPaquete(paquete.idEstado),
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Paquetes');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const excelFileURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = excelFileURL;
    link.download = 'paquetes.xlsx';
    link.click();
  }

  removeAccents(cadena: string): string {
    return cadena.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (filterValue === '') {
      this.dataSource.data = this.paquetes;
    } else {
      this.dataSource.data = this.paquetes.filter(paquete =>
        paquete.codigoPaquete.toLowerCase().includes(filterValue) ||
        this.removeAccents(paquete.codigoPaquete).toLowerCase().includes(filterValue) ||
        this.getUsuarioPaquete(paquete.idUsuario).nombre.toLowerCase().includes(filterValue) ||
        this.removeAccents(this.getUsuarioPaquete(paquete.idUsuario).nombre).toLowerCase().includes(filterValue) ||
        this.getUsuarioPaquete(paquete.idUsuario).apellido.toLowerCase().includes(filterValue) ||
        this.removeAccents(this.getUsuarioPaquete(paquete.idUsuario).apellido).toLowerCase().includes(filterValue) ||
        this.getTipoPaquete(paquete.idTipo).toLowerCase().includes(filterValue) ||
        this.removeAccents(this.getTipoPaquete(paquete.idTipo)).toLowerCase().includes(filterValue) ||
        this.getRemitentePaquete(paquete.documentoRemitente).nombre.toLowerCase().includes(filterValue) ||
        this.removeAccents(this.getRemitentePaquete(paquete.documentoRemitente).nombre).toLowerCase().includes(filterValue)
      )
    }
  }
}