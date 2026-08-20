import { CommonModule } from '@angular/common';
import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { Ticket } from '../../models/ticket';
import { TicketService } from '../../services/ticket-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ticket-dashboard',
  standalone:true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ticket-dashboard.html',
  styleUrl: './ticket-dashboard.scss',
})
export class TicketDashboard implements OnInit {
  tickets=signal<Ticket[]>([]);
  isLoading=signal(true);
  errorMessage=signal('');
  searchTerm=signal('');

  filteredTickets= computed(()=>{
    const term= this.searchTerm().trim().toLowerCase();
    if(!term) return this.tickets();

    return this.tickets().filter(t=>
      t.incidentId.toLowerCase().includes(term)||
      t.title.toLowerCase().includes(term) ||
      t.createdBy.toLowerCase().includes(term) ||
      (t.category ?? '').toLowerCase().includes(term) ||
      (t.assignedTeam ?? '').toLowerCase().includes(term)
    );
  });

  constructor(private ticketService: TicketService) {}
  
  ngOnInit(): void {
      this.loadTickets();
  }

  loadTickets():void{
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.ticketService.getAll().subscribe({
      next:(tickets)=>{
        this.tickets.set(tickets);
        this.isLoading.set(false);
      },
      error:(err)=>{
        this.errorMessage.set('Failed to load tickets.');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }

  onSearchChange(value:string):void{
    this.searchTerm.set(value);
  }

  severityClass(severity: string | null): string {
    if (!severity) return '';
    return 'severity-' + severity.toLowerCase();
  }

  statusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(' ', '-');
  }

}
