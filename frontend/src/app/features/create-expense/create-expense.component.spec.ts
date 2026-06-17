import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { CreateExpenseComponent } from './create-expense.component';
import { ExpenseService } from '../../core/expense.service';
import { GroupService } from '../../core/group.service';

describe('CreateExpenseComponent', () => {
  let component: CreateExpenseComponent;
  let fixture: ComponentFixture<CreateExpenseComponent>;
  let expenseService: { createExpense: jest.Mock; updateExpense: jest.Mock; getExpenseById: jest.Mock };
  let groupService: { getGroupById: jest.Mock };
  let router: { navigate: jest.Mock };

  beforeEach(async () => {
    expenseService = {
      createExpense: jest.fn().mockReturnValue(of({ expense: { id: 'e1' } })),
      updateExpense: jest.fn().mockReturnValue(of({ expense: { id: 'e1' } })),
      getExpenseById: jest.fn().mockReturnValue(of({ expense: { id: 'e1' } }))
    };

    groupService = {
      getGroupById: jest.fn().mockReturnValue(
        of({ group: { id: 'g1', name: 'Trip', members: [{ userId: 'u1', User: { name: 'John' } }] } })
      )
    };

    router = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [CreateExpenseComponent],
      providers: [
        { provide: ExpenseService, useValue: expenseService },
        { provide: GroupService, useValue: groupService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { params: of({ groupId: 'g1' }) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('creates an expense when shares and payers match the amount', () => {
    component.description = 'Dinner';
    component.amount = 50;
    component.currency = 'USD';
    component.members = [{ userId: 'u1' }];
    component.shares = { u1: 50 };
    component.payers = { u1: 50 };

    component.onSubmit();

    expect(expenseService.createExpense).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/groups/g1/expenses']);
  });
});
