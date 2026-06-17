import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService } from '../../core/group.service';

@Component({
  selector: 'app-groups-list',
  templateUrl: './groups-list.component.html',
  styleUrls: ['./groups-list.component.css']
})
export class GroupsListComponent implements OnInit {
  groups: any[] = [];
  loading = false;
  error?: string;
  memberEmail: { [groupId: string]: string } = {};
  memberLoading: { [groupId: string]: boolean } = {};
  memberError: { [groupId: string]: string | undefined } = {};

  constructor(private groupService: GroupService, private router: Router) {}

  ngOnInit() {
    this.loadGroups();
  }

  loadGroups() {
    this.loading = true;
    this.error = undefined;
    this.groupService.getGroups().subscribe({
      next: (res) => {
        this.groups = res.groups || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load groups';
        this.loading = false;
      }
    });
  }

  goToCreate() {
    this.router.navigate(['/groups/create']);
  }

  viewExpenses(id: string) {
    this.router.navigate([`/groups/${id}/expenses`]);
  }

  viewBalances(id: string) {
    this.router.navigate([`/groups/${id}/balances`]);
  }

  editGroup(id: string) {
    this.router.navigate([`/groups/${id}/edit`]);
  }

  deleteGroup(id: string) {
    if (confirm('Are you sure?')) {
      this.groupService.deleteGroup(id).subscribe({
        next: () => this.loadGroups(),
        error: (err) => alert(err?.error?.message || 'Delete failed')
      });
    }
  }

  addMember(groupId: string) {
    const email = this.memberEmail[groupId]?.trim();
    if (!email) {
      this.memberError[groupId] = 'Email is required';
      return;
    }

    this.memberLoading[groupId] = true;
    this.memberError[groupId] = undefined;

    this.groupService.addMember(groupId, email).subscribe({
      next: () => {
        this.memberEmail[groupId] = '';
        this.memberLoading[groupId] = false;
        this.loadGroups();
      },
      error: (err) => {
        this.memberError[groupId] = err?.error?.message || 'Failed to add member';
        this.memberLoading[groupId] = false;
      }
    });
  }
}
