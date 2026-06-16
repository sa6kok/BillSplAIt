import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BalanceService } from '../core/balance.service';
import { GroupService } from '../core/group.service';

@Component({
  selector: 'app-balances',
  template: `
    <div class="balances-container">
      <h2>Balances for {{ groupName }}</h2>
      <button (click)="goBack()">Back to Group</button>
      <div *ngIf="loading">Loading balances...</div>
      <div *ngIf="error" style="color:red">{{ error }}</div>
      <div class="balances-list">
        <div *ngFor="let balance of balances" class="balance-card">
          <h3>{{ getUserName(balance.userId) }}</h3>
          <p>Total Share: $<span>{{ balance.total }}</span></p>
          <p>Amount Paid: $<span>{{ balance.paid }}</span></p>
          <p [style.color]="balance.due > 0 ? 'red' : 'green'">
            <strong>{{ balance.due > 0 ? 'Owes' : 'Owed' }}: $<span>{{ Math.abs(balance.due) }}</span></strong>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .balances-container { padding: 20px; }
    .balances-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px; margin-top: 20px; }
    .balance-card { border: 1px solid #ccc; padding: 15px; border-radius: 4px; }
    button { margin: 5px; padding: 8px 12px; cursor: pointer; }
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

    // Load group
    this.groupService.getGroupById(this.groupId).subscribe({
      next: (res) => {
        this.groupName = res.group?.name || '';
        this.members = res.group?.members || [];
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load group';
      }
    });

    // Load balances
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
