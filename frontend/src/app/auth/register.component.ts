import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-register',
  template: `
    <h2>Register</h2>
    <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
      <div>
        <label for="name">Name</label>
        <input id="name" name="name" [(ngModel)]="name" required />
      </div>
      <div>
        <label for="email">Email</label>
        <input id="email" name="email" [(ngModel)]="email" required />
      </div>
      <div>
        <label for="password">Password</label>
        <input id="password" name="password" type="password" [(ngModel)]="password" required />
      </div>
      <div>
        <button type="submit" [disabled]="loading">Register</button>
      </div>
    </form>
    <p *ngIf="error" style="color:red">{{ error }}</p>
  `
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  loading = false;
  error?: string;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.error = undefined;
    this.auth.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Registration failed';
        this.loading = false;
      }
    });
  }
}
