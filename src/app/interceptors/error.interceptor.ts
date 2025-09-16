import { Injectable } from "@angular/core"
import { type HttpInterceptor, type HttpRequest, type HttpHandler, type HttpEvent, type HttpErrorResponse } from "@angular/common/http"
import { type Observable, throwError } from "rxjs"
import { catchError } from "rxjs/operators"
import { MatSnackBar } from "@angular/material/snack-bar"
import { AuthService } from "../services/auth.service"

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private snackBar: MatSnackBar,
    private authService: AuthService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = "An error occurred"

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message
        } else {
          // Server-side error
          switch (error.status) {
            case 401:
              this.authService.logout()
              errorMessage = "Unauthorized access. Please login again."
              break
            case 403:
              errorMessage = "Access forbidden. You do not have permission."
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
