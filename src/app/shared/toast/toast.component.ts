import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toastService.toasts()" 
           class="toast-message" 
           [ngClass]="'toast-' + toast.type">
        <span>{{ toast.message }}</span>
        <button class="toast-close" (click)="toastService.remove(toast.id)">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }

    .toast-message {
      pointer-events: auto;
      min-width: 250px;
      max-width: 400px;
      padding: 16px 20px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #fff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      animation: slideIn 0.3s ease-out forwards;
      font-weight: 500;
      backdrop-filter: blur(8px);
    }

    .toast-success {
      background: rgba(34, 197, 94, 0.9);
      border-left: 4px solid #16a34a;
    }

    .toast-error {
      background: rgba(239, 68, 68, 0.9);
      border-left: 4px solid #dc2626;
    }

    .toast-info {
      background: rgba(59, 130, 246, 0.9);
      border-left: 4px solid #2563eb;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.7);
      font-size: 1.2rem;
      cursor: pointer;
      margin-left: 16px;
      transition: color 0.2s;
    }

    .toast-close:hover {
      color: white;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
