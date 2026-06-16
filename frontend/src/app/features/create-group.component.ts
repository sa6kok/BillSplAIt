import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService } from '../core/group.service';

@Component({
  selector: 'app-create-group',
  template: `
    <div class="create-group-container">
      <h2>Create New Group</h2>
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
          <button type="submit" [disabled]="loading">Create</button>
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
export class CreateGroupComponent {
  name = '';
  description = '';
  loading = false;
  error?: string;

  constructor(private groupService: GroupService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.error = undefined;
    this.groupService.createGroup({ name: this.name, description: this.description }).subscribe({
      next: () => {
        this.router.navigate(['/groups']);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to create group';
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/groups']);
  }
}
