import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { TipoDocumentoInterface } from '../../../models/tipo-documento.interface';
import { UsuarioInterface } from '../../../models/usuario.interface';
import { UsuarioService } from '../../../services/api/usuario.service';
import { EstadoUsuarioInterface } from '../../../models/estado-usuario.interface';
import { RolInterface } from '../../../models/rol.interface';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription, forkJoin } from 'rxjs';
import { HasUnsavedChanges } from 'src/app/auth/guards/unsaved-changes.guard';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-usuario',
  templateUrl: './edit-usuario.component.html',
  styleUrls: ['./edit-usuario.component.scss']
})
export class EditUsuarioComponent implements OnInit, HasUnsavedChanges, OnDestroy {

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent) {
    if (this.hasUnsavedChanges()) {
      e.returnValue = '';
    }
  }

  constructor(
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private api: UsuarioService,
  ) { }

  private subscriptions: Subscription = new Subscription();
  dataUsuario: UsuarioInterface[] = [];
  tiposDocumento: TipoDocumentoInterface[] = []
  estadosUsuario: EstadoUsuarioInterface[] = [];

  rolUsuario: RolInterface[] = [];
  loading: boolean = true;

  hasUnsavedChanges(): boolean {
    this.loading = false;
    return this.editForm.dirty || (this.showPasswordChange && this.pwdForm.dirty);
  }

  editForm = new FormGroup({
    idUsuario: new FormControl(''),
    documentoUsuario: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{7,10}$')]),
    idTipoDocumento: new FormControl('', Validators.required),
    nombreUsuario: new FormControl('', Validators.required),
    apellidoUsuario: new FormControl('', Validators.required),
    telefonoUsuario: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
    correoUsuario: new FormControl('', [Validators.required, Validators.pattern('^[\\w.%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
    idRol: new FormControl('', Validators.required),
    idEstado: new FormControl(''),
  });

  pwdForm = new FormGroup({
    contrasenaUsuario: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d.*\d.*\d)(?=.*[!@#$%^&+=?.:,"°~;_¿¡*/{}|<>()]).{8,}$/)]),
  });

  ngOnInit(): void {
    let idUsuario = this.activatedRouter.snapshot.paramMap.get('id');

    const tipoDocumento$ = this.api.getTipoDocumento();
    const estadoUsuario$ = this.api.getEstadoUsuario();
    const rolUsuario$ = this.api.getRolUsuario();
    const oneUsuario$ = this.api.getOneUsuario(idUsuario);

    this.loading = true;

    const forkJoinSub = forkJoin([tipoDocumento$, estadoUsuario$, rolUsuario$, oneUsuario$]).subscribe(
      ([tipoDocumento, estadoUsuario, rolUsuario, oneUsuario]) => {
        this.tiposDocumento = tipoDocumento;
        this.estadosUsuario = estadoUsuario;
        this.rolUsuario = rolUsuario;

        this.dataUsuario = oneUsuario ? [oneUsuario] : [];

        this.editForm.setValue({
          'idUsuario': this.dataUsuario[0]?.idUsuario || '',
          'documentoUsuario': this.dataUsuario[0]?.documentoUsuario || '',
          'idTipoDocumento': this.dataUsuario[0]?.idTipoDocumento || '',
          'nombreUsuario': this.dataUsuario[0]?.nombreUsuario || '',
          'apellidoUsuario': this.dataUsuario[0]?.apellidoUsuario || '',
          'telefonoUsuario': this.dataUsuario[0]?.telefonoUsuario || '',
          'correoUsuario': this.dataUsuario[0]?.correoUsuario || '',
          'idRol': this.dataUsuario[0]?.idRol || '',
          'idEstado': this.dataUsuario[0]?.idEstado || '',
        });
        this.pwdForm.setValue({
          'contrasenaUsuario': this.dataUsuario[0]?.contrasenaUsuario || '',
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
      }
    );
    this.subscriptions.add(forkJoinSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  postForm(id: any) {
    Swal.fire({
      icon: 'question',
      title: '¿Estás seguro de que deseas editar este usuario?',
      showCancelButton: true,
      showCloseButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        const updatedData: UsuarioInterface = {
          ...this.dataUsuario[0],
          ...this.editForm.value,
        };

        if (this.showPasswordChange) {
          updatedData.contrasenaUsuario = this.pwdForm.value.contrasenaUsuario;
        } else {
          delete updatedData.contrasenaUsuario;
        }

        const putUserSub = this.api.putUsuario(updatedData).subscribe(data => {
          if (data.status == 'ok') {
            this.editForm.reset();
            this.pwdForm.reset();
            this.router.navigate(['usuario/list-usuarios']);
            Swal.fire({
              icon: 'success',
              title: 'Modificacion exitosa',
              text: data.msj,
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
        this.subscriptions.add(putUserSub);
      }
    });
  }


  goBack() {
    this.loading = true;
    this.router.navigate(['usuario/list-usuarios']);
  }

  showPassword: boolean = false;
  buttonShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  showPasswordChange: boolean = false;
  togglePasswordChange(event: Event) {
    event.preventDefault();
    this.showPasswordChange = !this.showPasswordChange;
  }
}