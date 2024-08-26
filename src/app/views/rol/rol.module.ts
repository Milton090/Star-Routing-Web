import { NgModule } from '@angular/core';
import { RolRoutingModule } from './rol-routing.module';
import { ListRolesComponent } from './list-roles/list-roles.component';
import { NewRolComponent } from './new-rol/new-rol.component';
import { EditRolComponent } from './edit-rol/edit-rol.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    ListRolesComponent,
    NewRolComponent,
    EditRolComponent,
  ],
  imports: [
    SharedModule,
    RolRoutingModule,
  ]
})
export class RolModule { }
