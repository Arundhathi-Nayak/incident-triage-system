import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Ticket } from '../../models/ticket';
import { TicketService } from '../../services/ticket-service';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.scss',
})
export class TicketDetail implements OnInit {
  ticket = signal<Ticket | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(private route: ActivatedRoute, private ticketService: TicketService) {}

  ngOnInit(): void {
    const incidentId = this.route.snapshot.paramMap.get('incidentId');
    if (!incidentId) {
      this.errorMessage.set('No incident ID provided.');
      return;
    }
    this.isLoading.set(true);
    this.ticketService.getById(incidentId).subscribe({
      next: (ticket) => {
        this.ticket.set(ticket);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(`Ticket ${incidentId} not found.`);
        this.isLoading.set(false);
        console.error(err);
      }
    });
}
 severityClass(severity: string | null): string {
    if (!severity) return '';
    return 'severity-' + severity.toLowerCase();
  }

  statusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(' ', '-');
  }


}
