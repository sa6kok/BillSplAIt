import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GroupService } from '../../core/group.service';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.css']
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
