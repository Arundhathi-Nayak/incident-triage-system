import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Ticket } from '../../models/ticket';
import { TicketService } from '../../services/ticket-service';
import { CommentService } from '../../services/comment-service';
import { CreateCommentRequest, TicketComment } from '../../models/TicketComment';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterLink,FormsModule],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.scss',
})
export class TicketDetail implements OnInit {
  ticket = signal<Ticket | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');

  comments = signal<TicketComment[]>([]);
  isLoadingComments = signal(false);
  commentError = signal('');

  newComment: CreateCommentRequest = { author: '', text: '' };
  isPostingComment = signal(false);

  constructor(private route: ActivatedRoute, private ticketService: TicketService, private commentService:CommentService) {}

  private incidentId = '';

  ngOnInit(): void {
    const incidentId = this.route.snapshot.paramMap.get('incidentId');
    if (!incidentId) {
      this.errorMessage.set('No incident ID provided.');
      return;
    }
    this.incidentId = incidentId;

    this.loadTicket();
    this.loadComments();
}
  loadTicket(): void {
    this.isLoading.set(true);
    this.ticketService.getById(this.incidentId).subscribe({
      next: (ticket) => {
        this.ticket.set(ticket);
       if (ticket.status === 'Resolved') {
        this.resolveData = {
          rootCause: ticket.rootCause ?? '',
          resolution: ticket.resolution ?? ''
        };
      }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(`Ticket ${this.incidentId} not found.`);
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }
  loadComments(): void {
    this.isLoadingComments.set(true);
    this.commentService.getForTicket(this.incidentId).subscribe({
      next: (comments) => {
        this.comments.set(comments);
        this.isLoadingComments.set(false);
      },
      error: (err) => {
        this.commentError.set('Failed to load comments.');
        this.isLoadingComments.set(false);
        console.error(err);
      }
    });
  }

  postComment(): void {
    if (!this.newComment.author.trim() || !this.newComment.text.trim()) {
      this.commentError.set('Author and comment text are required.');
      return;
    }

    this.isPostingComment.set(true);
    this.commentError.set('');

    this.commentService.create(this.incidentId, this.newComment).subscribe({
      next: (comment) => {
        this.comments.update(list => [...list, comment]);
        this.newComment = { author: '', text: '' };
        this.isPostingComment.set(false);
      },
      error: (err) => {
        this.commentError.set('Failed to post comment.');
        this.isPostingComment.set(false);
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

// ticket reolution 

  isEditingResolution = signal(false);
  resolveData = { rootCause: '', resolution: '' };
  isResolving = signal(false);
  resolveError = signal('');

  startEditingResolution(): void {
  this.isEditingResolution.set(true);
  this.resolveError.set('');
}

  cancelEditingResolution(): void {
  this.isEditingResolution.set(false);
  this.resolveError.set('');
  this.resolveData = { rootCause: '', resolution: '' };
}

submitResolution(): void {
  if (!this.resolveData.rootCause.trim() || !this.resolveData.resolution.trim()) {
    this.resolveError.set('Root cause and resolution are both required.');
    return;
  }

this.isResolving.set(true);
this.resolveError.set('');
this.ticketService.resolve(this.incidentId, this.resolveData.rootCause, this.resolveData.resolution).subscribe({
    next: (updatedTicket) => {
      this.ticket.set(updatedTicket);
      this.isEditingResolution.set(false);
      this.isResolving.set(false);
    },
    error: (err) => {
      this.resolveError.set('Failed to resolve ticket. It may already be resolved.');
      this.isResolving.set(false);
      console.error(err);
    }
  });
}
isResolutionFieldsDisabled(): boolean {
  const t = this.ticket();
  return !this.isEditingResolution() || t?.status === 'Resolved';
}
}
