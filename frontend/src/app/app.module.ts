import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './root/app.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AuthInterceptor } from './auth/auth.interceptor';
import { GroupsListComponent } from './features/groups-list/groups-list.component';
import { CreateGroupComponent } from './features/create-group/create-group.component';
import { ExpensesListComponent } from './features/expenses-list/expenses-list.component';
import { CreateExpenseComponent } from './features/create-expense/create-expense.component';
import { BalancesComponent } from './features/balances/balances.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    GroupsListComponent,
    CreateGroupComponent,
    ExpensesListComponent,
    CreateExpenseComponent,
    BalancesComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
