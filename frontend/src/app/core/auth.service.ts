import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private api: ApiService) {}

  register(payload: RegisterRequest): Observable<any> {
    return this.api.post('/auth/register', payload);
  }

  login(payload: LoginRequest): Observable<any> {
    return this.api.post('/auth/login', payload);
  }
}
