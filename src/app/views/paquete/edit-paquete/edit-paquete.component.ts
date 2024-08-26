import { Component, ElementRef, HostListener, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { PaqueteInterface } from '../../../models/paquete.interface';
import { PaqueteService } from '../../../services/api/paquete.service';
import { TamanoPaqueteInterface } from 'src/app/models/tamano-paquete.interface';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AddClienteComponent } from '../add-cliente/add-cliente.component';
import { TipoPaqueteInterface } from 'src/app/models/tipo-paquete.interface';
import { HasUnsavedChanges } from 'src/app/auth/guards/unsaved-changes.guard';
import { ClienteService } from 'src/app/services/api/cliente.service';
import { Observable, Subscription, map, startWith } from 'rxjs';
import Swal from 'sweetalert2';
import { EstadoPaqueteInterface } from 'src/app/models/estado-paquete.interface';


@Component({
  selector: 'app-edit-paquete',
  templateUrl: './edit-paquete.component.html',
  styleUrls: ['./edit-paquete.component.scss']
})
export class EditPaqueteComponent implements OnInit, HasUnsavedChanges {

  @ViewChild('inputPlaces') inputPlaces!: ElementRef;

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent) {
    if (this.hasUnsavedChanges()) {
      e.returnValue = '';
    }
  }

  private subscriptions: Subscription = new Subscription();
  directionService = new google.maps.DirectionsService();
  origin: google.maps.LatLng = new google.maps.LatLng(6.29051, -75.57353);

  constructor(
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private api: PaqueteService,
    private paqueteService: PaqueteService,
    private apiClient: ClienteService,
    private dialog: MatDialog,
    private renderer: Renderer2,
  ) { }

  hasUnsavedChanges(): boolean {
    this.loading = false;
    return this.editForm.dirty || this.editRemitente.dirty;
  }

  editRemitente = new FormGroup({
    idCliente: new FormControl(),
    documentoCliente: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{7,10}$')]),
    idTipoDocumento: new FormControl('', Validators.required),
    nombreCliente: new FormControl('', Validators.required),
    telefonoCliente: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
    correoCliente: new FormControl('', [Validators.required, Validators.pattern('^[\\w.%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
    direccionCliente: new FormControl('', Validators.required),
    detalleDireccionCliente: new FormControl(''),
    lat: new FormControl(),
    lng: new FormControl(),
  });

  editForm = new FormGroup({
    idPaquete: new FormControl(),
    codigoPaquete: new FormControl(''),
    direccionPaquete: new FormControl('', Validators.required),
    detalleDireccionPaquete: new FormControl(''),
    pesoPaquete: new FormControl('', [Validators.required, Validators.pattern('^\\d{0,3}(\\.\\d{0,2})?$')]),
    contenidoPaquete: new FormControl('', Validators.required),
    documentoDestinatario: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{7,10}$')]),
    nombreDestinatario: new FormControl('', Validators.required),
    correoDestinatario: new FormControl('', [Validators.required, Validators.pattern('^[\\w.%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
    telefonoDestinatario: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
    fechaAproxEntrega: new FormControl('', [Validators.required, this.validateFechaPasada]),
    documentoRemitente: new FormControl('', Validators.required),
    idTamano: new FormControl(),
    idEstado: new FormControl('', Validators.required),
    idTipo: new FormControl('', Validators.required),
    lat: new FormControl(),
    lng: new FormControl(),
  })

  getFechAct() {
    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    return `${year}-${month}-${day}`;
  }

  validateFechaPasada(control: FormControl): { [key: string]: boolean } | null {
    const fechaSeleccionada = control.value;
    const fechaActual = new Date();

    fechaActual.setHours(0, 0, 0, 0);

    const fechaSeleccionadaSinHora = new Date(fechaSeleccionada);
    fechaSeleccionadaSinHora.setHours(0, 0, 0, 0);

    fechaSeleccionadaSinHora.setDate(fechaSeleccionadaSinHora.getDate() + 1);

    if (fechaSeleccionadaSinHora < fechaActual) {
      return { fechaPasada: true };
    }

    return null;
  }

  dataPaquete: PaqueteInterface[] = [];
  remitente: any[] = [];
  tamanos: TamanoPaqueteInterface[] = [];
  estadosPaquete: EstadoPaqueteInterface[] = [];
  tipos: TipoPaqueteInterface[] = [];
  loading: boolean = true;
  filtrarCliente: Observable<any[]> = new Observable<any[]>();
  filtrarDestinatario: Observable<any[]> = new Observable<any[]>();

  @ViewChild('viewMap') viewMap!: TemplateRef<any>;

  ngOnInit(): void {
    let idPaquete = this.activatedRouter.snapshot.paramMap.get('id');
    this.api.getOnePaquete(idPaquete).subscribe(data => {
      this.dataPaquete = data ? [data] : [];
      this.editForm.setValue({
        'idPaquete': this.dataPaquete[0]?.idPaquete || 'idPaquete',
        'codigoPaquete': this.dataPaquete[0]?.codigoPaquete || 'codigoPaquete',
        'direccionPaquete': this.dataPaquete[0]?.direccionPaquete || '',
        'detalleDireccionPaquete': this.dataPaquete[0]?.detalleDireccionPaquete || '',
        'pesoPaquete': this.dataPaquete[0]?.pesoPaquete || '',
        'contenidoPaquete': this.dataPaquete[0]?.contenidoPaquete || '',
        'documentoDestinatario': this.dataPaquete[0]?.documentoDestinatario || '',
        'nombreDestinatario': this.dataPaquete[0]?.nombreDestinatario || '',
        'correoDestinatario': this.dataPaquete[0]?.correoDestinatario || '',
        'telefonoDestinatario': this.dataPaquete[0]?.telefonoDestinatario || '',
        'fechaAproxEntrega': this.dataPaquete[0]?.fechaAproxEntrega || '',
        'documentoRemitente': this.dataPaquete[0]?.documentoRemitente || '',
        'idTamano': this.dataPaquete[0]?.idTamano,
        'idEstado': this.dataPaquete[0]?.idEstado || 'idEstado',
        'idTipo': this.dataPaquete[0]?.idTipo || 'idTipo',
        'lat': this.dataPaquete[0]?.lat || '',
        'lng': this.dataPaquete[0]?.lng || ''
      });
      this.editRemitente.patchValue({
        'documentoCliente': this.dataPaquete[0]?.documentoRemitente || ''
      });
      this.loading = false;
    });
    this.getRemitenteAndDestinatarioPaquete();
    this.getEstadoPaquete();
    this.getTamanoPaquete();
    this.getTipoPaquete();

    this.editRemitente.get('documentoCliente')?.valueChanges.subscribe(value => {
      if (this.editRemitente.get('documentoCliente')?.valid) {
        this.paqueteService.getDataRemitente(value).subscribe(data => {
          this.editRemitente.patchValue({
            idCliente: data.idCliente,
            idTipoDocumento: data.idTipoDocumento,
            nombreCliente: data.nombre,
            correoCliente: data.correo,
            telefonoCliente: data.telefono,
            direccionCliente: data.direccion,
            detalleDireccionCliente: data.detalleDireccion,
            lat: data.lat,
            lng: data.lng
          });
          this.editForm.patchValue({
            documentoRemitente: data.documento
          });
        });
      }
    });

    this.editForm.get('documentoDestinatario')?.valueChanges.subscribe(value => {
      if (this.editForm.get('documentoDestinatario')?.dirty && this.editForm.get('documentoDestinatario')?.valid) {
        this.api.getDataDestinatario(value).subscribe(data => {
          if (data.documento == this.editForm.get('documentoDestinatario')?.value) {
            this.editForm.patchValue({
              direccionPaquete: data.direccion,
              detalleDireccionPaquete: data.detalleDireccion,
              nombreDestinatario: data.nombre,
              correoDestinatario: data.correo,
              telefonoDestinatario: data.telefono,
              lat: data.lat,
              lng: data.lng
            });
          }
        });
      }
    });

    this.filtrarCliente = this.editRemitente.get('documentoCliente')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCliente(value || ''))
    );

    this.filtrarDestinatario = this.editForm.get('documentoDestinatario')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterDestinatario(value || ''))
    );
  }

  private _filterCliente(value: any) {
    const filterValue = value;

    return this.remitente.filter(option => {
      let documentoCliente = BigInt(option.documentoCliente);
      return documentoCliente.toString().includes(filterValue);
    });
  }

  private _filterDestinatario(value: any) {
    const filterValue2 = value;

    return this.remitente.filter(option => {
      let documentoDestinatario = BigInt(option.documentoCliente);
      return documentoDestinatario.toString().includes(filterValue2);
    });
  }

  ngAfterViewInit() {
    this.mapInput();
  }

  postForm(id: any) {
    Swal.fire({
      icon: 'question',
      title: '¿Estás seguro de que deseas modificar este paquete?',
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.api.putPaquete(id).subscribe(data => {
          if (data.status == 'ok') {
            this.editRemitente.reset();
            this.editForm.reset();
            this.router.navigate(['paquete/list-paquetes']);
            Swal.fire({
              icon: 'success',
              title: 'Paquete modificado',
              text: 'El paquete ha sido modificado exitosamente.',
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
              title: 'Error al modificar',
              text: data.msj,
            });
            this.loading = false;
          }
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

  editRemi(id: any): void {
    if (this.editRemitente.get('telefonoCliente')?.dirty || this.editRemitente.get('correoCliente')?.dirty) {
      Swal.fire({
        title: '¿Deseas modificar el correo y/o el teléfono de este remitente?',
        icon: 'question',
        showCancelButton: true,
        reverseButtons: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          this.loading = true;
          const putCltSub = this.apiClient.putCliente(id).subscribe((data) => {
            Swal.fire({
              icon: data.status == "ok" ? 'success' : 'error',
              title: data.status == "ok" ? 'Remitente modificado' : 'Error al modificar el remitente',
              text: data.msj,
            });
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
          this.subscriptions.add(putCltSub);
        }
      });
    } else {
      if (!this.editRemitente.get('nombreCliente')?.value || !this.editRemitente.get('direccionCliente')?.value) {
        Swal.fire({
          icon: 'warning',
          title: 'Modificación cancelada',
          text: 'No se han realizado cambios en los campos correo y/o teléfono.',
          toast: true,
          timerProgressBar: true,
          showConfirmButton: false,
          showCloseButton: true,
          timer: 5000,
          position: 'top-end'
        })
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Modificación cancelada',
          text: 'No se han realizado cambios en los campos correo y/o teléfono.',
          toast: true,
          timerProgressBar: true,
          showConfirmButton: false,
          showCloseButton: true,
          timer: 5000,
          position: 'top-end'
        })
      }
    }
  }

  async getRemitenteAndDestinatarioPaquete(): Promise<void> {
    try {
      this.loading = true;

      const data = await this.api.getRemitenteAndDestinatario().toPromise();

      this.remitente = [];

      if (data) {
        this.remitente = data;
      }

      this.loading = false;
    } catch (error) {
      this.loading = false;
      Swal.fire({
        icon: 'error',
        title: 'Error en el servidor',
        text: 'Ha ocurrido un error al comunicarse con el servidor. Por favor, revisa tu conexión a internet o inténtalo nuevamente',
      });
    }
  }

  getEstadoPaquete(): void {
    this.api.getEstadoPaquete().subscribe(data => {
      this.estadosPaquete = data;
      this.loading = false;
    });
  }

  getTamanoPaquete(): void {
    this.api.getTamanoPaquete().subscribe(data => {
      this.tamanos = data;
      this.loading = false;
    });
  }

  getTipoPaquete(): void {
    this.api.getTipoPaquete().subscribe(data => {
      this.tipos = data;
      this.loading = false;
    });
  }

  openAddClienteDialog(): void {
    const dialogRef = this.dialog.open(AddClienteComponent, {
      width: '70%',
      height: 'auto',
      disableClose: true,
      autoFocus: false,

    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.getRemitenteAndDestinatario().subscribe(data => {
          this.remitente = data;
        })
      }
    });
  }

  goBack() {
    this.loading = true;
    this.router.navigate(['paquete/list-paquetes']);
  }

  openMapDialog() {
    const dialogRef = this.dialog.open(this.viewMap, {
      width: '500px',
    });

    dialogRef.afterOpened().subscribe(() => {
      this.initMap();
    });
  }


  private mapInput() {
    const autocomplete = new google.maps.places.Autocomplete(this.renderer.selectRootElement(this.inputPlaces.nativeElement), {
      componentRestrictions: {
        country: ["CO"]
      },
      fields: ["formatted_address", "geometry"],
      types: ["address"]
    });


    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      const place: any = autocomplete.getPlace();
      if (place) {
        const selectedAddress = place.formatted_address;
        const LatLng = place.geometry.location;

        this.directionService.route({
          origin: this.origin,
          destination: LatLng,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING,
        }, async (response: any, status: any) => {
          if (status === google.maps.DirectionsStatus.OK) {
            const route = response.routes[0];
            const legs = route.legs;
            const leg = legs[0];
            this.editForm.patchValue({
              direccionPaquete: selectedAddress,
              lat: leg.end_location.lat(),
              lng: leg.end_location.lng()
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al obtener la dirección',
              text: 'No se ha podido obtener la dirección seleccionada. Por favor, revisa tu conexión a internet o inténtalo nuevamente.',
            });
          }
        })
      }
    });
  }

  initMap() {

    let mapOptions: any;
    let map!: google.maps.Map;
    let selectedLocation: google.maps.LatLng;
    let selectedLocationMarker: google.maps.Marker | null = null;

    if (this.editForm.value.lat == null || this.editForm.value.lng == null) {
      mapOptions = {
        center: { lat: 6.25670, lng: -75.57496 },
        zoom: 11,
      };
    } else {
      mapOptions = {
        center: { lat: this.editForm.value.lat, lng: this.editForm.value.lng },
        zoom: 15,
      }

      selectedLocation = new google.maps.LatLng(this.editForm.value.lat, this.editForm.value.lng);
    }


    map = new google.maps.Map(document.getElementById('map')!, mapOptions);

    function addSelectedLocationMarker() {
      if (selectedLocation) {
        selectedLocationMarker = new google.maps.Marker({
          position: selectedLocation,
          map: map,
          title: 'Ubicación seleccionada',
        });
      }
    }

    addSelectedLocationMarker();

    // Crea un objeto de geocodificación inversa
    const geocoder = new google.maps.Geocoder();

    // Agrega un evento click al mapa
    google.maps.event.addListener(map, 'click', (event: google.maps.MapMouseEvent) => {
      selectedLocation = new google.maps.LatLng(event.latLng!.lat(), event.latLng!.lng());

      // Realiza la geocodificación inversa para obtener la dirección
      geocoder.geocode({ location: selectedLocation }, (results, status) => {
        if (status === 'OK' && results![0]) {
          const formattedAddress = results![0].formatted_address;
          const LatLng = results![0].geometry.location;

          this.directionService.route({
            origin: this.origin,
            destination: LatLng,
            optimizeWaypoints: true,
            travelMode: google.maps.TravelMode.DRIVING,
          }, async (response: any, status: any) => {
            if (status === google.maps.DirectionsStatus.OK) {
              const route = response.routes[0];
              const legs = route.legs;
              const leg = legs[0];
              this.editForm.patchValue({
                direccionPaquete: formattedAddress,
                lat: leg.end_location.lat(),
                lng: leg.end_location.lng()
              });
            }
          })


          if (selectedLocationMarker) {
            selectedLocationMarker.setMap(null);
          }

          addSelectedLocationMarker();

        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error al obtener la dirección',
            text: 'No se ha podido obtener la dirección seleccionada. Por favor, revisa tu conexión a internet o inténtalo nuevamente.',
          });
        }
      });
    });
  }
}
