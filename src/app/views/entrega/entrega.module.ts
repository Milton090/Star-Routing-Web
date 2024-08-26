import { NgModule } from '@angular/core';

import { EntregaRoutingModule } from './entrega-routing.module';
import { ListEntregasComponent } from './list-entregas/list-entregas.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    ListEntregasComponent,
  ],
  imports: [
    SharedModule,
    EntregaRoutingModule,
  ]
})
export class EntregaModule { }
