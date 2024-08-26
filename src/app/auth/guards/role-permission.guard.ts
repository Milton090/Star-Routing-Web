import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { RolService } from 'src/app/services/api/rol.service';
import { UsuarioService } from 'src/app/services/api/usuario.service';

export const rolePermissionGuard: CanMatchFn = (route) => {

  const rolService = inject(RolService);
  const userService = inject(UsuarioService);
  const router = inject(Router);

  const permiso = route.data?.['permiso'];

  const uid = localStorage.getItem('uid');

  return userService.getOneUsuario(uid).pipe(
    mergeMap((response) => {
      const rol = response.idRol;

      return rolService.getRolPermisos(rol).pipe(
        mergeMap((response) => {
          const permisos = response.idPermiso?.map((rolPermiso) => rolPermiso.permiso?.nombrePermiso) || [];

          const hasPermission = permisos.includes(permiso);

          if (hasPermission) {
            return of(true);
          } else {
            router.navigate(['acceso-denegado']);
            return of(false);
          }
        })
      );
    })
  );
};