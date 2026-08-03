import { Routes } from '@angular/router';
import { PlayerListComponent } from './components/player-list/player-list.component';
import { BladeListComponent } from './components/blade-list/blade-list.component';
import { RubberListComponent } from './components/rubber-list/rubber-list.component';
import { PlayerDashboardComponent } from './player-dashboard/player-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/profile', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'players', component: PlayerListComponent, canActivate: [authGuard] },
  { path: 'blades', component: BladeListComponent, canActivate: [authGuard] },
  { path: 'rubbers', component: RubberListComponent, canActivate: [authGuard] },
  { path: 'profile', component: PlayerDashboardComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard] },
];
