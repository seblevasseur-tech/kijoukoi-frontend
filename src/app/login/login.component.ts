import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginData = { login: '', password: '' };
  errorMessage = '';
  isPasswordFocused = false;
  
  private authService = inject(AuthService);
  private router = inject(Router);

  // Calcule la position des pupilles en fonction de la taille du texte
  get eyeTranslation(): string {
    if (this.isPasswordFocused) return 'translate(0, 0)';
    const length = this.loginData.login.length;
    // On bouge les yeux de 0px à 12px vers la droite max
    const moveX = Math.min(length * 0.8, 12); 
    // On bouge légèrement vers le bas
    const moveY = Math.min(length * 0.2, 4);
    return `translate(${moveX}px, ${moveY}px)`;
  }

  onPasswordFocus() {
    this.isPasswordFocused = true;
  }

  onPasswordBlur() {
    this.isPasswordFocused = false;
  }

  onSubmit() {
    if (!this.loginData.login || !this.loginData.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }
    
    this.authService.login(this.loginData.login, this.loginData.password).subscribe({
      next: () => {
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.errorMessage = 'Identifiants incorrects';
      }
    });
  }
}
