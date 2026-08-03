import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur est survenue';
      
      if (error.error instanceof ErrorEvent) {
        // Erreur côté client ou réseau
        errorMessage = `Erreur: ${error.error.message}`;
      } else {
        // Le backend a retourné un code d'erreur (404, 500, etc.)
        if (error.status === 404) {
          errorMessage = `Ressource introuvable (404). Vérifiez l'URL de l'API. URL appelée: ${req.url}`;
        } else if (error.status === 0) {
          errorMessage = `Impossible de contacter le serveur (Erreur 0). Vérifiez que le backend tourne bien et que les CORS sont configurés. URL appelée: ${req.url}`;
        } else {
          errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
        }
      }
      
      // Affichage d'une alerte native (toaster très basique) pour être sûr que ça se voit
      alert(errorMessage);
      console.error(errorMessage);
      
      return throwError(() => new Error(errorMessage));
    })
  );
};
