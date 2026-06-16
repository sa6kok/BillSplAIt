import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <h2>Login</h2>
    <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
      <div>
        <label for="email">Email</label>
        <input id="email" name="email" [(ngModel)]="email" required />
      </div>
      <div>
        <label for="password">Password</label>
        <input id="password" name="password" type="password" [(ngModel)]="password" required />
      </div>
      <div>
        <button type="submit" [disabled]="loading">Login</button>
      </div>
    </form>
    <p *ngIf="error" style="color:red">{{ error }}</p>
  `
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
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Login failed';
        this.loading = false;
      }
    });
  }
}
