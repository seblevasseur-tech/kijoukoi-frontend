import { Component, OnInit, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ApiService } from '../api.service';
import { ToastService } from '../shared/toast/toast.service';
import { Player } from '../models/player.model';
import { Blade } from '../models/blade.model';
import { Rubber } from '../models/rubber.model';
import { PlayerTag } from '../models/player-tag.model';

@Component({
  selector: 'app-player-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, RouterModule],
  templateUrl: './player-dashboard.component.html',
  styleUrl: './player-dashboard.component.scss'
})
export class PlayerDashboardComponent implements OnInit {
  player!: Player;
  blades: Blade[] = [];
  rubbers: Rubber[] = [];
  allTags: PlayerTag[] = [];
  isAuthenticated = false;

  // Dropdown states
  bladeDropdownOpen = false;
  fhDropdownOpen = false;
  bhDropdownOpen = false;
  
  bladesLoaded = false;
  rubbersLoaded = false;

  // Tag lists for Drag & Drop
  positiveTags: PlayerTag[] = [];
  negativeTags: PlayerTag[] = [];

  private api = inject(ApiService);
  private toastService = inject(ToastService);
  apiUrl = this.api.getBaseUrl();

  constructor() {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // 1. Fetch tags only initially
    forkJoin({
      tags: this.api.getTags()
    }).subscribe(res => {
      this.allTags = res.tags;
      
      // 2. Fetch logged-in user profile
      this.api.getMe().subscribe({
        next: (player) => {
          this.isAuthenticated = true;
          this.player = player;
          if (!this.player.racket) {
            this.player.racket = { blade: undefined, forehandRubber: undefined, backhandRubber: undefined };
          }
          this.distributeTags();
        },
        error: (err) => {
          this.isAuthenticated = false;
          // Set a fake player to render the UI greyed out
          this.player = { id: 0, login: 'Visiteur', racket: { blade: undefined, forehandRubber: undefined, backhandRubber: undefined }, tags: [] };
          this.distributeTags();
        }
      });
    });
  }

  distributeTags(): void {
    this.positiveTags = this.player.tags || [];
    const positiveIds = this.positiveTags.map(t => t.id);
    this.negativeTags = this.allTags.filter(t => !positiveIds.includes(t.id));
  }

  drop(event: CdkDragDrop<PlayerTag[]>): void {
    if (!this.isAuthenticated) {
      this.toastService.show("Veuillez vous connecter pour modifier votre profil.", "error");
      return;
    }
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    this.saveProfile();
  }

  saveProfile(): void {
    if (!this.isAuthenticated) {
      this.toastService.show("Veuillez vous connecter pour modifier votre profil.", "error");
      return;
    }
    
    this.player.tags = this.positiveTags;

    this.api.updatePlayer(this.player.id, this.player).subscribe(updated => {
      this.player = updated;
      this.toastService.show("Profil sauvegardé", "success");
    });
  }

  // Dropdown UI Helpers
  toggleBladeDropdown() { 
    this.bladeDropdownOpen = !this.bladeDropdownOpen; 
    this.fhDropdownOpen = false; 
    this.bhDropdownOpen = false; 
    
    if (this.bladeDropdownOpen && !this.bladesLoaded) {
      this.api.getBlades().subscribe(b => {
        this.blades = b;
        this.bladesLoaded = true;
      });
    }
  }

  toggleFhDropdown() { 
    this.fhDropdownOpen = !this.fhDropdownOpen; 
    this.bladeDropdownOpen = false; 
    this.bhDropdownOpen = false; 
    
    if (this.fhDropdownOpen && !this.rubbersLoaded) {
      this.api.getRubbers().subscribe(r => {
        this.rubbers = r;
        this.rubbersLoaded = true;
      });
    }
  }

  toggleBhDropdown() { 
    this.bhDropdownOpen = !this.bhDropdownOpen; 
    this.bladeDropdownOpen = false; 
    this.fhDropdownOpen = false; 
    
    if (this.bhDropdownOpen && !this.rubbersLoaded) {
      this.api.getRubbers().subscribe(r => {
        this.rubbers = r;
        this.rubbersLoaded = true;
      });
    }
  }

  selectBlade(blade: Blade) {
    if (!this.isAuthenticated) {
      this.toastService.show("Veuillez vous connecter pour modifier votre profil.", "error");
      this.bladeDropdownOpen = false;
      return;
    }
    this.player.racket!.blade = blade;
    this.bladeDropdownOpen = false;
    this.saveProfile();
  }
  selectFhRubber(rubber: Rubber) {
    if (!this.isAuthenticated) {
      this.toastService.show("Veuillez vous connecter pour modifier votre profil.", "error");
      this.fhDropdownOpen = false;
      return;
    }
    this.player.racket!.forehandRubber = rubber;
    this.fhDropdownOpen = false;
    this.saveProfile();
  }
  selectBhRubber(rubber: Rubber) {
    if (!this.isAuthenticated) {
      this.toastService.show("Veuillez vous connecter pour modifier votre profil.", "error");
      this.bhDropdownOpen = false;
      return;
    }
    this.player.racket!.backhandRubber = rubber;
    this.bhDropdownOpen = false;
    this.saveProfile();
  }
}
