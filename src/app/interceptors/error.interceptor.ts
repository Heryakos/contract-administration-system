import { Injectable } from "@angular/core"
import { type HttpInterceptor, type HttpRequest, type HttpHandler, type HttpEvent, type HttpErrorResponse } from "@angular/common/http"
import { type Observable, throwError } from "rxjs"
import { catchError } from "rxjs/operators"
import { MatSnackBar } from "@angular/material/snack-bar"

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = "An error occurred"

        if (error.error instanceof ErrorEvent) {
          errorMessage = error.error.message
        } else {
          switch (error.status) {
            case 401:
              errorMessage = "Unauthorized access."
              break
            case 403:
              errorMessage = "Access forbidden."
              break
            case 404:
              errorMessage = "Resource not found."
              break
            case 500:
              errorMessage = "Internal server error. Please try again later."
              break
            default:
              errorMessage = error.error?.message || `Error: ${error.status}`
          }
        }

        this.snackBar.open(errorMessage, "Close", {
          duration: 5000,
          panelClass: ["error-snackbar"],
        })

        return throwError(() => error)
      }),
    )
  }
}
