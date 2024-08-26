import { NgModule } from '@angular/core';

import { PaqueteRoutingModule } from './paquete-routing.module';
import { ListPaquetesComponent } from './list-paquetes/list-paquetes.component';
import { NewPaqueteComponent } from './new-paquete/new-paquete.component';
import { EditPaqueteComponent } from './edit-paquete/edit-paquete.component';

import { SharedModule } from 'src/app/shared/shared.module';
import { AddClienteComponent } from './add-cliente/add-cliente.component';


@NgModule({
  declarations: [
    ListPaquetesComponent,
    NewPaqueteComponent,
    EditPaqueteComponent,
    AddClienteComponent,
  ],
  imports: [
    SharedModule,
    PaqueteRoutingModule,
  ]
})
export class PaqueteModule { }
