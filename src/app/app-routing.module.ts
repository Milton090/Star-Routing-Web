import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './views/landing-page/landing-page.component';
import { isLoggedInGuard } from './auth/guards/is-logged-in.guard';
import { rolePermissionGuard } from './auth/guards/role-permission.guard';


const routes: Routes = [

  { path: '', redirectTo: 'landing-page', pathMatch: 'full' }, //ruta x defecto

  { path: 'landing-page', component: LandingPageComponent },

  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },

  { path: 'home', canMatch: [isLoggedInGuard], loadChildren: () => import('./components/home/home.module').then(m => m.HomeModule) },


  {
    path: 'rol',
    canMatch: [isLoggedInGuard, rolePermissionGuard],
    data: { permiso: 'Roles' },
    loadChildren: () => import('./views/rol/rol.module').then(m => m.RolModule)
  },


  {
    path: 'cliente',
    canMatch: [isLoggedInGuard, rolePermissionGuard],
    data: { permiso: 'Clientes' },
    loadChildren: () => import('./views/cliente/cliente.module').then(m => m.ClienteModule)
  },


  {
    path: 'usuario',
    canMatch: [isLoggedInGuard, rolePermissionGuard],
    data: { permiso: 'Usuarios' },
    loadChildren: () => import('./views/usuario/usuario.module').then(m => m.UsuarioModule)
  },

  {
    path: 'profile',
    canMatch: [isLoggedInGuard],
    loadChildren: () => import('./views/profile/profile.module').then(m => m.ProfileModule)
  },


  {
    path: 'paquete',
    canMatch: [isLoggedInGuard, rolePermissionGuard],
    data: { permiso: 'Paquetes' },
    loadChildren: () => import('./views/paquete/paquete.module').then(m => m.PaqueteModule)
  },

  {
    path: 'novedad',
    canMatch: [isLoggedInGuard, rolePermissionGuard],
    data: { permiso: 'Novedades' },
    loadChildren: () => import('./views/novedad/novedad.module').then(m => m.NovedadModule)
  },

  {
    path: 'entrega',
    canMatch: [isLoggedInGuard, rolePermissionGuard],
    data: { permiso: 'Entregas' },
    loadChildren: () => import('./views/entrega/entrega.module').then(m => m.EntregaModule)
  },


  { path: '**', loadChildren: () => import('./components/not-found/not-found.module').then(m => m.NotFoundModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }