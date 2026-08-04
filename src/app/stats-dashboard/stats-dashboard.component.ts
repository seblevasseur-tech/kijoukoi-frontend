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

@Component({
  selector: 'app-stats-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stats-dashboard.component.html',
  styleUrl: './stats-dashboard.component.scss'
})
export class StatsDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private api = inject(ApiService);
  
  // Slider state
  minElo: number = 1000;
  maxElo: number = 3000;
  minLimit: number = 300;
  maxLimit: number = 5000;

  minAge: number = 5;
  maxAge: number = 99;
  minAgeLimit: number = 5;
  maxAgeLimit: number = 99;

  minHardness: number = 30;
  maxHardness: number = 60;
  minHardnessLimit: number = 30;
  maxHardnessLimit: number = 60;
  
  // Filter Options Data
  brands: Brand[] = [];
  blades: Blade[] = [];
  rubbers: Rubber[] = [];
  tags: PlayerTag[] = [];
  
  // Selected Filters
  selectedBladeBrandId: number | null = null;
  selectedBladeId: number | null = null;
  selectedFhBrandId: number | null = null;
  selectedFhRubberId: number | null = null;
  selectedBhBrandId: number | null = null;
  selectedBhRubberId: number | null = null;
  selectedTagIds: number[] = [];

  // Dropdown States
  activeDropdown: string | null = null;

  // Output Selection
  outputOptions = [
    { label: 'Marque du Bois', value: 'racket.blade.brand.name' },
    { label: 'Modèle du Bois', value: 'racket.blade.name' },
    { label: 'Marque Revêtement CD', value: 'racket.forehandRubber.brand.name' },
    { label: 'Modèle Revêtement CD', value: 'racket.forehandRubber.name' },
    { label: 'Marque Revêtement RV', value: 'racket.backhandRubber.brand.name' },
    { label: 'Revêtement Revers', value: 'racket.backhandRubber.name' },
    { label: 'Étiquettes (Tags)', value: 'tags.name' },
    { label: 'Âge du joueur', value: 'age' },
    { label: 'Dureté revêtement CD', value: 'racket.forehandRubber.hardness' },
    { label: 'Dureté revêtement Revers', value: 'racket.backhandRubber.hardness' }
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
  get displayFhBrand() { return this.brands.find(b => b.id === this.selectedFhBrandId) || null; }
  get displayFhRubber() { return this.rubbers.find(r => r.id === this.selectedFhRubberId) || null; }
  get displayBhBrand() { return this.brands.find(b => b.id === this.selectedBhBrandId) || null; }
  get displayBhRubber() { return this.rubbers.find(r => r.id === this.selectedBhRubberId) || null; }
  get displayTags() { return this.tags.filter(t => this.selectedTagIds.includes(t.id)); }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.activeDropdown = null;
    }
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
      rubbers: this.api.getRubbers(),
      tags: this.api.getTags()
    }).subscribe(data => {
      this.brands = data.brands;
      this.blades = data.blades;
      this.rubbers = data.rubbers;
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

  onEloChange(isMin: boolean) {
    if (this.minElo >= this.maxElo) { isMin ? this.minElo = this.maxElo - 10 : this.maxElo = this.minElo + 10; }
    this.sliderSubject.next();
  }

  onAgeChange(isMin: boolean) {
    if (this.minAge >= this.maxAge) { isMin ? this.minAge = this.maxAge - 1 : this.maxAge = this.minAge + 1; }
    this.sliderSubject.next();
  }

  onHardnessChange(isMin: boolean) {
    if (this.minHardness >= this.maxHardness) { isMin ? this.minHardness = this.maxHardness - 1 : this.maxHardness = this.minHardness + 1; }
    this.sliderSubject.next();
  }

  get eloLeft() { return ((this.minElo - this.minLimit) / (this.maxLimit - this.minLimit)) * 100; }
  get eloWidth() { return ((this.maxElo - this.minLimit) / (this.maxLimit - this.minLimit)) * 100 - this.eloLeft; }
  
  get ageLeft() { return ((this.minAge - this.minAgeLimit) / (this.maxAgeLimit - this.minAgeLimit)) * 100; }
  get ageWidth() { return ((this.maxAge - this.minAgeLimit) / (this.maxAgeLimit - this.minAgeLimit)) * 100 - this.ageLeft; }
  
  get hardnessLeft() { return ((this.minHardness - this.minHardnessLimit) / (this.maxHardnessLimit - this.minHardnessLimit)) * 100; }
  get hardnessWidth() { return ((this.maxHardness - this.minHardnessLimit) / (this.maxHardnessLimit - this.minHardnessLimit)) * 100 - this.hardnessLeft; }

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
    
    if (this.minHardness > this.minHardnessLimit) {
      filters.push({ field: 'racket.forehandRubber.hardness', operator: 'GTE', value: this.minHardness });
    }
    if (this.maxHardness < this.maxHardnessLimit) {
      filters.push({ field: 'racket.forehandRubber.hardness', operator: 'LTE', value: this.maxHardness });
    }

    if (this.selectedBladeBrandId) filters.push({ field: 'racket.blade.brand.id', operator: 'EQ', value: Number(this.selectedBladeBrandId) });
    if (this.selectedBladeId) filters.push({ field: 'racket.blade.id', operator: 'EQ', value: Number(this.selectedBladeId) });
    
    if (this.selectedFhBrandId) filters.push({ field: 'racket.forehandRubber.brand.id', operator: 'EQ', value: Number(this.selectedFhBrandId) });
    if (this.selectedFhRubberId) filters.push({ field: 'racket.forehandRubber.id', operator: 'EQ', value: Number(this.selectedFhRubberId) });
    
    if (this.selectedBhBrandId) filters.push({ field: 'racket.backhandRubber.brand.id', operator: 'EQ', value: Number(this.selectedBhBrandId) });
    if (this.selectedBhRubberId) filters.push({ field: 'racket.backhandRubber.id', operator: 'EQ', value: Number(this.selectedBhRubberId) });
    
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
