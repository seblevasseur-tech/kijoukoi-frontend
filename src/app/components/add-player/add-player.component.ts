import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../api.service';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-add-player',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-player.component.html',
  styleUrl: './add-player.component.scss'
})
export class AddPlayerComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  
  selectedFile: File | null = null;
  isUploading = false;

  downloadTemplate() {
    this.api.downloadExcelTemplate().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template_joueurs.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du modèle:', err);
        this.toast.show('Erreur lors du téléchargement du modèle', 'error');
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  uploadFile() {
    if (!this.selectedFile) return;
    this.isUploading = true;
    
    this.api.uploadExcelFile(this.selectedFile).subscribe({
      next: (res) => {
        this.toast.show(res.message || 'Importation réussie', 'success');
        this.isUploading = false;
        this.selectedFile = null;
        const fileInput = document.getElementById('excelFileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      error: (err) => {
        console.error('Erreur lors de l\'importation:', err);
        this.toast.show(err.error?.message || 'Erreur lors de l\'importation', 'error');
        this.isUploading = false;
      }
    });
  }
}
