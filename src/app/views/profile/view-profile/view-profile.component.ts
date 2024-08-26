import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsuarioInterface } from '../../../models/usuario.interface';
import { UsuarioService } from 'src/app/services/api/usuario.service';
import { TipoDocumentoInterface } from 'src/app/models/tipo-documento.interface';
import { Subscription, forkJoin } from 'rxjs';
import { RolInterface } from 'src/app/models/rol.interface';
import { MatDialog } from '@angular/material/dialog';
import { EditProfileComponent } from '../edit-profile/edit-profile.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.scss']
})
export class ViewProfileComponent implements OnInit, OnDestroy {

  userData: UsuarioInterface | null = null;
  tiposDocumento: TipoDocumentoInterface[] = [];
  rolData: RolInterface[] = [];
  tipoDocumentoMap: { [key: string]: string } = {};
  rolMap: { [key: string]: string } = {};

  loading: boolean = true;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private userService: UsuarioService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.getUserData();
  }

  ngOnDestroy(): void {
    // Desuscribirse de todas las suscripciones
    this.subscriptions.unsubscribe();
  }


  getUserData() {
    const uid = localStorage.getItem('uid');

    const forkJoinSub = forkJoin([
      this.userService.getOneUsuario(uid),
      this.userService.getTipoDocumento(),
      this.userService.getRolUsuario()
    ]).subscribe(([usuarioData, tipoDocumentoData, rolData]) => {
      this.userData = usuarioData;
      this.tiposDocumento = tipoDocumentoData;
      this.rolData = rolData;

      this.tiposDocumento.forEach(tipoDocumento => {
        this.tipoDocumentoMap[tipoDocumento.idTipoDocumento!] = tipoDocumento.nombreTipo!;
      });
      this.rolData.forEach(rol => {
        this.rolMap[rol.idRol!] = rol.nombreRol!;
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
    this.subscriptions.add(forkJoinSub);
  }

  getTipoDocumento(idTipoDocumento: any): string {
    return this.tipoDocumentoMap[idTipoDocumento] || '';
  }

  getRol(idRol: any): string {
    return this.rolMap[idRol] || '';
  }

  openEditProfileDialog(): void {
    const dialogRef = this.dialog.open(EditProfileComponent, {
      width: '70%',
      height: 'auto',
      disableClose: true,
      autoFocus: false,
      data: { userData: this.userData }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userData = result;
      }
    });
  }
}
