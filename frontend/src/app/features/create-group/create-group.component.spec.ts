import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { CreateGroupComponent } from './create-group.component';
import { GroupService } from '../../core/group.service';

describe('CreateGroupComponent', () => {
  let component: CreateGroupComponent;
  let fixture: ComponentFixture<CreateGroupComponent>;
  let groupService: { createGroup: jest.Mock; updateGroup: jest.Mock; getGroupById: jest.Mock };
  let router: { navigate: jest.Mock };

  beforeEach(async () => {
    groupService = {
      createGroup: jest.fn().mockReturnValue(of({ group: { id: 'g1' } })),
      updateGroup: jest.fn().mockReturnValue(of({ group: { id: 'g1' } })),
      getGroupById: jest.fn().mockReturnValue(of({ group: { id: 'g1', name: 'Trip', description: 'Weekend' } }))
    };

    router = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [CreateGroupComponent],
      providers: [
        { provide: GroupService, useValue: groupService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { params: of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('creates a group and navigates back to groups', () => {
    component.name = 'Trip';
    component.description = 'Weekend';

    component.onSubmit();

    expect(groupService.createGroup).toHaveBeenCalledWith({
      name: 'Trip',
      description: 'Weekend'
    });
    expect(router.navigate).toHaveBeenCalledWith(['/groups']);
  });
});
