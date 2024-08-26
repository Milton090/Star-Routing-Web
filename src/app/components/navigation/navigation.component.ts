import { Component, Inject, ViewChild, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { MatMenuTrigger } from '@angular/material/menu';
import { RolService } from '../../services/api/rol.service';
import { UsuarioService } from 'src/app/services/api/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {

  @ViewChild('userMenuTrigger') userMenuTrigger!: MatMenuTrigger;
  private breakpointObserver = inject(BreakpointObserver);

  isDarkThemeActive = false;

  modules: any[] = [];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private rolService: RolService,
    private userService: UsuarioService,
  ) {

    const uid = localStorage.getItem('uid');

    if (!uid) {
      this.router.navigate(['auth/login']);
      Swal.fire({
        icon: 'warning',
        title: 'Su sesión ha expirado',
        text: 'Por favor inicie sesión nuevamente.',
      });
      return;
    };

    this.modules = [
      { name: 'Roles', route: '/rol' },
      { name: 'Usuarios', route: '/usuario' },
      { name: 'Clientes', route: '/cliente' },
      { name: 'Paquetes', route: '/paquete' },
      { name: 'Novedades', route: '/novedad' },
      { name: 'Entregas', route: '/entrega' }
    ];

    const isDarkModeActive = this.document.body.classList.contains('dark-mode');
    const storedTheme = localStorage.getItem('isDarkThemeActive');

    this.isDarkThemeActive = storedTheme ? storedTheme == 'true' : isDarkModeActive;

    if (this.isDarkThemeActive) {
      this.document.body.classList.add('dark-mode');
    } else {
      this.document.body.classList.remove('dark-mode');
    }

    this.userService.getOneUsuario(uid).subscribe(data => {
      const rol = data.idRol;

      // Obtener los permisos del rol y filtrar los módulos correspondientes
      this.rolService.getRolPermisos(rol).subscribe(data => {

        const permisos = data.idPermiso?.map((rolPermiso) => rolPermiso.permiso?.nombrePermiso);

        this.modules = this.modules.filter((module) => permisos.includes(module.name));
      });
    });
  }

  darkMode(newValue: boolean): void {
    this.isDarkThemeActive = newValue;

    localStorage.setItem('isDarkThemeActive', String(newValue));
    if (newValue) {
      this.document.body.classList.add('dark-mode');
    } else {
      this.document.body.classList.remove('dark-mode');
    }
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );


  logout(): void {
    Swal.fire({
      icon: 'question',
      title: 'Cerrar sesión',
      text: '¿Estás seguro de que deseas cerrar sesión?',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['auth/login']);
        localStorage.removeItem('token');
        localStorage.removeItem('uid');
      }
    });
  }

  toggleUserPanel(): void {
    if (this.userMenuTrigger) {
      this.userMenuTrigger.openMenu();
    }
  }
}
