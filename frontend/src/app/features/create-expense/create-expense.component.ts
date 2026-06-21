import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ExpenseService } from '../../core/expense.service';
import { GroupService } from '../../core/group.service';

@Component({
  selector: 'app-create-expense',
  templateUrl: './create-expense.component.html',
  styleUrls: ['./create-expense.component.css']
})
export class CreateExpenseComponent implements OnInit {
  groupId?: string;
  expenseId?: string;
  editMode = false;
  groupName = '';
  description = '';
  amount = 0;
  currency = 'EUR';
  members: any[] = [];
  shares: { [key: string]: number } = {};
  payers: { [key: string]: number } = {};
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
          this.payers[id] = this.payers[id] ?? 0;
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
        (expense.payers || []).forEach((p: any) => {
          const id = p.userId || p.id;
          if (id) {
            this.payers[id] = p.amount || 0;
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

  onAmountBlur() {
    if (!this.members.length) {
      return;
    }

    const totalAmount = Number(this.amount || 0);
    if (totalAmount <= 0) {
      this.members.forEach((member: any) => {
        const id = member.id || member.userId;
        this.shares[id] = 0;
      });
      return;
    }

    const memberIds = this.members.map((member: any) => member.id || member.userId).filter(Boolean);
    if (!memberIds.length) {
      return;
    }

    const totalCents = Math.round(totalAmount * 100);
    const baseShareCents = Math.floor(totalCents / memberIds.length);
    let remainder = totalCents - baseShareCents * memberIds.length;

    memberIds.forEach((id: string) => {
      const extraCent = remainder > 0 ? 1 : 0;
      this.shares[id] = (baseShareCents + extraCent) / 100;
      remainder -= extraCent;
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

    const payerArray = this.members.map((member: any) => {
      const id = member.id || member.userId;
      return { userId: id, amount: this.payers[id] || 0 };
    }).filter(p => (p.amount || 0) > 0);

    // Client-side validation: sums must match amount
    const totalShares = shareArray.reduce((s, sh) => s + Number(sh.amount || 0), 0);
    const totalPayers = payerArray.reduce((s, p) => s + Number(p.amount || 0), 0);
    const round = (n: number) => Math.round(n * 100) / 100;

    if (Math.abs(round(totalShares) - round(this.amount)) > 0.01) {
      this.error = `Sum of shares (${round(totalShares)}) must equal total amount (${round(this.amount)})`;
      this.loading = false;
      return;
    }

    if (payerArray.length === 0) {
      this.error = 'At least one payer must be specified';
      this.loading = false;
      return;
    }

    if (Math.abs(round(totalPayers) - round(this.amount)) > 0.01) {
      this.error = `Sum of payers (${round(totalPayers)}) must equal total amount (${round(this.amount)})`;
      this.loading = false;
      return;
    }

    const payload = {
      groupId: this.groupId,
      description: this.description,
      amount: this.amount,
      currency: this.currency,
      shares: shareArray,
      payers: payerArray
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
