import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListPaquetesComponent } from './list-paquetes/list-paquetes.component';
import { NewPaqueteComponent } from './new-paquete/new-paquete.component';
import { EditPaqueteComponent } from './edit-paquete/edit-paquete.component';
import { unsavedChangesGuard } from 'src/app/auth/guards/unsaved-changes.guard';

const routes: Routes = [

  { path: '', redirectTo: 'list-paquetes', pathMatch: 'full' },

  { path: 'list-paquetes', component: ListPaquetesComponent },

  { path: 'new-paquete', canDeactivate: [unsavedChangesGuard], component: NewPaqueteComponent },

  { path: 'edit-paquete/:id', canDeactivate: [unsavedChangesGuard], component: EditPaqueteComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaqueteRoutingModule { }
