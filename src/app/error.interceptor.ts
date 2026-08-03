import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { ToastService } from './shared/toast/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur est survenue';
      
      if (error.error instanceof ErrorEvent) {
        // Erreur côté client ou réseau
        errorMessage = `Erreur: ${error.error.message}`;
      } else {
        // Le backend a retourné un code d'erreur (404, 500, etc.)
        if (error.status === 401 || error.status === 403) {
           // On ignore ces erreurs pour le toast car l'AuthInterceptor ou les guards s'en chargent souvent,
           // ou on laisse passer de manière plus discrète.
           errorMessage = `Accès non autorisé ou session expirée.`;
        } else if (error.status === 404) {
          errorMessage = `Ressource introuvable (404).`;
        } else if (error.status === 0) {
          errorMessage = `Impossible de contacter le serveur (Erreur 0). Vérifiez que le backend tourne bien.`;
        } else {
          errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
        }
      }
      
      // Affichage d'un toaster au lieu d'une alerte native
      toastService.show(errorMessage, 'error');
      console.error(errorMessage);
      
      return throwError(() => new Error(errorMessage));
    })
  );
};
