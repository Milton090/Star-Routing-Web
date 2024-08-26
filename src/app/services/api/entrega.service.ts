import { Injectable } from '@angular/core';
import { EntregaInterface } from '../../models/entrega.interface';
import { RastreoInterface } from 'src/app/models/rastreo.interface';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EntregaService {

  url: string = 'https://star-routing-backend-brabckhpgve4fkes.eastus-01.azurewebsites.net/';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    // Aquí agregamos el token a las cabeceras
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Token': token || ''
    });
  }

  getAllEntregas(): Observable<EntregaInterface[]> {
    let address = this.url + 'entrega';
    const headers = this.getHeaders();
    return this.http.get<EntregaInterface[]>(address, { headers });
  }

  getOneEntrega(id: any): Observable<EntregaInterface> {
    let address = this.url + 'entrega/' + id;
    const headers = this.getHeaders();
    return this.http.get<EntregaInterface>(address, { headers });
  }

  getRastreo(id: any): Observable<RastreoInterface> {
    let address = this.url + 'rastreo/' + id;
    const headers = this.getHeaders();
    return this.http.get<RastreoInterface>(address, { headers });
  }
}
