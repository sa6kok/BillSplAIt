import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ExpenseService } from '../core/expense.service';
import { GroupService } from '../core/group.service';

@Component({
  selector: 'app-expenses-list',
  template: `
    <div class="expenses-container">
      <h2>Expenses for {{ groupName }}</h2>
      <button (click)="goBack()">Back to Groups</button>
      <button (click)="goToCreate()">Add Expense</button>
      <div *ngIf="loading">Loading expenses...</div>
      <div *ngIf="error" style="color:red">{{ error }}</div>
      <div class="expenses-list">
        <div *ngFor="let expense of expenses" class="expense-card">
          <h3>{{ expense.description }}</h3>
          <p>Amount: $<span>{{ expense.amount }}</span> {{ expense.currency }}</p>
          <p><small>Shares: {{ expense.shares?.length || 0 }} people</small></p>
          <button (click)="editExpense(expense.id)">Edit</button>
          <button (click)="deleteExpense(expense.id)" style="background:red;color:white">Delete</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .expenses-container { padding: 20px; }
    .expenses-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px; margin-top: 20px; }
    .expense-card { border: 1px solid #ccc; padding: 15px; border-radius: 4px; }
    button { margin: 5px; padding: 8px 12px; cursor: pointer; }
  `]
})
export class ExpensesListComponent implements OnInit {
  groupId?: string;
  groupName = '';
  expenses: any[] = [];
  loading = false;
  error?: string;

  constructor(
    private expenseService: ExpenseService,
    private groupService: GroupService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.groupId = params['groupId'];
      if (this.groupId) {
        this.loadGroupAndExpenses();
      }
    });
  }

  loadGroupAndExpenses() {
    if (!this.groupId) return;

    // Load group name
    this.groupService.getGroupById(this.groupId).subscribe({
      next: (res) => {
        this.groupName = res.group?.name || '';
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load group';
      }
    });

    // Load expenses
    this.loading = true;
    this.expenseService.getGroupExpenses(this.groupId).subscribe({
      next: (res) => {
        this.expenses = res.expenses || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load expenses';
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/groups']);
  }

  goToCreate() {
    this.router.navigate([`/groups/${this.groupId}/expenses/create`]);
  }

  editExpense(id: string) {
    this.router.navigate([`/groups/${this.groupId}/expenses/${id}/edit`]);
  }

  deleteExpense(id: string) {
    if (confirm('Are you sure?')) {
      this.expenseService.deleteExpense(id).subscribe({
        next: () => this.loadGroupAndExpenses(),
        error: (err) => alert(err?.error?.message || 'Delete failed')
      });
    }
  }
}
