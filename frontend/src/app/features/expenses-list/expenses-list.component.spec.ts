import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { ExpensesListComponent } from './expenses-list.component';
import { ExpenseService } from '../../core/expense.service';
import { GroupService } from '../../core/group.service';

describe('ExpensesListComponent', () => {
  let component: ExpensesListComponent;
  let fixture: ComponentFixture<ExpensesListComponent>;
  let expenseService: { getGroupExpenses: jest.Mock };
  let groupService: { getGroupById: jest.Mock };

  beforeEach(async () => {
    expenseService = {
      getGroupExpenses: jest.fn().mockReturnValue(
        of({ expenses: [{ id: 'e1', description: 'Dinner', amount: 30, currency: 'USD', shares: [], payers: [] }] })
      )
    };

    groupService = {
      getGroupById: jest.fn().mockReturnValue(
        of({ group: { id: 'g1', name: 'Trip', members: [] } })
      )
    };

    await TestBed.configureTestingModule({
      declarations: [ExpensesListComponent],
      providers: [
        { provide: ExpenseService, useValue: expenseService },
        { provide: GroupService, useValue: groupService },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: ActivatedRoute, useValue: { params: of({ groupId: 'g1' }) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpensesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('loads group and expenses from services', () => {
    expect(groupService.getGroupById).toHaveBeenCalledWith('g1');
    expect(expenseService.getGroupExpenses).toHaveBeenCalledWith('g1');
    expect(component.expenses).toHaveLength(1);
    expect(component.expenses[0].description).toBe('Dinner');
  });
});
