import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { RolService } from '../../../services/api/rol.service';
import { RolInterface } from '../../../models/rol.interface';
import { PermisoInterface } from 'src/app/models/permiso.interface';
import { RolPermisoInterface } from 'src/app/models/rol-permiso.interface';
import { HasUnsavedChanges } from 'src/app/auth/guards/unsaved-changes.guard';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-rol',
  templateUrl: './new-rol.component.html',
  styleUrls: ['./new-rol.component.scss']
})
export class NewRolComponent implements OnInit, HasUnsavedChanges {

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent) {
    if (this.hasUnsavedChanges()) {
      e.returnValue = '';
    }
  }

  constructor(
    private router: Router,
    private api: RolService,
  ) { }

  permisos: PermisoInterface[] = [];
  loading: boolean = true;

  hasUnsavedChanges(): boolean {
    this.loading = false;
    return this.newForm.dirty;
  }

  newForm = new FormGroup({
    nombreRol: new FormControl('', Validators.required),
    permisosSeleccionados: new FormArray(<any>[])
  });


  updateAllCheckboxes(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.checked;

    this.permisosSeleccionadosFormArray.controls.forEach((control) => {
      control.patchValue(value);
    });
  }

  get permisosSeleccionadosFormArray() {
    return this.newForm.get('permisosSeleccionados') as FormArray;
  }

  ngOnInit(): void {
    this.getPermisos();
  }

  getPermisos(): void {
    this.api.getAllPermisos().subscribe(data => {
      this.permisos = data;
      this.permisos.forEach(() => {
        const control = new FormControl(false);
        (this.newForm.controls.permisosSeleccionados as FormArray<any>).push(control);
      });
      this.loading = false;
    });
  }


  postForm(form: RolInterface) {
    Swal.fire({
      icon: 'question',
      title: '¿Estás seguro de que deseas crear este rol?',
      showCancelButton: true,
      showCloseButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        const permisosSeleccionados = this.newForm.value.permisosSeleccionados;
        if (permisosSeleccionados.filter((permiso: boolean) => permiso).length < 1) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Debes seleccionar al menos un permiso.',
          });
          return;
        }
        this.loading = true;
        this.api.postRol(form).subscribe(data => {
          if (data.status == 'ok') {
            this.newForm.reset();
            this.router.navigate(['rol/list-roles']);
            Swal.fire({
              icon: 'success',
              title: 'Rol creado',
              text: 'El rol ha sido creado exitosamente.',
              toast: true,
              showConfirmButton: false,
              timer: 5000,
              position: 'top-end',
              timerProgressBar: true,
              showCloseButton: true,
            });

            this.api.getLastRolId().subscribe(data => {
              const idRol = data;

              permisosSeleccionados.forEach((permisoSeleccionado: boolean, index: number) => {
                if (permisoSeleccionado) {
                  const permisoId = this.permisos[index].idPermiso;
                  const rolPermiso: RolPermisoInterface = {
                    idRol: idRol,
                    idPermiso: permisoId
                  };

                  this.api.guardarRolPermiso(rolPermiso).subscribe();
                }
              });
            });

          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al crear',
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

  goBack() {
    this.loading = true;
    this.router.navigate(['rol/list-roles']);
  }

}