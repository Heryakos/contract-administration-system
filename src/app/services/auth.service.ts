import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, type Observable, tap } from "rxjs"
import { Router } from "@angular/router"
import { environment } from "../../environments/environment"
import type { User, LoginRequest, LoginResponse, RegisterRequest } from "../models/user.model"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`
  private currentUserSubject = new BehaviorSubject<User | null>(null)
  private tokenSubject = new BehaviorSubject<string | null>(null)

  public currentUser$ = this.currentUserSubject.asObservable()
  public token$ = this.tokenSubject.asObservable()

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    // Initialize from localStorage
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    if (token && user) {
      this.tokenSubject.next(token)
      this.currentUserSubject.next(JSON.parse(user))
    } else if (!environment.production) {
      // Seed a mock session in development to support mock API usage
      const mockUser: User = {
        userID: "U-DEV-1",
        username: "dev.user",
        email: "dev.user@example.com",
        firstName: "Dev",
        lastName: "User",
        fullName: "Dev User",
        isActive: true,
        createdDate: new Date(),
        lastLoginDate: new Date(),
        department: "Engineering",
        jobTitle: "Developer",
        roles: [
          { roleID: "R-ADMIN", roleName: "Admin", isActive: true },
        ],
      }
      const mockToken = "mock-token"
      localStorage.setItem("token", mockToken)
      localStorage.setItem("user", JSON.stringify(mockUser))
      this.tokenSubject.next(mockToken)
      this.currentUserSubject.next(mockUser)
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem("token", response.token)
        localStorage.setItem("user", JSON.stringify(response.user))
        this.tokenSubject.next(response.token)
        this.currentUserSubject.next(response.user)
      }),
    )
  }

  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/register`, userData)
  }

  logout(): void {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    this.tokenSubject.next(null)
    this.currentUserSubject.next(null)
    this.router.navigate(["/login"])
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`)
  }

  getCurrentUserSnapshot(): User | null {
    return this.currentUserSubject.value
  }

  validateToken(): Observable<any> {
    return this.http.get(`${this.API_URL}/validate`)
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value
  }

  getToken(): string | null {
    return this.tokenSubject.value
  }

  hasRole(roleName: string): boolean {
    const user = this.currentUserSubject.value
    return user?.roles?.some((role) => role.roleName === roleName) || false
  }

  hasAnyRole(roleNames: string[]): boolean {
    return roleNames.some((role) => this.hasRole(role))
  }
}
