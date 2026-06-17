import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ExpenseShare {
  userId: string;
  amount: number;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  currency: string;
  shares: ExpenseShare[];
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  constructor(private api: ApiService) {}

  createExpense(payload: {
    groupId: string;
    description: string;
    amount: number;
    currency: string;
    shares: ExpenseShare[];
    payers?: ExpenseShare[];
  }): Observable<any> {
    return this.api.post('/expenses', payload);
  }

  getGroupExpenses(groupId: string): Observable<any> {
    return this.api.get(`/expenses/group/${groupId}`);
  }

  getExpenseById(id: string): Observable<any> {
    return this.api.get(`/expenses/${id}`);
  }

  updateExpense(id: string, payload: any): Observable<any> {
    return this.api.put(`/expenses/${id}`, payload);
  }

  deleteExpense(id: string): Observable<any> {
    return this.api.delete(`/expenses/${id}`);
  }
}
