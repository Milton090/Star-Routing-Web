import { Component, ElementRef, HostListener, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PaqueteService } from '../../../services/api/paquete.service';
import { PaqueteInterface } from '../../../models/paquete.interface';
import { TamanoPaqueteInterface } from 'src/app/models/tamano-paquete.interface';
import { MatDialog } from '@angular/material/dialog';
import { AddClienteComponent } from '../add-cliente/add-cliente.component';
import { TipoPaqueteInterface } from 'src/app/models/tipo-paquete.interface';
import { HasUnsavedChanges } from 'src/app/auth/guards/unsaved-changes.guard';
import { ClienteService } from 'src/app/services/api/cliente.service';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-new-paquete',
  templateUrl: './new-paquete.component.html',
  styleUrls: ['./new-paquete.component.scss']
})
export class NewPaqueteComponent implements OnInit, HasUnsavedChanges {

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
    private api: PaqueteService,
    private apiClient: ClienteService,
    private dialog: MatDialog,
    private paqueteService: PaqueteService,
    private renderer: Renderer2,
  ) { }

  hasUnsavedChanges(): boolean {
    this.loading = false;
    return this.newForm.dirty || this.editRemitente.dirty;
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

  newForm = new FormGroup({
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
    documentoRemitente: new FormControl(''),
    idTamano: new FormControl(),
    idEstado: new FormControl(1),
    idTipo: new FormControl('', Validators.required),
    lat: new FormControl(),
    lng: new FormControl(),
  });

  getFechAct() {
    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    return `${year}-${month}-${day}`;
  }

  remitente: any[] = [];
  tamanos: TamanoPaqueteInterface[] = [];
  tipos: TipoPaqueteInterface[] = [];
  loading: boolean = true;
  filtrarCliente: Observable<any[]> = new Observable<any[]>();
  filtrarDestinatario: Observable<any[]> = new Observable<any[]>();

  @ViewChild('viewMap') viewMap!: TemplateRef<any>;

  ngOnInit(): void {
    this.randomCode();
    this.api.getRemitenteAndDestinatario().subscribe(data => {
      this.remitente = data;
      this.loading = false;

      if (data.length == 0) {
        Swal.fire({
          icon: 'warning',
          title: 'No hay clientes registrados',
          text: 'No se encontraron clientes en el sistema, Por favor, registra uno a continuación.',
          confirmButtonText: 'Registrar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.openAddClienteDialog();
          }
        });
        return;
      }
    },
      (error) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error en el servidor',
          text: 'Ha ocurrido un error al comunicarse con el servidor. Por favor, revisa tu conexión a internet o inténtalo nuevamente.',
        });
      });
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
          this.newForm.patchValue({
            documentoRemitente: data.documento
          });
        });
      }
    });

    this.newForm.get('documentoDestinatario')?.valueChanges.subscribe(value => {
      if (this.newForm.get('documentoDestinatario')?.valid) {
        this.paqueteService.getDataDestinatario(value).subscribe(data => {
          this.newForm.patchValue({
            direccionPaquete: data.direccion,
            detalleDireccionPaquete: data.detalleDireccion,
            nombreDestinatario: data.nombre,
            correoDestinatario: data.correo,
            telefonoDestinatario: data.telefono,
            lat: data.lat,
            lng: data.lng
          });
        });
      }
    });

    this.filtrarCliente = this.editRemitente.get('documentoCliente')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCliente(value || ''))
    );

    this.filtrarDestinatario = this.newForm.get('documentoDestinatario')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterDestinatario(value || ''))
    );
  }

  ngAfterViewInit() {
    this.mapInput();
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

  postForm(form: PaqueteInterface) {
    Swal.fire({
      icon: 'question',
      title: '¿Estás seguro de que deseas registrar este paquete?',
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.api.postPaquete(form).subscribe(data => {
          if (data.status == 'ok') {
            this.newForm.reset();
            this.editRemitente.reset();
            this.router.navigate(['paquete/list-paquetes']);
            Swal.fire({
              icon: 'success',
              title: 'Paquete registrado',
              text: 'El paquete ha sido registrado exitosamente.',
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
              title: 'Error al registrar el paquete',
              text: data.msj,
            });
            this.loading = false;
          }
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
        // actualizamos la info de remitente y destinatario
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


  randomCode() {
    const long = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let random = "";
    for (let i = 0; i < 6; i++) {
      random += long.charAt(Math.floor(Math.random() * long.length));
    }
    this.newForm.patchValue({ codigoPaquete: random });
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
            this.newForm.patchValue({
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

    if (this.newForm.value.lat == null || this.newForm.value.lng == null) {
      mapOptions = {
        center: { lat: 6.25670, lng: -75.57496 },
        zoom: 11,
      };
    } else {
      mapOptions = {
        center: { lat: this.newForm.value.lat, lng: this.newForm.value.lng },
        zoom: 15,
      }

      selectedLocation = new google.maps.LatLng(this.newForm.value.lat, this.newForm.value.lng);
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
              this.newForm.patchValue({
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
