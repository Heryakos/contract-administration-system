import { Component, type OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { AuthService } from "../../../services/auth.service"

interface MenuItem {
  label: string
  icon: string
  route: string
  roles?: string[]
  children?: MenuItem[]
}

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [
    { label: "Dashboard", icon: "dashboard", route: "/dashboard" },
    { label: "Contracts", icon: "description", route: "/contracts" },
    // { label: "Contract Generator", icon: "build", route: "/contracts/generator" },
    { label: "Approvals", icon: "approval", route: "/approvals", roles: ["Admin", "Legal", "Finance"] },
    { label: "Obligations", icon: "assignment", route: "/obligations" },
    { label: "Financial", icon: "account_balance", route: "/financial", roles: ["Admin", "Finance"] },
    { label: "Risk & Compliance", icon: "security", route: "/risks", roles: ["Admin", "Legal"] },
    { label: "Reports", icon: "analytics", route: "/reports" },
  ]

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {}

  hasAccess(item: MenuItem): boolean {
    if (!item.roles || item.roles.length === 0) return true
    return this.authService.hasAnyRole(item.roles)
  }

  navigate(route: string): void {
    this.router.navigate([route])
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route)
  }
}
