import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { Player } from '../models/player.model';
import { Blade } from '../models/blade.model';
import { Rubber } from '../models/rubber.model';

@Component({
  selector: 'app-player-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './player-dashboard.component.html',
  styleUrl: './player-dashboard.component.scss'
})
export class PlayerDashboardComponent implements OnInit {
  player!: Player;
  blades: Blade[] = [];
  rubbers: Rubber[] = [];
  private api = inject(ApiService);

  ngOnInit(): void {
    // Simulation : on récupère toujours le joueur ID 1 (sebastien.pong) pour tester.
    // Dans une vraie appli, on utiliserait le token JWT de l'utilisateur connecté.
    this.api.getPlayer(1).subscribe(data => this.player = data);
    this.api.getBlades().subscribe(data => this.blades = data);
    this.api.getRubbers().subscribe(data => this.rubbers = data);
  }

  saveRacket(): void {
    this.api.updatePlayer(this.player.id, this.player).subscribe(updated => {
      this.player = updated;
      alert('Raquette mise à jour avec succès !');
    });
  }

  // Fonctions utilitaires pour le ngModel avec les objets
  compareBlades(b1: Blade, b2: Blade): boolean {
    return b1 && b2 ? b1.id === b2.id : b1 === b2;
  }
  compareRubbers(r1: Rubber, r2: Rubber): boolean {
    return r1 && r2 ? r1.id === r2.id : r1 === r2;
  }
}
