import { Component, OnInit, ElementRef, ViewChild, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { Player } from '../models/player.model';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private api = inject(ApiService);
  players: Player[] = [];
  
  // Slider state
  minElo: number = 1000;
  maxElo: number = 3000;
  minLimit: number = 300;
  maxLimit: number = 5000;
  
  // Chart
  @ViewChild('brandChart') brandChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sliderTrack') sliderTrackRef!: ElementRef<HTMLDivElement>;
  chartInstance: any;

  ngOnInit() {
    this.api.getPlayers().subscribe(data => {
      this.players = data;
      if (this.chartInstance) {
        this.updateChart();
      }
    });
  }

  ngAfterViewInit() {
    this.initChart();
    this.updateSliderTrack();
    if (this.players.length > 0) {
      this.updateChart();
    }
  }
  
  ngOnDestroy() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
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
    this.updateChart();
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
            displayColors: true
          }
        },
        cutout: '70%'
      }
    });
  }

  updateChart() {
    if (!this.chartInstance || this.players.length === 0) return;
    
    // Filter players by Elo range
    const filteredPlayers = this.players.filter(p => {
      const ranking = p.ranking || 0;
      return ranking >= this.minElo && ranking <= this.maxElo;
    });
    
    // Count blade brands
    const brandCounts: Record<string, number> = {};
    
    filteredPlayers.forEach(p => {
      if (p.racket && p.racket.blade && p.racket.blade.brand) {
        const brandName = p.racket.blade.brand.name;
        brandCounts[brandName] = (brandCounts[brandName] || 0) + 1;
      }
    });
    
    // Sort by count descending
    const sortedBrands = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1]);
      
    const labels = sortedBrands.map(item => item[0]);
    const data = sortedBrands.map(item => item[1]);
    
    this.chartInstance.data.labels = labels;
    this.chartInstance.data.datasets[0].data = data;
    this.chartInstance.update();
  }
}
