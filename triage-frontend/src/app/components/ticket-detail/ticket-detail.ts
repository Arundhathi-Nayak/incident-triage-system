import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Ticket, UpdateTicketRequest } from '../../models/ticket';
import { TicketService } from '../../services/ticket-service';
import { CommentService } from '../../services/comment-service';
import { CreateCommentRequest, TicketComment } from '../../models/TicketComment';
import { FormsModule } from '@angular/forms';
import { TicketOptions } from '../../models/ticket-options';
import { OptionsService } from '../../services/options-service';

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

  options = signal<TicketOptions | null>(null);

  comments = signal<TicketComment[]>([]);
  isLoadingComments = signal(false);
  commentError = signal('');

  newComment: CreateCommentRequest = { author: '', text: '' };
  isPostingComment = signal(false);

  isEditingResolution = signal(false);
  resolveData = { rootCauseCategory: '', rootCause: '', resolution: '' };
  isResolving = signal(false);
  resolveError = signal('');

  isEditingTicket = signal(false);
  editData: UpdateTicketRequest = { title: '', description: '', category: '', severity: '', status: '', assignedTeam: '' ,
  resolution: '',
  rootCauseCategory: '',
  rootCause: '',
  summary: ''}
  isSavingEdit = signal(false);
  editError = signal('');

  isDeleting = signal(false);

 constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private commentService: CommentService,
    private optionsService: OptionsService
  ) {}

  private incidentId = '';

  ngOnInit(): void {
    const incidentId = this.route.snapshot.paramMap.get('incidentId');
    if (!incidentId) {
      this.errorMessage.set('No incident ID provided.');
      return;
    }
    this.incidentId = incidentId;

    this.optionsService.getOptions().subscribe({
      next: (opts) => this.options.set(opts),
      error: (err) => console.error('Failed to load options:', err)
    });

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
           rootCauseCategory: ticket.rootCauseCategory ?? '',
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

   startEditingTicket(): void {
    const t = this.ticket();
    if (!t) return;
    this.editData = {
      title: t.title,
      description: t.description,
      category: t.category ?? '',
      severity: t.severity ?? '',
      status: t.status,
      assignedTeam: t.assignedTeam ?? '',
      resolution: t.resolution,
      rootCauseCategory: t.rootCauseCategory,
      rootCause: t.rootCause,
      summary: t.summary

    };
    this.isEditingTicket.set(true);
    this.editError.set('');
  }

   cancelEditingTicket(): void {
    this.isEditingTicket.set(false);
    this.editError.set('');
  }

  saveEdit(): void {
    if (!this.editData.title.trim() || !this.editData.description.trim()) {
      this.editError.set('Title and description are required.');
      return;
    }

    this.isSavingEdit.set(true);
    this.editError.set('');

      this.ticketService.update(this.incidentId, this.editData).subscribe({
      next: (updatedTicket) => {
        this.ticket.set(updatedTicket);
        this.isEditingTicket.set(false);
        this.isSavingEdit.set(false);
      },
      error: (err) => {
        this.editError.set('Failed to save changes.');
        this.isSavingEdit.set(false);
        console.error(err);
      }
    });
  }

  deleteTicket(): void {
    const confirmed = confirm(`Delete ticket ${this.incidentId}? This cannot be undone.`);
    if (!confirmed) return;

    this.isDeleting.set(true);
    this.ticketService.delete(this.incidentId).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.errorMessage.set('Failed to delete ticket.');
        this.isDeleting.set(false);
        console.error(err);
      }
    });
  }

  startEditingResolution(): void {
    this.isEditingResolution.set(true);
    this.resolveError.set('');
  }

  cancelEditingResolution(): void {
    this.isEditingResolution.set(false);
    this.resolveError.set('');
  }
  submitResolution(): void {
    if (!this.resolveData.rootCauseCategory || !this.resolveData.rootCause.trim() || !this.resolveData.resolution.trim()) {
      this.resolveError.set('Root cause category, root cause, and resolution are all required.');
      return;
    }

    this.isResolving.set(true);
    this.resolveError.set('');

    this.ticketService.resolve(
      this.incidentId,
      this.resolveData.rootCauseCategory,
      this.resolveData.rootCause,
      this.resolveData.resolution
    ).subscribe({
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

 severityClass(severity: string | null): string {
    if (!severity) return '';
    return 'severity-' + severity.toLowerCase();
  }

  statusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(' ', '-');
  }


}
