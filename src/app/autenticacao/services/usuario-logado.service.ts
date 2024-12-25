import { Injectable } from '@angular/core';
import { TokenService } from './token.service';
import { jwtDecode } from 'jwt-decode';
import { UsuarioLogado } from '../interfaces/usuario-logado';

@Injectable({
  providedIn: 'root'
})
export class UsuarioLogadoService {

  perfis: string[] = [];
  usuarioLogado!: UsuarioLogado;

  constructor(private readonly tokenService: TokenService) {
    if (this.tokenService.possuiToken()) {
      this.decodificarJWT();
    }
  }

  decodificarJWT() {
    const token = this.tokenService.retornarToken();
    this.usuarioLogado = jwtDecode<UsuarioLogado>(token);
    this.perfis = this.usuarioLogado.perfis.split(',');
  }

  retornarUsuario() {
    return this.usuarioLogado;
  }

  salvarToken(token: string) {
    this.tokenService.salvarToken(token);
    this.decodificarJWT();
  }

  logout() {
    this.tokenService.excluirToken();
    this.usuarioLogado = { nome: '', email: '', perfis: ''};
  }

  estaLogado() {
    return this.tokenService.possuiToken();
  }

  temPermissao(perfil: string) {
    return this.perfis.includes(perfil);
  }

}
