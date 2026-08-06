import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { ToastService } from './shared/toast/toast.service';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';


export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur est survenue';
      
      if (error.error instanceof ErrorEvent) {
        // Erreur côté client ou réseau
        errorMessage = `Erreur: ${error.error.message}`;
      } else {
        // Le backend a retourné un code d'erreur (404, 500, etc.)
        if (error.status === 401 || error.status === 403) {
           // Si on a un 401 ou 403, le token a expiré ou est invalide.
           authService.logout();
           router.navigate(['/login']);
           return throwError(() => new Error('Accès non autorisé ou session expirée.'));
        } else if (error.status === 404) {
          errorMessage = `Ressource introuvable (404).`;
        } else if (error.status === 0) {
          errorMessage = `Impossible de contacter le serveur (Erreur 0). Vérifiez que le backend tourne bien.`;
        } else {
          errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
        }
      }
      
      // Affichage d'un toaster au lieu d'une alerte native (seulement si ce n'est pas un 401/403)
      toastService.show(errorMessage, 'error');
      console.error(errorMessage);
      
      return throwError(() => new Error(errorMessage));
    })
  );
};
