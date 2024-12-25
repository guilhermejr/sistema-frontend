import { Routes } from '@angular/router';
import { LoginComponent } from './autenticacao/components/login/login.component';
import { DashboardComponent } from './dashboard/components/dashboard/dashboard.component';
import { loginGuard } from './autenticacao/guards/login.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [loginGuard]
  }
];
