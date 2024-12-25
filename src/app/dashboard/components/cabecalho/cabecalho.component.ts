import { Component } from '@angular/core';
import { UsuarioLogadoService } from '../../../autenticacao/services/usuario-logado.service';
import { UsuarioLogado } from '../../../autenticacao/interfaces/usuario-logado';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cabecalho',
  imports: [RouterLink],
  templateUrl: './cabecalho.component.html',
  styleUrl: './cabecalho.component.scss'
})
export class CabecalhoComponent {

  usuarioLogado!: UsuarioLogado;

  constructor(
    public readonly usuarioLogadoService: UsuarioLogadoService,
    private readonly router: Router
  ) {
    this.usuarioLogado = this.usuarioLogadoService.retornarUsuario();
   }

   naoImplementado() {
    Swal.fire("Não implementado ainda!");
   }

   logout() {
    Swal.fire({
      text: "Deseja realmente sair?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim",
      cancelButtonText: "Não"
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioLogadoService.logout();
        this.router.navigate(['']);
      }
    });
   }

}
