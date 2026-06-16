import { Component } from '@angular/core';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  template: '<p>Login component placeholder</p>'
})
export class LoginComponent {
  constructor(private auth: AuthService) {}
}
