import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { Token } from '../interfaces/token';
import { UsuarioLogadoService } from './usuario-logado.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private readonly api = environment.api;

  constructor(
    private readonly http: HttpClient,
    private readonly usuarioLogado: UsuarioLogadoService
  ) { }

  autenticar(email: string, senha: string): Observable<HttpResponse<Token>> {
    return this.http.post<Token>(`${this.api}/autenticacao-service/login`,
      { email, senha },
      { observe: 'response' }).pipe(
      tap((response) => {
        const token = response.body?.token ?? "";
        this.usuarioLogado.salvarToken(token)
      })
    );
  }
}
