import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Balance {
  userId: string;
  total: number;
  paid: number;
  due: number;
}

@Injectable({
  providedIn: 'root'
})
export class BalanceService {
  constructor(private api: ApiService) {}

  getUserBalances(): Observable<any> {
    return this.api.get('/balances');
  }

  getGroupBalances(groupId: string): Observable<any> {
    return this.api.get(`/balances/group/${groupId}`);
  }
}
