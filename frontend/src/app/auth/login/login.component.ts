import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error?: string;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.error = undefined;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        const token = res?.token || res;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_email', this.email);
        this.router.navigate(['/groups']);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Login failed';
        this.loading = false;
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
