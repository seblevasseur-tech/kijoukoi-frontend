import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../api.service';
import { Brand } from '../../models/brand.model';
import { RubberType } from '../../models/rubber-type.model';
import { ToastService } from '../../shared/toast/toast.service';
import { RubberListComponent } from '../rubber-list/rubber-list.component';
import { Rubber } from '../../models/rubber.model';

@Component({
  selector: 'app-add-rubber',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RubberListComponent],
  templateUrl: './add-rubber.component.html',
  styleUrls: ['./add-rubber.component.scss']
})
export class AddRubberComponent implements OnInit {
  addRubberForm: FormGroup;
  brands: Brand[] = [];
  rubberTypes: RubberType[] = [];
  imagePreview: string | ArrayBuffer | null = null;
  imageBase64: string = '';
  isSubmitting = false;
  editingRubberId: number | null = null;

  @ViewChild(RubberListComponent) rubberListComp!: RubberListComponent;

  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  constructor() {
    this.addRubberForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      brandId: ['', Validators.required],
      typeId: ['', Validators.required],
      hardness: ['', [Validators.required, Validators.min(20), Validators.max(70)]],
      image: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.api.getBrands().subscribe(b => this.brands = b);
    this.api.getRubberTypes().subscribe(t => this.rubberTypes = t);
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.match(/image\/(jpeg|png|webp)/)) {
        this.toast.show("Format non supporté. Veuillez utiliser JPG, PNG ou WEBP.", "error");
        this.addRubberForm.get('image')?.setErrors({ invalidType: true });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        this.toast.show("L'image est trop lourde (Max 2MB).", "error");
        this.addRubberForm.get('image')?.setErrors({ maxSize: true });
        return;
      }

      this.addRubberForm.get('image')?.setErrors(null);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = reader.result;
        this.imageBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onEditRubber(rubber: Rubber) {
    this.editingRubberId = rubber.id;
    this.addRubberForm.patchValue({
      name: rubber.name,
      brandId: rubber.brand.id,
      typeId: rubber.rubberType.id,
      hardness: rubber.hardness,
      image: null // We don't have the file object, but it's optional for edit
    });
    this.addRubberForm.get('image')?.clearValidators();
    this.addRubberForm.get('image')?.updateValueAndValidity();
    
    this.imageBase64 = '';
    this.imagePreview = this.api.getBaseUrl() + '/equipment/rubbers/' + rubber.id + '/image';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSubmit() {
    if (this.addRubberForm.invalid || (!this.imageBase64 && !this.editingRubberId)) {
      this.toast.show("Veuillez remplir tous les champs obligatoires et ajouter une image.", "error");
      Object.keys(this.addRubberForm.controls).forEach(key => {
        this.addRubberForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const formValue = this.addRubberForm.value;
    
    const rubberData = {
      name: formValue.name,
      brandId: Number(formValue.brandId),
      typeId: Number(formValue.typeId),
      hardness: Number(formValue.hardness),
      imageBase64: this.imageBase64
    };

    if (this.editingRubberId) {
      this.api.updateRubber(this.editingRubberId, rubberData).subscribe({
        next: (rubber) => {
          this.toast.show("Revêtement modifié avec succès !", "success");
          this.resetForm();
          if (this.rubberListComp) {
            this.rubberListComp.fetchRubbers();
          }
        },
        error: (err) => {
          console.error(err);
          this.toast.show("Erreur lors de la modification du revêtement.", "error");
          this.isSubmitting = false;
        }
      });
    } else {
      this.api.createRubber(rubberData).subscribe({
        next: (rubber) => {
          this.toast.show("Revêtement ajouté avec succès !", "success");
          this.resetForm();
          if (this.rubberListComp) {
            this.rubberListComp.fetchRubbers();
          }
        },
        error: (err) => {
          console.error(err);
          this.toast.show("Erreur lors de l'ajout du revêtement.", "error");
          this.isSubmitting = false;
        }
      });
    }
  }

  resetForm() {
    this.editingRubberId = null;
    this.addRubberForm.reset();
    this.addRubberForm.get('image')?.setValidators(Validators.required);
    this.addRubberForm.get('image')?.updateValueAndValidity();
    this.imagePreview = null;
    this.imageBase64 = '';
    this.isSubmitting = false;
  }
}
