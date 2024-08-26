import { NgModule } from '@angular/core';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ForgotPwdComponent } from './forgot-pwd/forgot-pwd.component';
import { NewPwdComponent } from './new-pwd/new-pwd.component';


@NgModule({
  declarations: [LoginComponent, ForgotPwdComponent, NewPwdComponent],
  imports: [
    SharedModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }
