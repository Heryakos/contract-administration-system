import { Injectable } from "@angular/core"
import { type CanActivate, Router, type ActivatedRouteSnapshot, type RouterStateSnapshot } from "@angular/router"
import { environment } from "../../environments/environment"

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const username = environment.username
    if (username && String(username).trim().length > 0) {
      return true
    }
    this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } })
    return false
  }
}
