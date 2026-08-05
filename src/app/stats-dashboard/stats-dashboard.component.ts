import { Component, OnInit, ElementRef, ViewChild, inject, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import Chart from 'chart.js/auto';
import { Subject, Subscription, forkJoin } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AggregationRequestDTO, FilterDTO } from '../models/aggregation.model';
import { Brand } from '../models/brand.model';
import { Rubber } from '../models/rubber.model';
import { PlayerTag } from '../models/player-tag.model';
import { Blade } from '../models/blade.model';
import { BladeType } from '../models/blade-type.model';
import { RubberType } from '../models/rubber-type.model';
import { COUNTRIES, Country, countryFlagUrl } from '../models/country.model';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-stats-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSliderModule],
  templateUrl: './stats-dashboard.component.html',
  styleUrl: './stats-dashboard.component.scss'
})
export class StatsDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private api = inject(ApiService);
  
  // Slider state
  minElo: number = 1000;
  maxElo: number = 3000;
  minLimit: number = 500;
  maxLimit: number = 5000;

  minAge: number = 5;
  maxAge: number = 99;
  minAgeLimit: number = 5;
  maxAgeLimit: number = 99;

  minHardnessFh: number = 30;
  maxHardnessFh: number = 60;
  minHardnessBh: number = 30;
  maxHardnessBh: number = 60;
  minHardnessLimit: number = 30;
  maxHardnessLimit: number = 60;
  
  // Filter Options Data
  brands: Brand[] = [];
  blades: Blade[] = [];
  bladeTypes: BladeType[] = [];
  rubbers: Rubber[] = [];
  rubberTypes: RubberType[] = [];
  tags: PlayerTag[] = [];
  
  // Selected Filters
  selectedBladeBrandId: number | null = null;
  selectedBladeId: number | null = null;
  selectedBladeTypeId: number | null = null;
  selectedGender: string = 'ALL';
  selectedCountryCode: string | null = null;
  isCountryDropdownOpen = false;
  countries = [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  selectedFhBrandId: number | null = null;
  selectedFhRubberId: number | null = null;
  selectedFhTypeId: number | null = null;
  selectedBhBrandId: number | null = null;
  selectedBhRubberId: number | null = null;
  selectedBhTypeId: number | null = null;
  selectedTagIds: number[] = [];

  // Dropdown States
  activeDropdown: string | null = null;

  // Output Selection
  outputOptions = [
    { label: 'Dureté revêtement CD', value: 'racket.forehandRubber.hardness' },
    { label: 'Dureté revêtement Revers', value: 'racket.backhandRubber.hardness' },
    { label: 'Genre', value: 'gender' },
    { label: 'Marque Revêtement CD', value: 'racket.forehandRubber.brand.name' },
    { label: 'Marque Revêtement RV', value: 'racket.backhandRubber.brand.name' },
    { label: 'Marque du Bois', value: 'racket.blade.brand.name' },
    { label: 'Modèle Revêtement CD', value: 'racket.forehandRubber.name' },
    { label: 'Modèle du Bois', value: 'racket.blade.name' },
    { label: 'Nationalité', value: 'nationality' },
    { label: 'Revêtement Revers', value: 'racket.backhandRubber.name' },
    { label: 'Type Revêtement CD', value: 'racket.forehandRubber.rubberType.name' },
    { label: 'Type Revêtement RV', value: 'racket.backhandRubber.rubberType.name' },
    { label: 'Type de bois', value: 'racket.blade.bladeType.name' },
    { label: 'Âge du joueur', value: 'age' },
    { label: 'Étiquettes', value: 'tags.name' }
  ];
  selectedOutput = 'racket.blade.brand.name';

  // Debounce subject for API calls
  sliderSubject = new Subject<void>();
  private sliderSub!: Subscription;
  
  // Chart
  @ViewChild('brandChart') brandChartRef!: ElementRef<HTMLCanvasElement>;
  chartInstance: any;

  // Helpers for displaying selected values
  get displayBladeBrand() { return this.brands.find(b => b.id === this.selectedBladeBrandId) || null; }
  get displayBlade() { return this.blades.find(b => b.id === this.selectedBladeId) || null; }
  get displayBladeType() { return this.bladeTypes.find(bt => bt.id === this.selectedBladeTypeId) || null; }
  get displayFhBrand() { return this.brands.find(b => b.id === this.selectedFhBrandId) || null; }
  get displayFhRubber() { return this.rubbers.find(r => r.id === this.selectedFhRubberId) || null; }
  get displayFhType() { return this.rubberTypes.find(rt => rt.id === this.selectedFhTypeId) || null; }
  get displayBhBrand() { return this.brands.find(b => b.id === this.selectedBhBrandId) || null; }
  get displayBhRubber() { return this.rubbers.find(r => r.id === this.selectedBhRubberId) || null; }
  get displayBhType() { return this.rubberTypes.find(rt => rt.id === this.selectedBhTypeId) || null; }
  get displayTags() { return this.tags.filter(t => this.selectedTagIds.includes(t.id)); }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown') && !target.closest('.country-dropdown')) {
      this.activeDropdown = null;
      this.isCountryDropdownOpen = false;
    }
  }

  getCountryFlagUrl(code: string | null): string {
    return countryFlagUrl(code);
  }

  getCountry(code: string | null): Country | undefined {
    return this.countries.find((c) => c.code === code);
  }

  toggleCountryDropdown(event: Event): void {
    event.stopPropagation();
    this.isCountryDropdownOpen = !this.isCountryDropdownOpen;
    this.activeDropdown = null;
  }

  selectCountry(code: string | null): void {
    this.selectedCountryCode = code;
    this.isCountryDropdownOpen = false;
    this.sliderSubject.next();
  }

  ngOnInit() {
    this.loadFilterOptions();

    this.sliderSub = this.sliderSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.fetchChartData();
    });
  }

  ngAfterViewInit() {
    this.initChart();
    this.fetchChartData();
  }
  
  ngOnDestroy() {
    if (this.sliderSub) {
      this.sliderSub.unsubscribe();
    }
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  loadFilterOptions() {
    forkJoin({
      brands: this.api.getBrands(),
      blades: this.api.getBlades(),
      bladeTypes: this.api.getBladeTypes(),
      rubbers: this.api.getRubbers(),
      rubberTypes: this.api.getRubberTypes(),
      tags: this.api.getTags()
    }).subscribe(data => {
      this.brands = data.brands;
      this.blades = data.blades;
      this.bladeTypes = data.bladeTypes;
      this.rubbers = data.rubbers;
      this.rubberTypes = data.rubberTypes;
      this.tags = data.tags;
    });
  }

  toggleDropdown(dropdownName: string, event: Event) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === dropdownName ? null : dropdownName;
  }

  selectFilter(filterName: string, id: number | null) {
    (this as any)[filterName] = id;
    this.activeDropdown = null;
    this.sliderSubject.next();
  }

  toggleTagSelection(event: Event, id: number) {
    event.stopPropagation();
    const index = this.selectedTagIds.indexOf(id);
    if (index === -1) {
      this.selectedTagIds.push(id);
    } else {
      this.selectedTagIds.splice(index, 1);
    }
    this.sliderSubject.next();
  }

  clearTags(event: Event) {
    event.stopPropagation();
    this.selectedTagIds = [];
    this.activeDropdown = null;
    this.sliderSubject.next();
  }

  initChart() {
    const ctx = this.brandChartRef.nativeElement.getContext('2d');
    if (!ctx) return;
    
    Chart.defaults.color = '#a1a1aa';
    Chart.defaults.font.family = "'Inter', sans-serif";
    
    this.chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            '#4ade80', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa', 
            '#38bdf8', '#fb923c', '#34d399', '#f87171', '#818cf8'
          ],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 20,
              font: {
                size: 14
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(30, 30, 30, 0.9)',
            padding: 12,
            titleFont: { size: 14 },
            bodyFont: { size: 14 },
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (label) {
                  label += ': ';
                }
                const value = context.parsed;
                const dataset = context.dataset;
                const dataArr = dataset.data as number[];
                const total = dataArr.reduce((acc: number, current: number) => acc + current, 0);
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                label += `${value} joueurs (${percentage}%)`;
                return label;
              }
            }
          }
        },
        cutout: '70%'
      }
    });
  }

  fetchChartData() {
    const filters: FilterDTO[] = [
      { field: 'ranking', operator: 'GTE', value: this.minElo },
      { field: 'ranking', operator: 'LTE', value: this.maxElo }
    ];

    if (this.minAge > this.minAgeLimit) filters.push({ field: 'age', operator: 'GTE', value: this.minAge });
    if (this.maxAge < this.maxAgeLimit) filters.push({ field: 'age', operator: 'LTE', value: this.maxAge });
    
    if (this.minHardnessFh > this.minHardnessLimit) {
      filters.push({ field: 'racket.forehandRubber.hardness', operator: 'GTE', value: this.minHardnessFh });
    }
    if (this.maxHardnessFh < this.maxHardnessLimit) {
      filters.push({ field: 'racket.forehandRubber.hardness', operator: 'LTE', value: this.maxHardnessFh });
    }
    if (this.minHardnessBh > this.minHardnessLimit) {
      filters.push({ field: 'racket.backhandRubber.hardness', operator: 'GTE', value: this.minHardnessBh });
    }
    if (this.maxHardnessBh < this.maxHardnessLimit) {
      filters.push({ field: 'racket.backhandRubber.hardness', operator: 'LTE', value: this.maxHardnessBh });
    }

    if (this.selectedGender !== 'ALL') {
      filters.push({ field: 'gender', operator: 'EQ', value: this.selectedGender });
    }

    if (this.selectedCountryCode) {
      filters.push({ field: 'nationality', operator: 'EQ', value: this.selectedCountryCode });
    }

    if (this.selectedBladeTypeId) filters.push({ field: 'racket.blade.bladeType.id', operator: 'EQ', value: Number(this.selectedBladeTypeId) });

    if (this.selectedBladeBrandId) filters.push({ field: 'racket.blade.brand.id', operator: 'EQ', value: Number(this.selectedBladeBrandId) });
    if (this.selectedBladeId) filters.push({ field: 'racket.blade.id', operator: 'EQ', value: Number(this.selectedBladeId) });
    
    if (this.selectedFhBrandId) filters.push({ field: 'racket.forehandRubber.brand.id', operator: 'EQ', value: Number(this.selectedFhBrandId) });
    if (this.selectedFhRubberId) filters.push({ field: 'racket.forehandRubber.id', operator: 'EQ', value: Number(this.selectedFhRubberId) });
    if (this.selectedFhTypeId) filters.push({ field: 'racket.forehandRubber.rubberType.id', operator: 'EQ', value: Number(this.selectedFhTypeId) });
    
    if (this.selectedBhBrandId) filters.push({ field: 'racket.backhandRubber.brand.id', operator: 'EQ', value: Number(this.selectedBhBrandId) });
    if (this.selectedBhRubberId) filters.push({ field: 'racket.backhandRubber.id', operator: 'EQ', value: Number(this.selectedBhRubberId) });
    if (this.selectedBhTypeId) filters.push({ field: 'racket.backhandRubber.rubberType.id', operator: 'EQ', value: Number(this.selectedBhTypeId) });
    
    if (this.selectedTagIds.length > 0) filters.push({ field: 'tags.id', operator: 'IN', value: this.selectedTagIds });

    const request: AggregationRequestDTO = {
      groupBy: this.selectedOutput,
      metric: 'COUNT',
      filters: filters
    };

    this.api.postAggregation(request).subscribe(stats => {
      if (!this.chartInstance) return;
      
      const total = stats.reduce((acc, s) => acc + (s.value as number), 0);
      
      const labels = stats.map(s => {
        const percentage = total > 0 ? Math.round((s.value as number / total) * 100) : 0;
        return `${s.label} - ${percentage}%`;
      });
      
      const data = stats.map(s => s.value);
      
      this.chartInstance.data.labels = labels;
      this.chartInstance.data.datasets[0].data = data;
      this.chartInstance.update();
    });
  }
}
