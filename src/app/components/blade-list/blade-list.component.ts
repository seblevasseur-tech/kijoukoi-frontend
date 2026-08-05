import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { ApiService } from '../../api.service';
import { Blade } from '../../models/blade.model';
import { Brand } from '../../models/brand.model';
import { BladeType } from '../../models/blade-type.model';
import { FilterDTO } from '../../models/aggregation.model';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-blade-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSliderModule],
  templateUrl: './blade-list.component.html',
  styleUrl: './blade-list.component.scss'
})
export class BladeListComponent implements OnInit {
  blades: Blade[] = [];
  brands: Brand[] = [];
  bladeTypes: BladeType[] = [];
  private api = inject(ApiService);
  apiUrl = this.api.getBaseUrl();
  
  // Filters
  searchTerm = '';
  selectedBrandIds: number[] = [];
  selectedTypeIds: number[] = [];
  minWeight = 50;
  maxWeight = 110;
  activeDropdown: string | null = null;
  
  private filterSubject = new Subject<void>();

  ngOnInit(): void {
    this.api.getBrands().subscribe(b => this.brands = b);
    this.api.getBladeTypes().subscribe(bt => this.bladeTypes = bt);
    
    this.filterSubject.pipe(debounceTime(300)).subscribe(() => {
      this.fetchBlades();
    });
    
    this.fetchBlades();
  }

  fetchBlades() {
    const filters: FilterDTO[] = [];
    if (this.searchTerm) {
      filters.push({ field: 'name', operator: 'LIKE', value: this.searchTerm });
    }
    if (this.selectedBrandIds.length > 0) {
      filters.push({ field: 'brand.id', operator: 'IN', value: this.selectedBrandIds });
    }
    if (this.selectedTypeIds.length > 0) {
      filters.push({ field: 'type.id', operator: 'IN', value: this.selectedTypeIds });
    }
    if (this.minWeight > 50) {
      filters.push({ field: 'weight', operator: 'GTE', value: this.minWeight });
    }
    if (this.maxWeight < 110) {
      filters.push({ field: 'weight', operator: 'LTE', value: this.maxWeight });
    }

    this.api.searchBlades(filters).subscribe(data => {
      this.blades = data;
    });
  }
  
  onFilterChange() {
    this.filterSubject.next();
  }

  toggleDropdown(dropdown: string, event: Event) {
    event.stopPropagation();
    if (this.activeDropdown === dropdown) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = dropdown;
    }
  }

  toggleFilterArray(event: Event, arrayName: 'selectedBrandIds' | 'selectedTypeIds', id: number) {
    event.stopPropagation();
    const arr = this[arrayName];
    const index = arr.indexOf(id);
    if (index === -1) {
      arr.push(id);
    } else {
      arr.splice(index, 1);
    }
    this.onFilterChange();
  }

  clearFilterArray(event: Event, arrayName: 'selectedBrandIds' | 'selectedTypeIds') {
    event.stopPropagation();
    this[arrayName] = [];
    this.onFilterChange();
  }

  get displayBrands() { return this.brands.filter(b => this.selectedBrandIds.includes(b.id)); }
  get displayTypes() { return this.bladeTypes.filter(bt => this.selectedTypeIds.includes(bt.id)); }
}
