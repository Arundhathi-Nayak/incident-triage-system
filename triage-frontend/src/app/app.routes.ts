import { Routes } from '@angular/router';

import { TicketForm } from './components/ticket-form/ticket-form';
import { TicketDetail } from './components/ticket-detail/ticket-detail';
import { TicketDashboard } from './components/ticket-dashboard/ticket-dashboard';
import { authGuard } from './guards/auth.guard';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';

export const routes: Routes = [
  { path: 'login',component: Login},
  { path: 'register',component: Register },
 { path: '', component: TicketDashboard, canActivate: [authGuard] },
  { path: 'create', component: TicketForm , canActivate: [authGuard]},
  { path: 'tickets/:incidentId', component: TicketDetail , canActivate: [authGuard]}
];
