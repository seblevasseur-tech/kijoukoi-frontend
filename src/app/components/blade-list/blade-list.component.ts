import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../api.service';
import { Blade } from '../../models/blade.model';

@Component({
  selector: 'app-blade-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blade-list.component.html',
  styleUrl: './blade-list.component.scss'
})
export class BladeListComponent implements OnInit {
  blades: Blade[] = [];
  private api = inject(ApiService);

  ngOnInit(): void {
    this.api.getBlades().subscribe(data => {
      this.blades = data;
    });
  }
}
