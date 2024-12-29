import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ultimos30Dias } from '../interfaces/ultimos30-dias';

@Injectable({
  providedIn: 'root'
})
export class GraficosService {

  private readonly api = environment.api;

  constructor(
    private readonly http: HttpClient
  ) { }

  ultimos30Dias(): Observable<Ultimos30Dias[]> {
    return this.http.get<Ultimos30Dias[]>(`${this.api}/energia-service/geracao/ultimos30dias`);
  }

  ultimos30DiasAnoPassado(): Observable<Ultimos30Dias[]> {
    return this.http.get<Ultimos30Dias[]>(`${this.api}/energia-service/geracao/ultimos30Diasanopassado`);
  }

  ultimos12Meses(): Observable<Ultimos30Dias[]> {
    return this.http.get<Ultimos30Dias[]>(`${this.api}/energia-service/geracao/ultimos12meses`);
  }

  consumoUltimos12Meses(): Observable<Ultimos30Dias[]> {
    return this.http.get<Ultimos30Dias[]>(`${this.api}/energia-service/acompanhamentos/consumoultimos12meses`);
  }

}
