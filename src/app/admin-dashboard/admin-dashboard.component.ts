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
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private api = inject(ApiService);
  
  // Slider state
  minElo: number = 1000;
  maxElo: number = 3000;
  minLimit: number = 300;
  maxLimit: number = 5000;
  
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
  selectedTagId: number | null = null;

  // Dropdown States
  activeDropdown: string | null = null;

  // Output Selection
  outputOptions = [
    { label: 'Marque du Bois', value: 'racket.blade.brand.name' },
    { label: 'Modèle du Bois', value: 'racket.blade.name' },
    { label: 'Marque Revêtement CD', value: 'racket.forehandRubber.brand.name' },
    { label: 'Modèle Revêtement CD', value: 'racket.forehandRubber.name' },
    { label: 'Marque Revêtement RV', value: 'racket.backhandRubber.brand.name' },
    { label: 'Modèle Revêtement RV', value: 'racket.backhandRubber.name' },
    { label: 'Étiquettes (Tags)', value: 'tags.name' }
  ];
  selectedOutput = 'racket.blade.brand.name';

  // Debounce subject for API calls
  sliderSubject = new Subject<void>();
  private sliderSub!: Subscription;
  
  // Chart
  @ViewChild('brandChart') brandChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sliderTrack') sliderTrackRef!: ElementRef<HTMLDivElement>;
  chartInstance: any;

  // Helpers for displaying selected values
  get displayBladeBrand() { return this.brands.find(b => b.id === this.selectedBladeBrandId) || null; }
  get displayBlade() { return this.blades.find(b => b.id === this.selectedBladeId) || null; }
  get displayFhBrand() { return this.brands.find(b => b.id === this.selectedFhBrandId) || null; }
  get displayFhRubber() { return this.rubbers.find(r => r.id === this.selectedFhRubberId) || null; }
  get displayBhBrand() { return this.brands.find(b => b.id === this.selectedBhBrandId) || null; }
  get displayBhRubber() { return this.rubbers.find(r => r.id === this.selectedBhRubberId) || null; }
  get displayTag() { return this.tags.find(t => t.id === this.selectedTagId) || null; }

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
    this.updateSliderTrack();
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

  onSliderChange(isMin: boolean) {
    if (this.minElo >= this.maxElo) {
      if (isMin) {
        this.minElo = this.maxElo - 10;
      } else {
        this.maxElo = this.minElo + 10;
      }
    }
    this.updateSliderTrack();
    this.sliderSubject.next();
  }

  updateSliderTrack() {
    if (!this.sliderTrackRef) return;
    const minPercent = ((this.minElo - this.minLimit) / (this.maxLimit - this.minLimit)) * 100;
    const maxPercent = ((this.maxElo - this.minLimit) / (this.maxLimit - this.minLimit)) * 100;
    
    this.sliderTrackRef.nativeElement.style.left = `${minPercent}%`;
    this.sliderTrackRef.nativeElement.style.width = `${maxPercent - minPercent}%`;
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

    if (this.selectedBladeBrandId) filters.push({ field: 'racket.blade.brand.id', operator: 'EQ', value: Number(this.selectedBladeBrandId) });
    if (this.selectedBladeId) filters.push({ field: 'racket.blade.id', operator: 'EQ', value: Number(this.selectedBladeId) });
    
    if (this.selectedFhBrandId) filters.push({ field: 'racket.forehandRubber.brand.id', operator: 'EQ', value: Number(this.selectedFhBrandId) });
    if (this.selectedFhRubberId) filters.push({ field: 'racket.forehandRubber.id', operator: 'EQ', value: Number(this.selectedFhRubberId) });
    
    if (this.selectedBhBrandId) filters.push({ field: 'racket.backhandRubber.brand.id', operator: 'EQ', value: Number(this.selectedBhBrandId) });
    if (this.selectedBhRubberId) filters.push({ field: 'racket.backhandRubber.id', operator: 'EQ', value: Number(this.selectedBhRubberId) });
    
    if (this.selectedTagId) filters.push({ field: 'tags.id', operator: 'EQ', value: Number(this.selectedTagId) });

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
