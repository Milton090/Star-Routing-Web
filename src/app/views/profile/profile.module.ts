import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { ViewProfileComponent } from './view-profile/view-profile.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { EditProfileComponent } from './edit-profile/edit-profile.component';

@NgModule({
  declarations: [
    ViewProfileComponent,
    EditProfileComponent,
  ],
  imports: [
    SharedModule,
    ProfileRoutingModule,
  ]
})
export class ProfileModule { }
