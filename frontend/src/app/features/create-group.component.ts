import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GroupService } from '../core/group.service';

@Component({
  selector: 'app-create-group',
  template: `
    <div class="create-group-container">
      <h2>{{ editMode ? '✏️ Edit Group' : '✨ Create New Group' }}</h2>
      <form (ngSubmit)="onSubmit()" #createForm="ngForm">
        <div>
          <label for="name">Group Name</label>
          <input id="name" name="name" type="text" [(ngModel)]="name" placeholder="e.g., Vacation, Roommates" required />
        </div>
        <div>
          <label for="description">Description</label>
          <textarea id="description" name="description" [(ngModel)]="description" placeholder="What is this group for?"></textarea>
        </div>
        <div style="display: flex; gap: 1rem;">
          <button type="submit" class="btn-primary" [disabled]="loading">
            {{ loading ? 'Saving...' : (editMode ? 'Save Changes' : 'Create Group') }}
          </button>
          <button type="button" (click)="goBack()" class="btn-secondary">Cancel</button>
        </div>
      </form>
      <p *ngIf="error" class="error">{{ error }}</p>
    </div>
  `,
  styles: [`
    .create-group-container {
      max-width: 600px;
      margin: 0 auto;
    }

    button {
      flex: 1;
    }

    @media (max-width: 600px) {
      button {
        flex: 1 1 auto;
      }
    }
  `]
})
export class CreateGroupComponent implements OnInit {
  groupId?: string;
  editMode = false;
  name = '';
  description = '';
  loading = false;
  error?: string;

  constructor(
    private groupService: GroupService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.groupId = params['id'];
      this.editMode = !!this.groupId;
      if (this.editMode && this.groupId) {
        this.loadGroup();
      }
    });
  }

  loadGroup() {
    if (!this.groupId) return;

    this.loading = true;
    this.groupService.getGroupById(this.groupId).subscribe({
      next: (res) => {
        this.name = res.group?.name || '';
        this.description = res.group?.description || '';
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load group';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    this.loading = true;
    this.error = undefined;

    const action = this.editMode && this.groupId
      ? this.groupService.updateGroup(this.groupId, { name: this.name, description: this.description })
      : this.groupService.createGroup({ name: this.name, description: this.description });

    action.subscribe({
      next: () => {
        this.router.navigate(['/groups']);
      },
      error: (err) => {
        this.error = err?.error?.message || (this.editMode ? 'Failed to update group' : 'Failed to create group');
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/groups']);
  }
}
