import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../core/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: { register: jest.Mock };
  let router: { navigate: jest.Mock };

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockReturnValue(of({ ok: true }))
    };

    router = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('submits registration and navigates to login on success', () => {
    component.name = 'John';
    component.email = 'john@example.com';
    component.password = 'secret';

    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith({
      name: 'John',
      email: 'john@example.com',
      password: 'secret'
    });
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
