import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../api.service';
import { Player } from '../../models/player.model';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-list.component.html',
  styleUrl: './player-list.component.scss'
})
export class PlayerListComponent implements OnInit {
  players: Player[] = [];
  private api = inject(ApiService);

  ngOnInit(): void {
    this.api.getPlayers().subscribe(data => {
      this.players = data;
    });
  }
}
