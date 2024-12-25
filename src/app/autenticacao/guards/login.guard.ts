import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsuarioLogadoService } from '../services/usuario-logado.service';

export const loginGuard: CanActivateFn = (route, state) => {

  const usuarioLogado = inject(UsuarioLogadoService);
  const router = inject(Router);

  if (usuarioLogado.estaLogado()) {
    return true;
  } else {
    router.navigate(['']);
    return false;
  }

};
