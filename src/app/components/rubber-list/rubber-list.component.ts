import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { ApiService } from '../../api.service';
import { Rubber } from '../../models/rubber.model';
import { Brand } from '../../models/brand.model';
import { RubberType } from '../../models/rubber-type.model';
import { FilterDTO } from '../../models/aggregation.model';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-rubber-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSliderModule],
  templateUrl: './rubber-list.component.html',
  styleUrl: './rubber-list.component.scss'
})
export class RubberListComponent implements OnInit {
  rubbers: Rubber[] = [];
  brands: Brand[] = [];
  rubberTypes: RubberType[] = [];
  private api = inject(ApiService);
  apiUrl = this.api.getBaseUrl();
  
  // Filters
  searchTerm = '';
  selectedBrandIds: number[] = [];
  selectedTypeIds: number[] = [];
  minHardness = 30;
  maxHardness = 65;
  activeDropdown: string | null = null;
  
  private filterSubject = new Subject<void>();

  ngOnInit(): void {
    this.api.getBrands().subscribe(b => this.brands = b);
    this.api.getRubberTypes().subscribe(rt => this.rubberTypes = rt);
    
    this.filterSubject.pipe(debounceTime(300)).subscribe(() => {
      this.fetchRubbers();
    });
    
    this.fetchRubbers();
  }

  fetchRubbers() {
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
    if (this.minHardness > 30) {
      filters.push({ field: 'hardness', operator: 'GTE', value: this.minHardness });
    }
    if (this.maxHardness < 65) {
      filters.push({ field: 'hardness', operator: 'LTE', value: this.maxHardness });
    }

    this.api.searchRubbers(filters).subscribe(data => {
      this.rubbers = data;
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
  get displayTypes() { return this.rubberTypes.filter(rt => this.selectedTypeIds.includes(rt.id)); }
}
