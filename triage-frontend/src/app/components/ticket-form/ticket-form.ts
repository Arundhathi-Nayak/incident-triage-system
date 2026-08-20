import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateTicketRequest } from '../../models/ticket';
import { TicketService } from '../../services/ticket-service';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-ticket-form',
  standalone:true,
  imports: [FormsModule,CommonModule],
  templateUrl: './ticket-form.html',
  styleUrl: './ticket-form.scss',
})
export class TicketForm {
  formData:CreateTicketRequest={
    title:'',
    description:'',
    createdBy:''
  };

  isSubmitting=signal(false);
  successMessage=signal('');
  errorMessage=signal('');

  constructor(private ticketService:TicketService,private router: Router){}

  onSubmit():void{
    if(!this.formData.title.trim() || !this.formData.description.trim() ||!this.formData.createdBy.trim()){
      this.errorMessage.set("All fields are required.");
      return;
    }
    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.ticketService.create(this.formData)
    .subscribe({
      next:(classifiedTicket)=>{
        this.isSubmitting.set(false);
        this.successMessage.set(`Ticket ${classifiedTicket.incidentId} created successfully.`);
        this.formData={title:'',description:'',createdBy:''};
      },
      error:(err)=>{
        this.isSubmitting.set(false);
        this.errorMessage.set('failed to create ticket.');
        console.error(err);
      }
    });
  }
}
