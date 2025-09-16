import { Injectable } from "@angular/core"
import { type CanActivate, Router, type ActivatedRouteSnapshot, type RouterStateSnapshot } from "@angular/router"
import { AuthService } from "../services/auth.service"

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      // Check for required roles if specified in route data
      const requiredRoles = route.data["roles"] as string[]
      if (requiredRoles && !this.authService.hasAnyRole(requiredRoles)) {
        this.router.navigate(["/dashboard"])
        return false
      }
      return true
    }

    this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } })
    return false
  }
}
