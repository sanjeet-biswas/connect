import { Observable, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export const handleError = (error: HttpErrorResponse): Observable<never> => {
  let errorMessage = 'An error occurred';
  if (error.error instanceof ErrorEvent) {
    errorMessage = error.error.message;
  } else {
    errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
  }
  return throwError(() => new Error(errorMessage));
}; 