import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { GroupsListComponent } from './features/groups-list/groups-list.component';
import { CreateGroupComponent } from './features/create-group/create-group.component';
import { ExpensesListComponent } from './features/expenses-list/expenses-list.component';
import { CreateExpenseComponent } from './features/create-expense/create-expense.component';
import { BalancesComponent } from './features/balances/balances.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'groups', component: GroupsListComponent, canActivate: [AuthGuard] },
  { path: 'groups/create', component: CreateGroupComponent, canActivate: [AuthGuard] },
  { path: 'groups/:id/edit', component: CreateGroupComponent, canActivate: [AuthGuard] },
  { path: 'groups/:groupId/expenses', component: ExpensesListComponent, canActivate: [AuthGuard] },
  { path: 'groups/:groupId/expenses/create', component: CreateExpenseComponent, canActivate: [AuthGuard] },
  { path: 'groups/:groupId/expenses/:expenseId/edit', component: CreateExpenseComponent, canActivate: [AuthGuard] },
  { path: 'groups/:groupId/balances', component: BalancesComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/groups', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
