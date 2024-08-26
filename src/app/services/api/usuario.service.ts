import { Injectable } from '@angular/core';
import { ResponseInterface } from '../../models/response.interface';
import { UsuarioInterface } from '../../models/usuario.interface';
import { TipoDocumentoInterface } from '../../models/tipo-documento.interface';
import { EstadoUsuarioInterface } from '../../models/estado-usuario.interface';
import { RolInterface } from 'src/app/models/rol.interface';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

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

  getAllUsuarios(): Observable<UsuarioInterface[]> {
    const address = this.url + 'usuario';
    const headers = this.getHeaders();
    return this.http.get<UsuarioInterface[]>(address, { headers });
  }

  getOneUsuario(id: any): Observable<UsuarioInterface> {
    const address = this.url + 'usuario/' + id;
    const headers = this.getHeaders();
    return this.http.get<UsuarioInterface>(address, { headers });
  }

  getPaqueteUsuario(id: any): Observable<ResponseInterface> {
    const address = this.url + 'usuario/paquete/cont/' + id;
    const headers = this.getHeaders();
    return this.http.get<ResponseInterface>(address, { headers });
  }

  postUsuario(form: UsuarioInterface): Observable<ResponseInterface> {
    const address = this.url + 'usuario';
    const headers = this.getHeaders();
    return this.http.post<ResponseInterface>(address, form, { headers });
  }

  putUsuario(id: any): Observable<ResponseInterface> {
    const address = this.url + 'usuario/' + id;
    const headers = this.getHeaders();
    return this.http.put<ResponseInterface>(address, id, { headers });
  }

  deleteUsuario(id: any): Observable<ResponseInterface> {
    const address = this.url + 'usuario/' + id;
    const headers = this.getHeaders();
    return this.http.delete<ResponseInterface>(address, { headers });
  }

  getTipoDocumento(): Observable<TipoDocumentoInterface[]> {
    const address = this.url + 'tipodocumentousuario';
    const headers = this.getHeaders();
    return this.http.get<TipoDocumentoInterface[]>(address, { headers });
  }

  getEstadoUsuario(): Observable<EstadoUsuarioInterface[]> {
    const address = this.url + 'estadoUsuario';
    const headers = this.getHeaders();
    return this.http.get<EstadoUsuarioInterface[]>(address, { headers });
  }

  getRolUsuario(): Observable<RolInterface[]> {
    const address = this.url + 'rol';
    const headers = this.getHeaders();
    return this.http.get<RolInterface[]>(address, { headers });
  }
}
