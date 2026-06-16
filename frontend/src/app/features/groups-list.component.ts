import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService } from '../core/group.service';

@Component({
  selector: 'app-groups-list',
  template: `
    <div class="groups-container">
      <h2>My Groups</h2>
      <button (click)="goToCreate()">Create New Group</button>
      <div *ngIf="loading">Loading groups...</div>
      <div *ngIf="error" style="color:red">{{ error }}</div>
      <div class="groups-list">
        <div *ngFor="let group of groups" class="group-card">
          <h3>{{ group.name }}</h3>
          <p>{{ group.description }}</p>
          <p><small>Members: {{ group.members?.length || 0 }}</small></p>
          <div class="member-add">
            <input
              type="email"
              placeholder="Invite by email"
              [(ngModel)]="memberEmail[group.id]"
            />
            <button (click)="addMember(group.id)" [disabled]="memberLoading[group.id]">
              {{ memberLoading[group.id] ? 'Adding...' : 'Add Member' }}
            </button>
            <div *ngIf="memberError[group.id]" class="error">{{ memberError[group.id] }}</div>
          </div>
          <div class="group-actions">
            <button (click)="viewExpenses(group.id)">Expenses</button>
            <button (click)="viewBalances(group.id)">Balances</button>
            <button (click)="editGroup(group.id)">Edit</button>
            <button (click)="deleteGroup(group.id)" style="background:red;color:white">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .groups-container { padding: 20px; }
    .groups-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px; margin-top: 20px; }
    .group-card { border: 1px solid #ccc; padding: 15px; border-radius: 4px; }
    .group-actions { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
    .member-add { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 10px; }
    .member-add input { flex: 1 1 180px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
    .member-add button { padding: 8px 12px; cursor: pointer; }
    .member-add .error { width: 100%; color: red; font-size: 0.9em; margin-top: 4px; }
    button { padding: 8px 12px; cursor: pointer; }
  `]
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
