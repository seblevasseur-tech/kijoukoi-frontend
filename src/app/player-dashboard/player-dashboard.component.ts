import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ApiService } from '../api.service';
import { Player } from '../models/player.model';
import { PlayerTag } from '../models/player-tag.model';
import { Blade } from '../models/blade.model';
import { Rubber } from '../models/rubber.model';

@Component({
  selector: 'app-player-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './player-dashboard.component.html',
  styleUrl: './player-dashboard.component.scss'
})
export class PlayerDashboardComponent implements OnInit {
  private api = inject(ApiService);
  apiUrl = this.api.getBaseUrl();
  
  player: Player | null = null;
  allTags: PlayerTag[] = [];
  
  positiveTags: PlayerTag[] = [];
  negativeTags: PlayerTag[] = [];

  blades: Blade[] = [];
  filteredBlades: Blade[] = [];
  
  rubbers: Rubber[] = [];
  filteredFhRubbers: Rubber[] = [];
  filteredBhRubbers: Rubber[] = [];
  
  bladeDropdownOpen = false;
  fhDropdownOpen = false;
  bhDropdownOpen = false;
  
  searchBladeText = '';
  searchFhText = '';
  searchBhText = '';

  ngOnInit(): void {
    this.api.getTags().subscribe(tags => {
      this.allTags = tags;
      this.loadProfile();
    });
    
    this.api.getBlades().subscribe(b => {
      this.blades = b;
      this.filteredBlades = b;
    });
    
    this.api.getRubbers().subscribe(r => {
      this.rubbers = r;
      this.filteredFhRubbers = r;
      this.filteredBhRubbers = r;
    });
  }

  loadProfile(): void {
    this.api.getMe().subscribe({
      next: (p) => {
        this.player = p;
        this.distributeTags();
        if (!this.player.racket) {
          this.player.racket = {};
        }
      },
      error: (err) => console.error(err)
    });
  }

  distributeTags(): void {
    if (!this.player) return;
    const playerTagIds = this.player.tags ? this.player.tags.map(t => t.id) : [];
    
    this.positiveTags = this.allTags.filter(t => playerTagIds.includes(t.id));
    this.negativeTags = this.allTags.filter(t => !playerTagIds.includes(t.id));
  }

  drop(event: CdkDragDrop<PlayerTag[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      if (this.player) {
        this.player.tags = [...this.positiveTags];
        this.saveProfile();
      }
    }
  }
  
  toggleBladeDropdown() {
    this.bladeDropdownOpen = !this.bladeDropdownOpen;
    this.fhDropdownOpen = false;
    this.bhDropdownOpen = false;
    if (this.bladeDropdownOpen) {
      this.searchBladeText = '';
      this.filteredBlades = this.blades;
    }
  }

  toggleFhDropdown() {
    this.fhDropdownOpen = !this.fhDropdownOpen;
    this.bladeDropdownOpen = false;
    this.bhDropdownOpen = false;
    if (this.fhDropdownOpen) {
      this.searchFhText = '';
      this.filteredFhRubbers = this.rubbers;
    }
  }

  toggleBhDropdown() {
    this.bhDropdownOpen = !this.bhDropdownOpen;
    this.bladeDropdownOpen = false;
    this.fhDropdownOpen = false;
    if (this.bhDropdownOpen) {
      this.searchBhText = '';
      this.filteredBhRubbers = this.rubbers;
    }
  }

  filterBlades(event: any) {
    const text = event.target.value.toLowerCase();
    this.searchBladeText = text;
    this.filteredBlades = this.blades.filter(b => b.name.toLowerCase().includes(text));
  }

  filterFhRubbers(event: any) {
    const text = event.target.value.toLowerCase();
    this.searchFhText = text;
    this.filteredFhRubbers = this.rubbers.filter(r => r.name.toLowerCase().includes(text));
  }

  filterBhRubbers(event: any) {
    const text = event.target.value.toLowerCase();
    this.searchBhText = text;
    this.filteredBhRubbers = this.rubbers.filter(r => r.name.toLowerCase().includes(text));
  }

  selectBlade(b: Blade) {
    if (this.player && this.player.racket) {
      this.player.racket.blade = b;
      this.saveProfile();
    }
    this.bladeDropdownOpen = false;
  }

  selectFhRubber(r: Rubber) {
    if (this.player && this.player.racket) {
      this.player.racket.forehandRubber = r;
      this.saveProfile();
    }
    this.fhDropdownOpen = false;
  }

  selectBhRubber(r: Rubber) {
    if (this.player && this.player.racket) {
      this.player.racket.backhandRubber = r;
      this.saveProfile();
    }
    this.bhDropdownOpen = false;
  }

  saveProfile(): void {
    if (!this.player) return;
    this.api.updatePlayer(this.player.id, this.player).subscribe(updated => {
      this.player = updated;
      this.distributeTags();
    });
  }
}
