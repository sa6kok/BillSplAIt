import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: { login: jest.Mock };
  let router: { navigate: jest.Mock };

  beforeEach(async () => {
    authService = {
      login: jest.fn().mockReturnValue(of({ token: 'token-123' }))
    };

    router = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('submits credentials and navigates to groups on success', () => {
    component.email = 'john@example.com';
    component.password = 'secret';

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'secret'
    });
    expect(router.navigate).toHaveBeenCalledWith(['/groups']);
  });
});
