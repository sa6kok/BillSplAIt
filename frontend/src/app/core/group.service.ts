import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Group {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  constructor(private api: ApiService) {}

  createGroup(payload: { name: string; description?: string }): Observable<any> {
    return this.api.post('/groups', payload);
  }

  getGroups(): Observable<any> {
    return this.api.get('/groups');
  }

  getGroupById(id: string): Observable<any> {
    return this.api.get(`/groups/${id}`);
  }

  updateGroup(id: string, payload: { name?: string; description?: string }): Observable<any> {
    return this.api.put(`/groups/${id}`, payload);
  }

  deleteGroup(id: string): Observable<any> {
    return this.api.delete(`/groups/${id}`);
  }

  addMember(groupId: string, email: string): Observable<any> {
    return this.api.post(`/groups/${groupId}/members`, { email });
  }

  removeMember(groupId: string, memberId: string): Observable<any> {
    return this.api.delete(`/groups/${groupId}/members/${memberId}`);
  }
}
