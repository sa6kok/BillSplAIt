import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { GroupsListComponent } from './groups-list.component';
import { GroupService } from '../../core/group.service';

describe('GroupsListComponent', () => {
  let component: GroupsListComponent;
  let fixture: ComponentFixture<GroupsListComponent>;
  let groupService: { getGroups: jest.Mock };

  beforeEach(async () => {
    groupService = {
      getGroups: jest.fn().mockReturnValue(
        of({ groups: [{ id: 'g1', name: 'Trip', description: 'Weekend', members: [] }] })
      )
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [GroupsListComponent],
      providers: [
        { provide: GroupService, useValue: groupService },
        { provide: Router, useValue: { navigate: jest.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GroupsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('loads groups on init', () => {
    expect(groupService.getGroups).toHaveBeenCalled();
    expect(component.groups).toHaveLength(1);
    expect(component.groups[0].name).toBe('Trip');
  });
});
