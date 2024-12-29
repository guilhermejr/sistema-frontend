import { Component } from '@angular/core';
import { CabecalhoComponent } from '../cabecalho/cabecalho.component';
import { BarraComponent } from "../../../utils/graficos/barra/barra.component";

@Component({
  selector: 'app-dashboard',
  imports: [CabecalhoComponent, BarraComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
}
