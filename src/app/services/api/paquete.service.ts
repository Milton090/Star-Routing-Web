import { Injectable } from '@angular/core';
import { ResponseInterface } from '../../models/response.interface';
import { PaqueteInterface } from '../../models/paquete.interface';
import { UsuarioInterface } from '../../models/usuario.interface';
import { ClienteInterface } from '../../models/cliente.interface';
import { EstadoPaqueteInterface } from 'src/app/models/estado-paquete.interface';
import { TamanoPaqueteInterface } from 'src/app/models/tamano-paquete.interface';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoPaqueteInterface } from 'src/app/models/tipo-paquete.interface';

@Injectable({
  providedIn: 'root'
})
export class PaqueteService {

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

  getAllPaquetes(): Observable<PaqueteInterface[]> {
    let address = this.url + 'paquete';
    const headers = this.getHeaders();
    return this.http.get<PaqueteInterface[]>(address, { headers });
  }

  getOnePaquete(id: any): Observable<PaqueteInterface> {
    let address = this.url + 'paquete/' + id;
    const headers = this.getHeaders();
    return this.http.get<PaqueteInterface>(address, { headers });
  }

  getPaquetesByNovedad(): Observable<PaqueteInterface[]> {
    let address = this.url + 'paquete/novedad/paqs';
    const headers = this.getHeaders();
    return this.http.get<PaqueteInterface[]>(address, { headers });
  }

  getPaquetesByEntregado(): Observable<PaqueteInterface[]> {
    let address = this.url + 'paquete/entregas/entregado';
    const headers = this.getHeaders();
    return this.http.get<PaqueteInterface[]>(address, { headers });
  }

  postPaquete(form: PaqueteInterface): Observable<ResponseInterface> {
    let address = this.url + 'paquete';
    const headers = this.getHeaders();
    return this.http.post<ResponseInterface>(address, form, { headers });
  }

  putPaquete(id: any): Observable<ResponseInterface> {
    let address = this.url + 'paquete/' + id;
    const headers = this.getHeaders();
    return this.http.put<ResponseInterface>(address, id, { headers });
  }

  deletePaquete(id: any): Observable<ResponseInterface> {
    let addres = this.url + 'paquete/' + id;
    const headers = this.getHeaders();
    return this.http.delete<ResponseInterface>(addres, { headers });
  }

  getUsuario(): Observable<UsuarioInterface[]> {
    const address = this.url + 'usuario';
    const headers = this.getHeaders();
    return this.http.get<UsuarioInterface[]>(address, { headers });
  }

  getRemitenteAndDestinatario(): Observable<ClienteInterface[]> {
    const address = this.url + 'cliente';
    const headers = this.getHeaders();
    return this.http.get<ClienteInterface[]>(address, { headers });
  }

  getEstadoPaquete(): Observable<EstadoPaqueteInterface[]> {
    const address = this.url + 'estadoPaquete';
    const headers = this.getHeaders();
    return this.http.get<EstadoPaqueteInterface[]>(address, { headers });
  }

  getTamanoPaquete(): Observable<TamanoPaqueteInterface[]> {
    const address = this.url + 'tamanoPaquete';
    const headers = this.getHeaders();
    return this.http.get<TamanoPaqueteInterface[]>(address, { headers });
  }

  getTipoPaquete(): Observable<TipoPaqueteInterface[]> {
    const address = this.url + 'tipoPaquete';
    const headers = this.getHeaders();
    return this.http.get<TipoPaqueteInterface[]>(address, { headers });
  }

  getDataRemitente(idCliente: any): Observable<any> {
    const address = this.url + 'paquete/' + idCliente + '/data';
    const headers = this.getHeaders();
    return this.http.get<any>(address, { headers });
  }

  getDataDestinatario(idCliente: any): Observable<any> {
    const address = this.url + 'paquete/' + idCliente + '/data';
    const headers = this.getHeaders();
    return this.http.get<any>(address, { headers });
  }
}
