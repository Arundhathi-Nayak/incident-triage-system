import { Routes } from '@angular/router';

import { TicketForm } from './components/ticket-form/ticket-form';
import { TicketDetail } from './components/ticket-detail/ticket-detail';
import { TicketDashboard } from './components/ticket-dashboard/ticket-dashboard';

export const routes: Routes = [
 { path: '', component: TicketDashboard },
  { path: 'create', component: TicketForm },
  { path: 'tickets/:incidentId', component: TicketDetail }
];
