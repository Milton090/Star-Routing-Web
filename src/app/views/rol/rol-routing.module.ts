import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListRolesComponent } from './list-roles/list-roles.component';
import { NewRolComponent } from './new-rol/new-rol.component';
import { EditRolComponent } from './edit-rol/edit-rol.component';
import { unsavedChangesGuard } from 'src/app/auth/guards/unsaved-changes.guard';

const routes: Routes = [

  { path: '', redirectTo: 'list-roles', pathMatch: 'full' },

  { path: 'list-roles', component: ListRolesComponent, },

  { path: 'new-rol', canDeactivate: [unsavedChangesGuard], component: NewRolComponent },

  { path: 'edit-rol/:id', canDeactivate: [unsavedChangesGuard], component: EditRolComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RolRoutingModule { }
