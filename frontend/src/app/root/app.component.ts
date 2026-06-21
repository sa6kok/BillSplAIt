import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isAuthenticated = false;
  userEmail = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.syncAuthState();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.syncAuthState());
  }

  private syncAuthState() {
    const token = localStorage.getItem('auth_token');
    const email = localStorage.getItem('user_email');
    this.isAuthenticated = !!token;
    this.userEmail = email || '';
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    this.isAuthenticated = false;
    this.userEmail = '';
    this.router.navigate(['/login']);
  }
}
