import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Player } from './models/player.model';
import { Blade } from './models/blade.model';
import { Rubber } from './models/rubber.model';
import { Brand } from './models/brand.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api';

  getPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.baseUrl}/players`);
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

  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.baseUrl}/equipment/brands`);
  }
}
