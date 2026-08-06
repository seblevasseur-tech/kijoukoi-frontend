import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../api.service';
import { Brand } from '../../models/brand.model';
import { BladeType } from '../../models/blade-type.model';
import { BladeListComponent } from '../blade-list/blade-list.component';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-add-blade',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BladeListComponent],
  templateUrl: './add-blade.component.html',
  styleUrl: './add-blade.component.scss'
})
export class AddBladeComponent implements OnInit {
  @ViewChild('bladeList') bladeList!: BladeListComponent;
  
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private toastService = inject(ToastService);
  
  bladeForm!: FormGroup;
  brands: Brand[] = [];
  bladeTypes: BladeType[] = [];
  imageBase64: string = '';
  imageFileName: string = '';

  ngOnInit() {
    this.bladeForm = this.fb.group({
      name: ['', Validators.required],
      brandId: ['', Validators.required],
      weight: ['', [Validators.required, Validators.min(20), Validators.max(200)]],
      typeId: ['', Validators.required]
    });

    this.api.getBrands().subscribe(res => this.brands = res);
    this.api.getBladeTypes().subscribe(res => this.bladeTypes = res);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageFileName = file.name;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageBase64 = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.bladeForm.valid) {
      const payload = {
        ...this.bladeForm.value,
        imageBase64: this.imageBase64
      };

      this.api.createBlade(payload).subscribe({
        next: () => {
          this.toastService.show('Bois ajouté avec succès !');
          this.bladeForm.reset();
          this.imageBase64 = '';
          this.imageFileName = '';
          if (this.bladeList) {
            this.bladeList.fetchBlades();
          }
        },
        error: (err) => {
          console.error(err);
          this.toastService.show("Erreur lors de l'ajout du bois.");
        }
      });
    }
  }
}
