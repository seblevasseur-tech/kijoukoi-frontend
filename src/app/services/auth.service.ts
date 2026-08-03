import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface JwtResponse {
  token: string;
  id: number;
  login: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.backendUrl}/api/auth`;

  // Signal pour suivre l'état de connexion réactivement
  currentUser = signal<{ id: number; login: string } | null>(null);

  constructor() {
    this.checkAuth();
  }

  login(login: string, password: string): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.baseUrl}/login`, { login, password }).pipe(
      tap(res => {
        localStorage.setItem('auth-token', res.token);
        localStorage.setItem('auth-user', JSON.stringify({ id: res.id, login: res.login }));
        this.currentUser.set({ id: res.id, login: res.login });
      })
    );
  }

  register(login: string, password: string): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.baseUrl}/register`, { login, password }).pipe(
      tap(res => {
        localStorage.setItem('auth-token', res.token);
        localStorage.setItem('auth-user', JSON.stringify({ id: res.id, login: res.login }));
        this.currentUser.set({ id: res.id, login: res.login });
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem('auth-token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private checkAuth(): void {
    const userStr = localStorage.getItem('auth-user');
    if (userStr && this.getToken()) {
      this.currentUser.set(JSON.parse(userStr));
    }
  }
}
