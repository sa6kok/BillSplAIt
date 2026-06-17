import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isAuthenticated = false;
  userEmail = '';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    const token = localStorage.getItem('auth_token');
    const email = localStorage.getItem('user_email');
    this.isAuthenticated = !!token;
    this.userEmail = email || '';
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    this.router.navigate(['/login']);
  }
}
