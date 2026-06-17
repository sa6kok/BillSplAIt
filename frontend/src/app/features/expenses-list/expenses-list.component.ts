import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ExpenseService } from '../../core/expense.service';
import { GroupService } from '../../core/group.service';

@Component({
  selector: 'app-expenses-list',
  templateUrl: './expenses-list.component.html',
  styleUrls: ['./expenses-list.component.css']
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
