import { Component, Input, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { GraficosService } from '../../../energia/services/graficos.service';
import Swal from 'sweetalert2';
Chart.register(...registerables);

@Component({
  selector: 'app-barra',
  imports: [],
  templateUrl: './barra.component.html',
  styleUrl: './barra.component.scss'
})
export class BarraComponent implements OnInit {

  constructor(
    private readonly graficosService: GraficosService
  ) { }

  @Input() identificador!: string;

  ngOnInit(): void {

    this.graficosService.ultimos30Dias().subscribe({
      next: (value) => {

        let periodo: string[] = []
        let valor: number[] = []

        value.forEach(item => {
          periodo.push(item.periodo);
          valor.push(item.valor);
        });

        new Chart('grafico1', {
          type: 'bar',
          data: {
            labels: periodo.reverse(),
            datasets: [{
              label: 'kWh',
              data: valor.reverse(),
              borderWidth: 1
            }]
          },
          options: {
            plugins: {
              legend: {
                position: 'bottom'
              },
              title: {
                display: true,
                text: 'Geração últimos 30 dias',
                align: 'center',
                font: {
                  size: 20
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });

      },
      error: (error) => {
        Swal.fire({
          icon: "error",
          title: error.error[0].mensagem
        });
        console.error("Erro no gráfico", error);
      }
    });

    this.graficosService.ultimos12Meses().subscribe({
      next: (value) => {

        let periodo: string[] = []
        let valor: number[] = []

        value.forEach(item => {
          periodo.push(item.periodo);
          valor.push(item.valor);
        });
        console.log(periodo);
        console.log(valor);

        new Chart('grafico2', {
          type: 'bar',
          data: {
            labels: periodo.reverse(),
            datasets: [{
              label: 'kWh',
              data: valor.reverse(),
              borderWidth: 1
            }]
          },
          options: {
            plugins: {
              legend: {
                position: 'bottom'
              },
              title: {
                display: true,
                text: 'Geração últimos 12 meses',
                align: 'center',
                font: {
                  size: 20
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });

      },
      error: (error) => {
        Swal.fire({
          icon: "error",
          title: error.error[0].mensagem
        });
        console.error("Erro no gráfico", error);
      }
    });

    this.graficosService.consumoUltimos12Meses().subscribe({
      next: (value) => {

        let periodo: string[] = []
        let valor: number[] = []

        value.forEach(item => {
          periodo.push(item.periodo);
          valor.push(item.valor);
        });
        console.log(periodo);
        console.log(valor);

        new Chart('grafico3', {
          type: 'bar',
          data: {
            labels: periodo.reverse(),
            datasets: [{
              label: 'kWh',
              data: valor.reverse(),
              borderWidth: 1
            }]
          },
          options: {
            plugins: {
              legend: {
                position: 'bottom'
              },
              title: {
                display: true,
                text: 'Consumo últimos 12 meses',
                align: 'center',
                font: {
                  size: 20
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });

      },
      error: (error) => {
        Swal.fire({
          icon: "error",
          title: error.error[0].mensagem
        });
        console.error("Erro no gráfico", error);
      }
    });

  }

}
