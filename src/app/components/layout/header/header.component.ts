import { Component, Input, type OnInit } from "@angular/core"
import { MatSidenav } from "@angular/material/sidenav"
import { Observable } from "rxjs"
import { AuthService } from "../../../services/auth.service"
import { type User } from "../../../models/user.model"

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  @Input() drawer!: MatSidenav

  currentUser$: Observable<User | null>

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$
  }

  ngOnInit(): void {}

  logout(): void {
    this.authService.logout()
  }
}
