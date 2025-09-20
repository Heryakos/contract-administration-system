import { Component, type OnInit } from "@angular/core"
import { Router } from "@angular/router"

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
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'Contracts',
      icon: 'description',
      route: '/contracts'
    },
    {
      label: 'Contract Generator',
      icon: 'add_box',
      route: '/contract-generator'
    },
    {
      label: 'Clause Generator',
      icon: 'library_add',
      route: '/clause-generator'
    },
    {
      label: 'Template Generator',
      icon: 'create_new_folder',
      route: '/template-generator'
    },
    {
      label: 'Approvals',
      icon: 'approval',
      route: '/approvals'
    },
    {
      label: 'Financial',
      icon: 'attach_money',
      route: '/financial'
    },
    {
      label: 'Obligations',
      icon: 'assignment',
      route: '/obligations'
    },
    {
      label: 'Risks',
      icon: 'warning',
      route: '/risks'
    },
    {
      label: 'Reports',
      icon: 'assessment',
      route: '/reports'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  hasAccess(item: MenuItem): boolean {
    return true
  }

  navigate(route: string): void {
    this.router.navigate([route])
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route)
  }
}
