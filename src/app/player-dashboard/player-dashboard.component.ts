import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './player-dashboard.component.html',
  styleUrl: './player-dashboard.component.scss'
})
export class PlayerDashboardComponent implements OnInit {
  player!: Player;
  blades: Blade[] = [];
  rubbers: Rubber[] = [];
  allTags: PlayerTag[] = [];

  // Dropdown states
  bladeDropdownOpen = false;
  fhDropdownOpen = false;
  bhDropdownOpen = false;

  // Tag lists for Drag & Drop
  positiveTags: PlayerTag[] = [];
  neutralTags: PlayerTag[] = [];
  negativeTags: PlayerTag[] = [];

  private api = inject(ApiService);

  ngOnInit(): void {
    this.api.getBlades().subscribe(data => this.blades = data);
    this.api.getRubbers().subscribe(data => this.rubbers = data);
    
    // Load tags and player
    this.api.getTags().subscribe(tags => {
      this.allTags = tags;
      this.loadPlayer();
    });
  }

  loadPlayer(): void {
    this.api.getPlayer(1).subscribe(data => {
      this.player = data;
      if (!this.player.racket) {
        this.player.racket = {};
      }
      if (!this.player.tagAssignments) {
        this.player.tagAssignments = [];
      }
      this.distributeTags();
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
      alert('Profil mis à jour avec succès !');
    });
  }

  // Dropdown UI Helpers
  toggleBladeDropdown() { this.bladeDropdownOpen = !this.bladeDropdownOpen; this.fhDropdownOpen = false; this.bhDropdownOpen = false; }
  toggleFhDropdown() { this.fhDropdownOpen = !this.fhDropdownOpen; this.bladeDropdownOpen = false; this.bhDropdownOpen = false; }
  toggleBhDropdown() { this.bhDropdownOpen = !this.bhDropdownOpen; this.bladeDropdownOpen = false; this.fhDropdownOpen = false; }

  selectBlade(blade: Blade) {
    this.player.racket!.blade = blade;
    this.bladeDropdownOpen = false;
  }
  selectFhRubber(rubber: Rubber) {
    this.player.racket!.forehandRubber = rubber;
    this.fhDropdownOpen = false;
  }
  selectBhRubber(rubber: Rubber) {
    this.player.racket!.backhandRubber = rubber;
    this.bhDropdownOpen = false;
  }
}
