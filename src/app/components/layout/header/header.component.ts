import { Component, Input, type OnInit } from "@angular/core"
import { MatSidenav } from "@angular/material/sidenav"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"
import { ConService } from "../../../services/con.service"

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  @Input() drawer!: MatSidenav

  currentEmployee$: Observable<any | null>

  constructor(private con: ConService) {
    this.currentEmployee$ = this.con.currentEmployee$.pipe(
      map(employeeData => {
        if (employeeData && employeeData.c_Employees && employeeData.c_Employees.length > 0) {
          return employeeData.c_Employees[0];
        }
        return null;
      })
    );
  }

  ngOnInit(): void {}

  logout(): void {
    // No-op; identity comes from environment. Could navigate to login if needed.
  }
}