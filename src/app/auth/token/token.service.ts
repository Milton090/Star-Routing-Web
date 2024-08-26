import { Injectable } from '@angular/core';
import { ResponseInterface } from '../../models/response.interface';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  url: string = 'https://star-routing-backend-brabckhpgve4fkes.eastus-01.azurewebsites.net/';

  constructor(private http: HttpClient) { }

  verifyToken(token: string): Observable<ResponseInterface> {
    const address = this.url + 'token';

    const headers = new HttpHeaders({
      'Token': token
    });

    return this.http.post<ResponseInterface>(address, null, { headers: headers });
  }
}
