import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GroupService } from '../core/group.service';

@Component({
  selector: 'app-create-group',
  template: `
    <div class="create-group-container">
      <h2>{{ editMode ? 'Edit Group' : 'Create New Group' }}</h2>
      <form (ngSubmit)="onSubmit()" #createForm="ngForm">
        <div>
          <label for="name">Group Name</label>
          <input id="name" name="name" [(ngModel)]="name" required />
        </div>
        <div>
          <label for="description">Description</label>
          <textarea id="description" name="description" [(ngModel)]="description"></textarea>
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
    .create-group-container { padding: 20px; max-width: 500px; }
    form div { margin: 15px 0; }
    label { display: block; margin-bottom: 5px; font-weight: bold; }
    input, textarea { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
    button { padding: 8px 12px; margin-right: 10px; cursor: pointer; }
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
