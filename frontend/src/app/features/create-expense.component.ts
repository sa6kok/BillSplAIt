import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ExpenseService } from '../core/expense.service';
import { GroupService } from '../core/group.service';

@Component({
  selector: 'app-create-expense',
  template: `
    <div class="create-expense-container">
      <h2>{{ editMode ? 'Edit Expense' : 'Add Expense to ' + groupName }}</h2>
      <form (ngSubmit)="onSubmit()">
        <div>
          <label for="description">Description</label>
          <input id="description" name="description" [(ngModel)]="description" required />
        </div>
        <div>
          <label for="amount">Amount</label>
          <input id="amount" name="amount" [(ngModel)]="amount" type="number" step="0.01" required />
        </div>
        <div>
          <label for="currency">Currency</label>
          <select id="currency" name="currency" [(ngModel)]="currency">
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
          </select>
        </div>
        <div>
          <h3>Split Among</h3>
          <div *ngFor="let member of members" class="member-share">
            <label>{{ member.name || member.User?.name || member.id || member.userId }}</label>
            <input id="share-{{member.id || member.userId}}" name="share-{{member.id || member.userId}}" [(ngModel)]="shares[member.id || member.userId]" type="number" step="0.01" />
          </div>
        </div>
        <div>
          <button type="submit" [disabled]="loading">{{ editMode ? 'Save' : 'Create' }}</button>
          <button type="button" (click)="goBack()">Cancel</button>
        </div>
      </form>
      <p *ngIf="error" style="color:red">{{ error }}</p>
    </div>
  `,
  styles: [`
    .create-expense-container { padding: 20px; max-width: 500px; }
    form div { margin: 15px 0; }
    label { display: block; margin-bottom: 5px; font-weight: bold; }
    input, select { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
    .member-share { margin: 10px 0; }
    button { padding: 8px 12px; margin-right: 10px; cursor: pointer; }
  `]
})
export class CreateExpenseComponent implements OnInit {
  groupId?: string;
  expenseId?: string;
  editMode = false;
  groupName = '';
  description = '';
  amount = 0;
  currency = 'USD';
  members: any[] = [];
  shares: { [key: string]: number } = {};
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
      this.expenseId = params['expenseId'];
      this.editMode = !!this.expenseId;
      if (this.groupId) {
        this.loadGroup();
      }
    });
  }

  loadGroup() {
    if (!this.groupId) return;

    this.loading = true;
    this.groupService.getGroupById(this.groupId).subscribe({
      next: (res) => {
        this.groupName = res.group?.name || '';
        this.members = res.group?.members || [];
        this.members.forEach((member: any) => {
          const id = member.id || member.userId;
          this.shares[id] = this.shares[id] ?? 0;
        });
        if (this.editMode && this.expenseId) {
          this.loadExpense();
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = this.extractErrorMessage(err, 'Failed to load group');
        this.loading = false;
      }
    });
  }

  loadExpense() {
    if (!this.expenseId) return;

    this.expenseService.getExpenseById(this.expenseId).subscribe({
      next: (res) => {
        const expense = res.expense || res;
        this.description = expense.description || '';
        this.amount = expense.amount || 0;
        this.currency = expense.currency || 'USD';

        (expense.shares || []).forEach((share: any) => {
          const id = share.userId || share.id;
          if (id) {
            this.shares[id] = share.amount || 0;
          }
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = this.extractErrorMessage(err, 'Failed to load expense');
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (!this.groupId) return;

    const shareArray = this.members.map((member: any) => {
      const id = member.id || member.userId;
      return {
        userId: id,
        amount: this.shares[id] || 0
      };
    });

    this.loading = true;
    this.error = undefined;

    const payload = {
      groupId: this.groupId,
      description: this.description,
      amount: this.amount,
      currency: this.currency,
      shares: shareArray
    };

    const action = this.editMode && this.expenseId
      ? this.expenseService.updateExpense(this.expenseId, payload)
      : this.expenseService.createExpense(payload);

    action.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate([`/groups/${this.groupId}/expenses`]);
      },
      error: (err) => {
        this.error = this.extractErrorMessage(err, this.editMode ? 'Failed to update expense' : 'Failed to create expense');
        this.loading = false;
      }
    });
  }

  extractErrorMessage(error: any, fallback: string): string {
    if (!error) {
      return fallback;
    }

    if (error.error?.message) {
      return error.error.message;
    }

    if (error.message) {
      return error.message;
    }

    if (error.status && error.statusText) {
      return `${error.status} ${error.statusText}`;
    }

    return fallback;
  }

  goBack() {
    this.router.navigate([`/groups/${this.groupId}/expenses`]);
  }
}
