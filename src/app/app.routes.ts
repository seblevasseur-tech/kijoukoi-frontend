import { Routes } from '@angular/router';
import { PlayerListComponent } from './components/player-list/player-list.component';
import { BladeListComponent } from './components/blade-list/blade-list.component';
import { RubberListComponent } from './components/rubber-list/rubber-list.component';
import { PlayerDashboardComponent } from './player-dashboard/player-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: '/players', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'players', component: PlayerListComponent },
  { path: 'blades', component: BladeListComponent },
  { path: 'rubbers', component: RubberListComponent },
  { path: 'profile', component: PlayerDashboardComponent },
  { path: 'admin', component: AdminDashboardComponent },
];
