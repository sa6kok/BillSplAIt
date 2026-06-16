import { Component } from '@angular/core';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-register',
  template: '<p>Register component placeholder</p>'
})
export class RegisterComponent {
  constructor(private auth: AuthService) {}
}
