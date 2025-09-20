import { Injectable } from "@angular/core"
import { type HttpInterceptor, type HttpRequest, type HttpHandler, type HttpEvent } from "@angular/common/http"
import { type Observable } from "rxjs"

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req)
  }
}
