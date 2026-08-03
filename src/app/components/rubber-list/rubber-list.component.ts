import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../api.service';
import { Rubber } from '../../models/rubber.model';

@Component({
  selector: 'app-rubber-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rubber-list.component.html',
  styleUrl: './rubber-list.component.scss'
})
export class RubberListComponent implements OnInit {
  rubbers: Rubber[] = [];
  private api = inject(ApiService);

  ngOnInit(): void {
    this.api.getRubbers().subscribe(data => {
      this.rubbers = data;
    });
  }
}
