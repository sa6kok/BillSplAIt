import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-register',
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>💰 BillSplAIt</h1>
        <h2>Register</h2>
        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div>
            <label for="name">Full Name</label>
            <input id="name" name="name" [(ngModel)]="name" required />
          </div>
          <div>
            <label for="email">Email</label>
            <input id="email" name="email" type="email" [(ngModel)]="email" required />
          </div>
          <div>
            <label for="password">Password</label>
            <input id="password" name="password" type="password" [(ngModel)]="password" required />
          </div>
          <div>
            <button type="submit" class="btn-primary" [disabled]="loading">
              {{ loading ? 'Registering...' : 'Register' }}
            </button>
          </div>
        </form>
        <p *ngIf="error" class="error">{{ error }}</p>
        <p class="auth-link">
          Already have an account? <a (click)="goToLogin()">Login here</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .auth-card {
      background: white;
      padding: 2.5rem;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 400px;
    }

    h1 {
      text-align: center;
      color: #667eea;
      margin-bottom: 0.5rem;
      font-size: 2.5rem;
    }

    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 2rem;
      font-size: 1.5rem;
    }

    .auth-link {
      text-align: center;
      margin-top: 1.5rem;
      color: #666;
    }

    .auth-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      cursor: pointer;
    }

    .auth-link a:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .auth-card {
        margin: 1rem;
      }
    }
  `]
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

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
}
