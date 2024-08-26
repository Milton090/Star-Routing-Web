import { Component, HostListener, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RolInterface } from '../../../models/rol.interface';
import { RolService } from '../../../services/api/rol.service';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { PermisoInterface } from 'src/app/models/permiso.interface';
import { RolPermisoInterface } from 'src/app/models/rol-permiso.interface';
import { HasUnsavedChanges } from 'src/app/auth/guards/unsaved-changes.guard';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-rol',
  templateUrl: './edit-rol.component.html',
  styleUrls: ['./edit-rol.component.scss']
})
export class EditRolComponent implements OnInit, HasUnsavedChanges {

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent) {
    if (this.hasUnsavedChanges()) {
      e.returnValue = '';
    }
  }

  constructor(
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private api: RolService,
    private formBuilder: FormBuilder,
  ) { }

  dataRol: RolInterface[] = [];
  permisos: PermisoInterface[] = []; // pa almacenar los permisos asociados al rol
  permisosSeleccionados: string[] = []; // pa almacenar los permisos seleccionados
  loading: boolean = true;

  hasUnsavedChanges(): boolean {
    this.loading = false;
    return this.editForm.dirty;
  }


  updateAllCheckboxes(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.checked;

    this.permisosSeleccionados = [];

    this.permisosSeleccionadosFormArray.controls.forEach((control, index) => {
      control.patchValue(value);
      const permiso = this.permisos[index];
      if (value) {
        this.permisosSeleccionados.push(permiso.nombrePermiso);
      }
    });
  }


  editForm = new FormGroup({
    idRol: new FormControl(''),
    nombreRol: new FormControl('', Validators.required),
    permisosSeleccionados: new FormArray(<any>[])
  });

  ngOnInit(): void {
    let idRol = this.activatedRouter.snapshot.paramMap.get('id');
    this.api.getOneRol(idRol).subscribe(data => {
      this.dataRol = data ? [data] : [];
      this.editForm.patchValue({
        idRol: this.dataRol[0]?.idRol || 'idRol',
        nombreRol: this.dataRol[0]?.nombreRol || '',
      });
      this.loading = false;
    });

    this.api.getAllPermisos().subscribe((data) => {
      this.permisos = data;
      this.permisos.forEach(() => {
        this.permisosSeleccionadosFormArray.push(this.formBuilder.control(false));
      });
      this.loading = false;
    });


    this.api.getRolPermisos(idRol).subscribe(data => {  // Obtener los permisos asociados al rol y marcar los checkboxes correspondientes
      this.loading = true;
      const permisos: PermisoInterface[] = data.idPermiso
        ? data.idPermiso.filter((rolPermiso: RolPermisoInterface | null | undefined) => rolPermiso !== null && rolPermiso !== undefined)
          .map((rolPermiso: RolPermisoInterface) => rolPermiso.permiso!)
        : [];

      this.permisosSeleccionados = permisos.map((permiso: PermisoInterface) => permiso.nombrePermiso);

      this.permisosSeleccionadosFormArray.controls.forEach((control, index) => {
        const permiso = this.permisos[index];
        control.setValue(this.permisosSeleccionados.includes(permiso.nombrePermiso));
      });
      this.loading = false;
    });
  }


  get permisosSeleccionadosFormArray() {
    return this.editForm.get('permisosSeleccionados') as FormArray;
  }

  postForm(id: any) {
    Swal.fire({
      icon: 'question',
      title: '¿Estás seguro de que deseas modificar este rol?',
      showCancelButton: true,
      showCloseButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;

        this.api.putRol(id).subscribe((data: any) => {
          if (data.status == 'ok') {
            const nuevosPermisos = this.permisosSeleccionadosFormArray.controls
              .map((control, index) => control.value ? this.permisos[index].idPermiso : null)
              .filter(permiso => permiso !== null);
            this.api.putRolPermiso(id.idRol, nuevosPermisos).subscribe(data => {
              if (data.status == 'ok') {
                this.editForm.reset();
                this.router.navigate(['rol/list-roles']);
                Swal.fire({
                  icon: 'success',
                  title: 'Rol modificado',
                  text: 'El rol ha sido modificado exitosamente.',
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
              }
              this.loading = false;
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al modificar',
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
