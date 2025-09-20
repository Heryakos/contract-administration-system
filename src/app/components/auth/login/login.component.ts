import { Component, type OnInit } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { Router, ActivatedRoute } from "@angular/router"
import { MatSnackBar } from "@angular/material/snack-bar"

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup
  loading = false
  hidePassword = true
  returnUrl = "/dashboard"

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {
    this.loginForm = this.formBuilder.group({
      username: ["", [Validators.required]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    })
  }

  ngOnInit(): void {
    const target = this.route.snapshot.queryParams["returnUrl"] || "/dashboard"
    this.router.navigate([target])
  }

  onSubmit(): void {
    this.router.navigate([this.returnUrl])
  }

  get username() {
    return this.loginForm.get("username")
  }
  get password() {
    return this.loginForm.get("password")
  }
}
