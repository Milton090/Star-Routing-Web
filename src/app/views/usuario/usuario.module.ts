import { NgModule } from '@angular/core';

import { UsuarioRoutingModule } from './usuario-routing.module';
import { ListUsuariosComponent } from './list-usuarios/list-usuarios.component';
import { EditUsuarioComponent } from './edit-usuario/edit-usuario.component';
import { NewUsuarioComponent } from './new-usuario/new-usuario.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    ListUsuariosComponent,
    EditUsuarioComponent,
    NewUsuarioComponent,
  ],
  imports: [
    SharedModule,
    UsuarioRoutingModule,
  ]
})
export class UsuarioModule { }
