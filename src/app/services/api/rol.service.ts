import { Injectable } from '@angular/core';
import { ResponseInterface } from '../../models/response.interface';
import { RolInterface } from '../../models/rol.interface';
import { PermisoInterface } from '../../models/permiso.interface';
import { RolPermisoInterface } from '../../models/rol-permiso.interface';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RolPermisoResponseInterface } from 'src/app/models/rol-permiso-response.interface';

@Injectable({
  providedIn: 'root'
})
export class RolService {

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

  getAllRoles(): Observable<RolInterface[]> {
    let address = this.url + 'rol';
    const headers = this.getHeaders();
    return this.http.get<RolInterface[]>(address, { headers });
  }

  getOneRol(id: any): Observable<RolInterface> {
    let address = this.url + 'rol/' + id;
    const headers = this.getHeaders();
    return this.http.get<RolInterface>(address, { headers });
  }

  postRol(form: RolInterface): Observable<ResponseInterface> {
    let address = this.url + 'rol';
    const headers = this.getHeaders();
    return this.http.post<ResponseInterface>(address, form, { headers });
  }

  putRol(id: any): Observable<RolInterface> {
    let address = this.url + 'rol/' + id;
    const headers = this.getHeaders();
    return this.http.put<RolInterface>(address, id, { headers });
  }

  deleteRol(id: any): Observable<ResponseInterface> {
    let addres = this.url + 'rol/' + id;
    const headers = this.getHeaders();
    return this.http.delete<ResponseInterface>(addres, { headers });
  }

  getAllPermisos(): Observable<PermisoInterface[]> {
    let address = this.url + 'permiso';
    const headers = this.getHeaders();
    return this.http.get<PermisoInterface[]>(address, { headers });
  }

  getLastRolId(): Observable<any> {
    let address = this.url + 'rol/lastId';
    const headers = this.getHeaders();
    return this.http.get<any>(address, { headers });
  }

  guardarRolPermiso(rolPermiso: RolPermisoInterface): Observable<ResponseInterface> {
    let address = this.url + 'rolPermiso';
    const headers = this.getHeaders();
    return this.http.post<ResponseInterface>(address, rolPermiso, { headers });
  }

  getRolPermisos(idRol: any): Observable<RolPermisoResponseInterface> {
    let address = this.url + 'rolPermiso/' + idRol + '/permisos';
    const headers = this.getHeaders();
    return this.http.get<RolPermisoResponseInterface>(address, { headers });
  }

  putRolPermiso(idRol: any, idPermisos: any[]): Observable<ResponseInterface> {
    let address = this.url + 'rolPermiso/' + idRol;
    const headers = this.getHeaders();
    let body = { idRol: idRol, idPermisos: idPermisos };
    return this.http.put<ResponseInterface>(address, body, { headers });
  }
}
