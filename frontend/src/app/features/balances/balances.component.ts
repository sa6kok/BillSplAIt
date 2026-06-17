import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BalanceService } from '../../core/balance.service';
import { GroupService } from '../../core/group.service';

@Component({
  selector: 'app-balances',
  templateUrl: './balances.component.html',
  styleUrls: ['./balances.component.css']
})
export class BalancesComponent implements OnInit {
  groupId?: string;
  groupName = '';
  balances: any[] = [];
  debts: any[] = [];
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
        this.debts = res.debts || [];
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
