import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService } from '../core/group.service';

@Component({
  selector: 'app-groups-list',
  template: `
    <div class="groups-container">
      <div class="page-header">
        <h2>My Groups</h2>
        <button (click)="goToCreate()" class="btn-primary">+ Create New Group</button>
      </div>
      <div *ngIf="loading" class="loading">⏳ Loading groups...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      <div class="groups-list">
        <div *ngFor="let group of groups" class="group-card">
          <h3>{{ group.name }}</h3>
          <p>{{ group.description }}</p>
          <p><small>👥 Members: {{ group.members?.length || 0 }}</small></p>
          <div class="member-add">
            <input
              type="email"
              placeholder="Invite by email"
              [(ngModel)]="memberEmail[group.id]"
            />
            <button (click)="addMember(group.id)" [disabled]="memberLoading[group.id]" class="btn-secondary">
              {{ memberLoading[group.id] ? 'Adding...' : 'Add' }}
            </button>
            <div *ngIf="memberError[group.id]" class="error" style="flex-basis: 100%; margin: 0;">{{ memberError[group.id] }}</div>
          </div>
          <div class="group-actions">
            <button (click)="viewExpenses(group.id)" class="btn-secondary">💸 Expenses</button>
            <button (click)="viewBalances(group.id)" class="btn-secondary">📊 Balances</button>
            <button (click)="editGroup(group.id)" class="btn-secondary">✏️ Edit</button>
            <button (click)="deleteGroup(group.id)" class="btn-danger">🗑️ Delete</button>
          </div>
        </div>
      </div>
      <div *ngIf="groups.length === 0 && !loading" style="text-align: center; padding: 3rem; color: #999;">
        <p style="font-size: 1.1rem;">No groups yet. Create one to get started!</p>
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

    .page-header button {
      white-space: nowrap;
    }

    .member-add {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #f0f3f7;
    }

    .member-add input {
      flex: 1 1 180px;
      padding: 0.6rem;
      border: 2px solid #e0e6ed;
      border-radius: 8px;
      font-family: inherit;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .member-add input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .member-add button {
      padding: 0.6rem 1rem;
      font-size: 0.85rem;
    }

    .member-add .error {
      width: 100%;
      margin: 0;
      padding: 0.5rem;
    }
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
