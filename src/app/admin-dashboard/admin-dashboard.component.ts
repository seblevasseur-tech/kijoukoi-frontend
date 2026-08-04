import { Component, OnInit, ElementRef, ViewChild, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import Chart from 'chart.js/auto';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AggregationRequestDTO } from '../models/aggregation.model';

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
  
  // Debounce subject for API calls
  private sliderSubject = new Subject<void>();
  private sliderSub!: Subscription;
  
  // Chart
  @ViewChild('brandChart') brandChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sliderTrack') sliderTrackRef!: ElementRef<HTMLDivElement>;
  chartInstance: any;

  ngOnInit() {
    this.sliderSub = this.sliderSubject.pipe(
      debounceTime(300) // 300ms debounce
    ).subscribe(() => {
      this.fetchChartData();
    });
  }

  ngAfterViewInit() {
    this.initChart();
    this.updateSliderTrack();
    this.fetchChartData(); // initial fetch
  }
  
  ngOnDestroy() {
    if (this.sliderSub) {
      this.sliderSub.unsubscribe();
    }
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
    this.sliderSubject.next(); // trigger debounce
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
    const request: AggregationRequestDTO = {
      groupBy: 'racket.blade.brand.name',
      metric: 'COUNT',
      filters: [
        { field: 'ranking', operator: 'GTE', value: this.minElo },
        { field: 'ranking', operator: 'LTE', value: this.maxElo }
      ]
    };

    this.api.postAggregation(request).subscribe(stats => {
      if (!this.chartInstance) return;
      
      const labels = stats.map(s => s.label);
      const data = stats.map(s => s.value);
      
      this.chartInstance.data.labels = labels;
      this.chartInstance.data.datasets[0].data = data;
      this.chartInstance.update();
    });
  }
}
