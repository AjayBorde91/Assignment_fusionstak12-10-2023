import { Router } from '@angular/router';
import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import ValidateForm from '../../helpers/validationform';
import { NgToastService } from 'ng-angular-popup';
import { UserStoreService } from 'src/app/services/user-store.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})

export class LoginComponent implements OnInit {
  public loginForm!: FormGroup;
  type: string = 'password';
  isText: boolean = false;
  eyeIcon: string = 'fa-eye-slash';
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: NgToastService,
    private userStore: UserStoreService
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      Username: ['', Validators.required],
      Password: ['', Validators.required],
    });
  }

  hideShowPass() {
    this.isText = !this.isText;
    this.isText ? (this.eyeIcon = 'fa-eye') : (this.eyeIcon = 'fa-eye-slash');
    this.isText ? (this.type = 'text') : (this.type = 'password');
  }

  onLogin() {
    if (this.loginForm.valid) {
      console.log(this.loginForm.value);
      this.auth.signIn(this.loginForm.value).subscribe({
        next: (res) => {
          this.loginForm.reset();
          this.auth.storeToken(res.token);
          this.auth.storeRefreshToken(res.refreshToken);
          const tokenPayload = this.auth.decodedToken();
          this.userStore.setFullNameForStore(tokenPayload.name);
          this.userStore.setRoleForStore(tokenPayload.role);
          this.userStore.setEmailForStore(tokenPayload.email);


          this.router.navigate(['dashboard'])
        },
        error: (err) => {
          this.toast.error({ detail: "ERROR", summary: "Something when wrong!", duration: 5000 });
          console.log(err);
        },
      });
    }

    else {
      ValidateForm.validateAllFormFields(this.loginForm);
    }
  }
}
