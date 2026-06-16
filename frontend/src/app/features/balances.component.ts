import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BalanceService } from '../core/balance.service';
import { GroupService } from '../core/group.service';

@Component({
  selector: 'app-balances',
  template: `
    <div class="balances-container">
      <div class="page-header">
        <h2>📊 Balances for {{ groupName }}</h2>
        <button (click)="goBack()" class="btn-secondary">← Back to Groups</button>
      </div>
      <div *ngIf="loading" class="loading">⏳ Loading balances...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      <div class="balances-list">
        <div *ngFor="let balance of balances" class="balance-card">
          <h3>{{ getUserName(balance.userId) }}</h3>
          <p>💰 Total Share: <strong>{{ balance.total }}</strong></p>
          <p>✅ Amount Paid: <strong>{{ balance.paid }}</strong></p>
          <p [style.color]="balance.due > 0 ? '#f5576c' : '#667eea'">
            <strong>{{ balance.due > 0 ? '💸 Owes' : '💳 Owed' }}: {{ Math.abs(balance.due) }}</strong>
          </p>
        </div>
      </div>
      <div *ngIf="balances.length === 0 && !loading" style="text-align: center; padding: 3rem; color: #999;">
        <p style="font-size: 1.1rem;">No expenses yet. Create one to see balances.</p>
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

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .page-header button {
        width: 100%;
      }
    }
  `]
})
export class BalancesComponent implements OnInit {
  groupId?: string;
  groupName = '';
  balances: any[] = [];
  loading = false;
  error?: string;
  members: any[] = [];
  Math = Math;

  constructor(
    private balanceService: BalanceService,
    private groupService: GroupService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.groupId = params['groupId'];
      if (this.groupId) {
        this.loadGroupAndBalances();
      }
    });
  }

  loadGroupAndBalances() {
    if (!this.groupId) return;

    this.groupService.getGroupById(this.groupId).subscribe({
      next: (res) => {
        this.groupName = res.group?.name || '';
        this.members = res.group?.members || [];
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load group';
      }
    });

    this.loading = true;
    this.balanceService.getGroupBalances(this.groupId).subscribe({
      next: (res) => {
        this.balances = res.balances || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load balances';
        this.loading = false;
      }
    });
  }

  getUserName(userId: string): string {
    const member = this.members.find((m: any) => m.userId === userId);
    return member?.User?.name || userId;
  }

  goBack() {
    this.router.navigate(['/groups']);
  }
}
