import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListEntregasComponent } from './list-entregas/list-entregas.component';

const routes: Routes = [

  { path: '', redirectTo: 'list-entregas', pathMatch: 'full' },

  { path: 'list-entregas', component: ListEntregasComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntregaRoutingModule { }