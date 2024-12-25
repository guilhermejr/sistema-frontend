import { Injectable } from '@angular/core';
import { TokenService } from './token.service';
import { BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Perfis } from '../interfaces/perfis';

@Injectable({
  providedIn: 'root'
})
export class UsuarioLogadoService {

  private readonly usuarioSubject = new BehaviorSubject<string[] | null>(null);
  perfis: string[] = [];

  constructor(private readonly tokenService: TokenService) {
    if (this.tokenService.possuiToken()) {
      this.decodificarJWT();
    }
  }

  decodificarJWT() {
    const token = this.tokenService.retornarToken();
    this.perfis = jwtDecode<Perfis>(token).perfis.split(',');
    this.usuarioSubject.next(this.perfis);
  }

  retornarPerfis() {
    return this.usuarioSubject.asObservable();
  }

  salvarToken(token: string) {
    this.tokenService.salvarToken(token);
    this.decodificarJWT();
  }

  logout() {
    this.tokenService.excluirToken();
    this.usuarioSubject.next(null);
  }

  estaLogado() {
    return this.tokenService.possuiToken();
  }

  temPermissao(perfil: string) {
    return this.perfis.includes(perfil);
  }

}
