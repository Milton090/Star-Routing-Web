import { NgModule } from '@angular/core';

import { ClienteRoutingModule } from './cliente-routing.module';
import { ListClientesComponent } from './list-clientes/list-clientes.component';
import { NewClienteComponent } from './new-cliente/new-cliente.component';
import { EditClienteComponent } from './edit-cliente/edit-cliente.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    ListClientesComponent,
    NewClienteComponent,
    EditClienteComponent,
  ],
  imports: [
    SharedModule,
    ClienteRoutingModule,
  ]
})
export class ClienteModule { }
