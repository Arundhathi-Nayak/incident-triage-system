import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CreateTicketRequest } from '../../models/ticket';
import { TicketService } from '../../services/ticket-service';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './ticket-form.html',
  styleUrl: './ticket-form.scss'
})
export class TicketForm {

  formData: CreateTicketRequest = {
    title: '',
    description: '',
    createdBy: ''
  };

  isSubmitting = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  constructor(
    private ticketService: TicketService,
    private router: Router
  ) {}

  onSubmit(): void {

    if (
      !this.formData.title.trim() ||
      !this.formData.description.trim() ||
      !this.formData.createdBy.trim()
    ) {
      this.errorMessage.set('All fields are required.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const request: CreateTicketRequest = {
      title: this.formData.title.trim(),
      description: this.formData.description.trim(),
      createdBy: this.formData.createdBy.trim()
    };

    this.ticketService.create(request).subscribe({

      next: (createdTicket) => {

        this.isSubmitting.set(false);

        this.successMessage.set(
          `Ticket ${createdTicket.incidentId} created successfully.`
        );

        // Go directly to the new incident after creation
        setTimeout(() => {
          this.router.navigate([
            '/tickets',
            createdTicket.incidentId
          ]);
        }, 700);
      },

      error: (err) => {

        console.error('Ticket creation failed:', err);

        this.isSubmitting.set(false);

        this.errorMessage.set(
          'Failed to create ticket. Please try again.'
        );
      }
    });
  }


  goToDashboard(): void {
    this.router.navigate(['/']);
  }


  cancel(): void {
    this.router.navigate(['/']);
  }
}