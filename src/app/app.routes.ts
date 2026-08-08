import { AddBladeComponent } from './components/add-blade/add-blade.component';
import { AddRubberComponent } from './components/add-rubber/add-rubber.component';
import { Routes } from '@angular/router';
import { PlayerListComponent } from './components/player-list/player-list.component';
import { BladeListComponent } from './components/blade-list/blade-list.component';
import { RubberListComponent } from './components/rubber-list/rubber-list.component';
import { PlayerDashboardComponent } from './player-dashboard/player-dashboard.component';
import { StatsDashboardComponent } from './stats-dashboard/stats-dashboard.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './guards/auth.guard';
import { AddPlayerComponent } from './components/add-player/add-player.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: StatsDashboardComponent },
  { path: 'players', component: PlayerListComponent },
  { path: 'blades', component: BladeListComponent },
  { path: 'rubbers', component: RubberListComponent },
  { path: 'profile', component: PlayerDashboardComponent, canActivate: [authGuard] },
  { path: 'add-blade', component: AddBladeComponent, canActivate: [authGuard] },
  { path: 'add-rubber', component: AddRubberComponent, canActivate: [authGuard] },
  { path: 'add-player', component: AddPlayerComponent, canActivate: [authGuard] },
];
