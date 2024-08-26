import { Injectable } from '@angular/core';
import { ResponseInterface } from '../../models/response.interface';
import { ClienteInterface } from '../../models/cliente.interface';
import { TipoDocumentoInterface } from '../../models/tipo-documento.interface';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

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

  getAllClientes(): Observable<ClienteInterface[]> {
    let address = this.url + 'cliente';
    const headers = this.getHeaders();
    return this.http.get<ClienteInterface[]>(address, { headers });
  }

  getOneCliente(id: any): Observable<ClienteInterface> {
    let address = this.url + 'cliente/' + id;
    const headers = this.getHeaders();
    return this.http.get<ClienteInterface>(address, { headers });
  }

  postCliente(form: ClienteInterface): Observable<ResponseInterface> {
    let address = this.url + 'cliente';
    const headers = this.getHeaders();
    return this.http.post<ResponseInterface>(address, form, { headers });
  }

  putCliente(id: any): Observable<ResponseInterface> {
    let address = this.url + 'cliente/' + id;
    const headers = this.getHeaders();
    return this.http.put<ResponseInterface>(address, id, { headers });
  }

  deleteCliente(id: any): Observable<ResponseInterface> {
    let addres = this.url + 'cliente/' + id;
    const headers = this.getHeaders();
    return this.http.delete<ResponseInterface>(addres, { headers });
  }

  getTipoDocumento(): Observable<TipoDocumentoInterface[]> {
    const address = this.url + 'tipodocumentocliente';
    const headers = this.getHeaders();
    return this.http.get<TipoDocumentoInterface[]>(address, { headers });
  }
}
