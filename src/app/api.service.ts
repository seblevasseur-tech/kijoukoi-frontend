import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Player } from './models/player.model';
import { Blade } from './models/blade.model';
import { BladeType } from './models/blade-type.model';
import { RubberType } from './models/rubber-type.model';
import { Rubber } from './models/rubber.model';
import { Brand } from './models/brand.model';
import { PlayerTag } from './models/player-tag.model';
import { AggregationRequestDTO, AggregationResultDTO } from './models/aggregation.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  // Utilisation de l'URL du fichier d'environnement
  private baseUrl = `${environment.backendUrl}/api`;

  getPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.baseUrl}/players`);
  }

  getMe(): Observable<Player> {
    return this.http.get<Player>(`${this.baseUrl}/players/me`);
  }

  getPlayer(id: number): Observable<Player> {
    return this.http.get<Player>(`${this.baseUrl}/players/${id}`);
  }

  updatePlayer(id: number, player: Player): Observable<Player> {
    return this.http.put<Player>(`${this.baseUrl}/players/${id}`, player);
  }

  getBlades(): Observable<Blade[]> {
    return this.http.get<Blade[]>(`${this.baseUrl}/equipment/blades`);
  }

  getRubbers(): Observable<Rubber[]> {
    return this.http.get<Rubber[]>(`${this.baseUrl}/equipment/rubbers`);
  }

  getBladeTypes(): Observable<BladeType[]> {
    return this.http.get<BladeType[]>(`${this.baseUrl}/equipment/blade-types`);
  }

  getRubberTypes(): Observable<RubberType[]> {
    return this.http.get<RubberType[]>(`${this.baseUrl}/equipment/rubber-types`);
  }

  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.baseUrl}/equipment/brands`);
  }

  getTags(): Observable<PlayerTag[]> {
    return this.http.get<PlayerTag[]>(`${this.baseUrl}/tags`);
  }

  postAggregation(request: AggregationRequestDTO): Observable<AggregationResultDTO[]> {
    return this.http.post<AggregationResultDTO[]>(`${this.baseUrl}/stats/aggregate`, request);
  }
}
