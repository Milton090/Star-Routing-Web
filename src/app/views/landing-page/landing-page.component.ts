import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {

  constructor(private router: Router) { }

  scrollToInicio() {
    const inicioElement = document.getElementById("inicio");
    if (inicioElement) {
      inicioElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToSobreNosotros() {
    const sobreNosotrosElement = document.getElementById("sobreNosotros");
    if (sobreNosotrosElement) {
      sobreNosotrosElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToContactenos() {
    const contactenosElement = document.getElementById("contactenos");
    if (contactenosElement) {
      contactenosElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  login() {
    this.router.navigate(['auth/login']);
  }
}
