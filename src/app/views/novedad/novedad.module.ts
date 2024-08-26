import { NgModule } from '@angular/core';

import { NovedadRoutingModule } from './novedad-routing.module';
import { ListNovedadesComponent } from './list-novedades/list-novedades.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    ListNovedadesComponent,
  ],
  imports: [
    SharedModule,
    NovedadRoutingModule,
  ]
})
export class NovedadModule { }
