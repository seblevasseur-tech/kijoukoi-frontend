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
  imagePreview: string | ArrayBuffer | null = null;
  imageBase64: string = '';
  isSubmitting = false;

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
      if (!file.type.match(/image\/(jpeg|png|webp)/)) {
        this.toastService.show("Format non supporté. Veuillez utiliser JPG, PNG ou WEBP.", "error");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        this.toastService.show("L'image est trop lourde (Max 2MB).", "error");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = reader.result;
        this.imageBase64 = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.bladeForm.invalid) {
      this.toastService.show("Veuillez remplir tous les champs obligatoires.", "error");
      Object.keys(this.bladeForm.controls).forEach(key => {
        this.bladeForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const payload = {
      ...this.bladeForm.value,
      imageBase64: this.imageBase64
    };

    this.api.createBlade(payload).subscribe({
      next: () => {
        this.toastService.show('Bois ajouté avec succès !', 'success');
        this.resetForm();
        if (this.bladeList) {
          this.bladeList.fetchBlades();
        }
      },
      error: (err) => {
        console.error(err);
        this.toastService.show("Erreur lors de l'ajout du bois.", "error");
        this.isSubmitting = false;
      }
    });
  }

  resetForm() {
    this.bladeForm.reset();
    this.imagePreview = null;
    this.imageBase64 = '';
    this.isSubmitting = false;
  }
}
