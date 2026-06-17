import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ExpenseService } from '../core/expense.service';
import { GroupService } from '../core/group.service';

@Component({
  selector: 'app-expenses-list',
  template: `
    <div class="expenses-container">
      <div class="page-header">
        <h2>💸 Expenses for {{ groupName }}</h2>
        <div>
          <button (click)="goToCreate()" class="btn-primary">+ Add Expense</button>
          <button (click)="goBack()" class="btn-secondary">← Back</button>
        </div>
      </div>
      <div *ngIf="loading" class="loading">⏳ Loading expenses...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      <div class="expenses-list">
        <div *ngFor="let expense of expenses" class="expense-card">
          <h3>{{ expense.description }}</h3>
          <p><strong>💰 {{ expense.amount }} {{ expense.currency }}</strong></p>
          <p><small>👥 Shares: {{ expense.shares?.length || 0 }} people</small></p>
          <p *ngIf="expense.payers?.length"><small>💳 Paid by: <span *ngFor="let p of expense.payers; let i = index">{{ memberName(p.userId) }} ({{ p.amount }})<span *ngIf="i < expense.payers.length - 1">, </span></span></small></p>
          <div class="group-actions">
            <button (click)="editExpense(expense.id)" class="btn-secondary">✏️ Edit</button>
            <button (click)="deleteExpense(expense.id)" class="btn-danger">🗑️ Delete</button>
          </div>
        </div>
      </div>
      <div *ngIf="expenses.length === 0 && !loading" style="text-align: center; padding: 3rem; color: #999;">
        <p style="font-size: 1.1rem;">No expenses yet.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-header div {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .page-header div {
        width: 100%;
      }

      .page-header div button {
        flex: 1;
      }
    }
  `]
})
export class ExpensesListComponent implements OnInit {
  groupId?: string;
  groupName = '';
  members: any[] = [];
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
        this.members = res.group?.members || [];
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

  memberName(userId: string) {
    const m = this.members.find((x: any) => x.id === userId || x.userId === userId);
    return m?.name || m?.User?.name || userId;
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
