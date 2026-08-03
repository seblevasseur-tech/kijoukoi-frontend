import { Component, OnInit, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ApiService } from '../api.service';
import { Player } from '../models/player.model';
import { Blade } from '../models/blade.model';
import { Rubber } from '../models/rubber.model';
import { PlayerTag } from '../models/player-tag.model';
import { PlayerTagAssignment } from '../models/player-tag-assignment.model';

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

  // Tag lists for Drag & Drop
  positiveTags: PlayerTag[] = [];
  neutralTags: PlayerTag[] = [];
  negativeTags: PlayerTag[] = [];

  private api = inject(ApiService);

  constructor() {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // 1. Fetch available equipment and tags
    forkJoin({
      blades: this.api.getBlades(),
      rubbers: this.api.getRubbers(),
      tags: this.api.getTags()
    }).subscribe(res => {
      this.blades = res.blades;
      this.rubbers = res.rubbers;
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
          this.player = { id: 0, login: 'Visiteur', password: '', racket: { blade: undefined, forehandRubber: undefined, backhandRubber: undefined }, tagAssignments: [] };
          this.distributeTags();
        }
      });
    });
  }

  distributeTags(): void {
    this.positiveTags = [];
    this.negativeTags = [];
    this.neutralTags = [...this.allTags];

    if (this.player.tagAssignments) {
      for (const assignment of this.player.tagAssignments) {
        // Remove from neutral
        this.neutralTags = this.neutralTags.filter(t => t.id !== assignment.tag.id);
        
        if (assignment.isPositive) {
          this.positiveTags.push(assignment.tag);
        } else {
          this.negativeTags.push(assignment.tag);
        }
      }
    }
  }

  drop(event: CdkDragDrop<PlayerTag[]>): void {
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
    // Reconstruct tagAssignments
    this.player.tagAssignments = [];
    
    this.positiveTags.forEach(tag => {
      this.player.tagAssignments!.push({ tag: tag, isPositive: true });
    });
    
    this.negativeTags.forEach(tag => {
      this.player.tagAssignments!.push({ tag: tag, isPositive: false });
    });

    this.api.updatePlayer(this.player.id, this.player).subscribe(updated => {
      this.player = updated;
    });
  }

  // Dropdown UI Helpers
  toggleBladeDropdown() { this.bladeDropdownOpen = !this.bladeDropdownOpen; this.fhDropdownOpen = false; this.bhDropdownOpen = false; }
  toggleFhDropdown() { this.fhDropdownOpen = !this.fhDropdownOpen; this.bladeDropdownOpen = false; this.bhDropdownOpen = false; }
  toggleBhDropdown() { this.bhDropdownOpen = !this.bhDropdownOpen; this.bladeDropdownOpen = false; this.fhDropdownOpen = false; }

  selectBlade(blade: Blade) {
    this.player.racket!.blade = blade;
    this.bladeDropdownOpen = false;
    this.saveProfile();
  }
  selectFhRubber(rubber: Rubber) {
    this.player.racket!.forehandRubber = rubber;
    this.fhDropdownOpen = false;
    this.saveProfile();
  }
  selectBhRubber(rubber: Rubber) {
    this.player.racket!.backhandRubber = rubber;
    this.bhDropdownOpen = false;
    this.saveProfile();
  }
}
