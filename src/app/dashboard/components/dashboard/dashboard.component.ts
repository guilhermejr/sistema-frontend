import { Component } from '@angular/core';
import { UsuarioLogadoService } from '../../../autenticacao/services/usuario-logado.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  perfis: string[] | null = [];

  constructor(
    public readonly usuarioLogado: UsuarioLogadoService
  ) {
    usuarioLogado.retornarPerfis().subscribe({
      next: (perfis) => {
        this.perfis = perfis;
      }
    });
  }

}
