import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListUsuariosComponent } from './list-usuarios/list-usuarios.component';
import { NewUsuarioComponent } from './new-usuario/new-usuario.component';
import { EditUsuarioComponent } from './edit-usuario/edit-usuario.component';
import { unsavedChangesGuard } from 'src/app/auth/guards/unsaved-changes.guard';


const routes: Routes = [

  { path: '', redirectTo: 'list-usuarios', pathMatch: 'full' },

  { path: 'list-usuarios', component: ListUsuariosComponent },

  { path: 'new-usuario', canDeactivate: [unsavedChangesGuard], component: NewUsuarioComponent },

  { path: 'edit-usuario/:id', canDeactivate: [unsavedChangesGuard], component: EditUsuarioComponent },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuarioRoutingModule { }
