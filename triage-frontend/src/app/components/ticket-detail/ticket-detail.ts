import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  Ticket,
  UpdateTicketRequest,
  ResolveTicketRequest
} from '../../models/ticket';

import { TicketService } from '../../services/ticket-service';
import { CommentService } from '../../services/comment-service';

import {
  CreateCommentRequest,
  TicketComment,
  CommentPage
} from '../../models/TicketComment';

import { TicketOptions } from '../../models/ticket-options';
import { OptionsService } from '../../services/options-service';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.scss'
})
export class TicketDetail implements OnInit {

  // =====================================================
  // TICKET
  // =====================================================

  ticket = signal<Ticket | null>(null);

  isLoading = signal(false);

  errorMessage = signal('');

  options = signal<TicketOptions | null>(null);


  // =====================================================
  // TABS
  // =====================================================

  activeTab =
    signal<'resolution' | 'comments'>('resolution');


  // =====================================================
  // RESOLUTION
  // =====================================================

  resolveData = {
    rootCauseCategory: '',
    rootCause: '',
    resolution: ''
  };

  isResolving = signal(false);

  resolutionError = signal('');

  isSavingResolution = signal(false);


  // =====================================================
  // MAIN EDIT
  // =====================================================

  isEditingTicket = signal(false);

  editData: UpdateTicketRequest = {
    title: '',
    description: '',
    category: '',
    severity: '',
    status: '',
    assignedTeam: ''
  };

  isSavingEdit = signal(false);

  editError = signal('');


  // =====================================================
  // COMMENTS
  // =====================================================

  comments = signal<TicketComment[]>([]);

  commentsTotalCount = signal(0);

  commentsHasMore = signal(false);

  private readonly commentsPageSize = 5;

  private commentsSkip = 0;

  isLoadingComments = signal(false);

  commentError = signal('');

  currentUserId = '';


  newComment: CreateCommentRequest = {
    text: ''
  };

  isPostingComment = signal(false);


  // =====================================================
  // COMMENT EDITING
  // =====================================================

  editingCommentId = signal<number | null>(null);

  editingCommentText = '';

  isSavingComment = signal(false);

  isDeletingCommentId = signal<number | null>(null);

  commentEditError = signal('');


  // =====================================================
  // DELETE TICKET
  // =====================================================

  isDeleting = signal(false);


  // =====================================================
  // INCIDENT ID
  // =====================================================

  private incidentId = '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private commentService: CommentService,
    private optionsService: OptionsService,
    private authService: AuthService
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    const currentUser = this.authService.getCurrentUser();

    if (currentUser) {
      this.currentUserId = currentUser.userId;
    } 

    const incidentId = this.route.snapshot.paramMap.get('incidentId');

    if (!incidentId) {

      this.errorMessage.set(
        'No incident ID provided.'
      );

      return;
    }

    this.incidentId = incidentId;


    // ---------------------------------------------------
    // LOAD OPTIONS
    // ---------------------------------------------------

    this.optionsService
      .getOptions()
      .subscribe({

        next: options => {
          this.options.set(options);
        },

        error: err => {

          console.error(
            'Failed to load options:',
            err
          );

        }

      });


    // ---------------------------------------------------
    // LOAD TICKET
    // ---------------------------------------------------

    this.loadTicket();


    // ---------------------------------------------------
    // LOAD COMMENTS
    // ---------------------------------------------------

    this.loadComments();
  }
  
  isCommentOwner(comment: TicketComment): boolean {
    return comment.createdByUserId === this.currentUserId;
  }

  // =====================================================
  // BACK TO DASHBOARD
  // =====================================================

  goToDashboard(): void {

    this.router.navigate(['/']);

  }


  // =====================================================
  // LOAD TICKET
  // =====================================================

  loadTicket(): void {

    this.isLoading.set(true);

    this.errorMessage.set('');


    this.ticketService
      .getById(this.incidentId)
      .subscribe({

        next: ticket => {

          if (!ticket) {

            this.ticket.set(null);

            this.errorMessage.set(
              `Ticket ${this.incidentId} was not found.`
            );

            this.isLoading.set(false);

            return;
          }


          this.ticket.set(ticket);

          this.loadResolutionData(ticket);

          this.isLoading.set(false);

        },


        error: err => {

          console.error(
            'Failed to load ticket:',
            err
          );

          this.ticket.set(null);

          this.errorMessage.set(
            `Ticket ${this.incidentId} not found.`
          );

          this.isLoading.set(false);

        }

      });
  }


  // =====================================================
  // LOAD RESOLUTION DATA
  // =====================================================

  private loadResolutionData(
    ticket: Ticket | null
  ): void {

    if (!ticket) {

      this.resolveData = {
        rootCauseCategory: '',
        rootCause: '',
        resolution: ''
      };

      return;
    }


    this.resolveData = {

      rootCauseCategory:
        ticket.rootCauseCategory ?? '',

      rootCause:
        ticket.rootCause ?? '',

      resolution:
        ticket.resolution ?? ''

    };
  }


  // =====================================================
  // TABS
  // =====================================================

  showResolutionTab(): void {

    this.activeTab.set('resolution');

  }


  showCommentsTab(): void {

    this.activeTab.set('comments');

    /*
     * Refresh comments whenever the comments
     * tab is opened.
     */
    this.loadComments();

  }


  // =====================================================
  // RESOLVE CLICK
  // =====================================================

  onResolveClick(): void {

    const ticket = this.ticket();

    if (!ticket) {
      return;
    }


    /*
     * Already resolved.
     *
     * Do not resolve again.
     */
    if (ticket.status === 'Resolved') {

      this.showResolutionTab();

      return;
    }


    if (!this.hasCompleteResolution()) {

      this.showResolutionTab();

      this.resolutionError.set(
        'Root cause category, root cause and resolution are required before resolving the incident.'
      );

      return;
    }


    this.resolveIncident();

  }


  // =====================================================
  // VALIDATE RESOLUTION
  // =====================================================

  private hasCompleteResolution(): boolean {

    return !!(

      this.resolveData.rootCauseCategory?.trim() &&

      this.resolveData.rootCause?.trim() &&

      this.resolveData.resolution?.trim()

    );

  }


  // =====================================================
  // RESOLVE INCIDENT
  // =====================================================

  resolveIncident(): void {

    if (!this.hasCompleteResolution()) {

      this.showResolutionTab();

      this.resolutionError.set(
        'Root cause category, root cause and resolution are required.'
      );

      return;
    }


    this.isResolving.set(true);

    this.resolutionError.set('');


    const request: ResolveTicketRequest = {

      rootCauseCategory:
        this.resolveData.rootCauseCategory.trim(),

      rootCause:
        this.resolveData.rootCause.trim(),

      resolution:
        this.resolveData.resolution.trim()

    };


    this.ticketService
      .resolve(
        this.incidentId,
        request
      )
      .subscribe({

        next: updatedTicket => {

          this.isResolving.set(false);

          this.resolutionError.set('');


          if (updatedTicket) {

            this.ticket.set(updatedTicket);

            this.loadResolutionData(
              updatedTicket
            );

          } else {

            this.loadTicket();

          }


          this.showResolutionTab();

        },


        error: err => {

          console.error(
            'Failed to resolve ticket:',
            err
          );

          this.resolutionError.set(

            err?.error?.message ||

            'Failed to resolve the incident.'

          );

          this.isResolving.set(false);

        }

      });
  }


  // =====================================================
  // SAVE RESOLUTION AFTER RESOLVED
  // =====================================================

  saveResolvedResolution(): void {

    const ticket = this.ticket();

    if (!ticket) {
      return;
    }


    if (!this.hasCompleteResolution()) {

      this.resolutionError.set(
        'Root cause category, root cause and resolution are required.'
      );

      return;
    }


    this.isSavingResolution.set(true);

    this.resolutionError.set('');


    const request: ResolveTicketRequest = {

      rootCauseCategory:
        this.resolveData.rootCauseCategory.trim(),

      rootCause:
        this.resolveData.rootCause.trim(),

      resolution:
        this.resolveData.resolution.trim()

    };


    this.ticketService
      .resolve(
        this.incidentId,
        request
      )
      .subscribe({

        next: updatedTicket => {

          this.isSavingResolution.set(false);

          this.resolutionError.set('');


          if (updatedTicket) {

            this.ticket.set(updatedTicket);

            this.loadResolutionData(
              updatedTicket
            );

          } else {

            this.loadTicket();

          }

        },


        error: err => {

          console.error(
            'Failed to update resolution:',
            err
          );

          this.resolutionError.set(

            err?.error?.message ||

            'Failed to update resolution information.'

          );

          this.isSavingResolution.set(false);

        }

      });
  }


  // =====================================================
  // START MAIN EDIT
  // =====================================================

  startEditingTicket(): void {

    const t = this.ticket();

    if (!t) {
      return;
    }


    this.editData = {

      title:
        t.title ?? '',

      description:
        t.description ?? '',

      category:
        t.category ?? '',

      severity:
        t.severity ?? '',

      status:
        t.status ?? '',

      assignedTeam:
        t.assignedTeam ?? ''

    };


    this.editError.set('');

    this.isEditingTicket.set(true);

  }


  // =====================================================
  // CANCEL MAIN EDIT
  // =====================================================

  cancelEditingTicket(): void {

    this.isEditingTicket.set(false);

    this.editError.set('');

  }


  // =====================================================
  // SAVE MAIN EDIT
  // =====================================================

  saveEdit(): void {

    if (!this.editData.title?.trim()) {

      this.editError.set(
        'Title is required.'
      );

      return;
    }


    if (!this.editData.description?.trim()) {

      this.editError.set(
        'Description is required.'
      );

      return;
    }


    const ticket = this.ticket();

    if (!ticket) {

      this.editError.set(
        'Ticket information is unavailable.'
      );

      return;
    }


    this.isSavingEdit.set(true);

    this.editError.set('');


    const request: UpdateTicketRequest = {

      title:
        this.editData.title.trim(),

      description:
        this.editData.description.trim(),

      category:
        this.editData.category,

      severity:
        this.editData.severity,

      status:
        this.editData.status,

      assignedTeam:
        this.editData.assignedTeam

    };


    this.ticketService
      .update(
        this.incidentId,
        request
      )
      .subscribe({

        next: () => {

          this.isSavingEdit.set(false);

          this.editError.set('');

          this.isEditingTicket.set(false);

          this.loadTicket();

        },


        error: err => {

          console.error(
            'Failed to save ticket:',
            err
          );

          this.editError.set(

            err?.error?.message ||

            'Failed to save changes.'

          );

          this.isSavingEdit.set(false);

        }

      });
  }


  // =====================================================
  // LOAD COMMENTS
  // =====================================================

  loadComments(): void {

    console.log(
      'Loading comments for:',
      this.incidentId
    );

    this.isLoadingComments.set(true);

    this.commentError.set('');

    /*
     * Start from first page.
     */
    this.commentsSkip = 0;


    this.commentService
      .getForTicket(
        this.incidentId,
        0,
        this.commentsPageSize
      )
      .subscribe({

        next: (page: CommentPage) => {

          console.log(
            '========== COMMENTS RESPONSE =========='
          );

          console.log(
            'Full response:',
            page
          );

          console.log(
            'Comments:',
            page.comments
          );

          console.log(
            'Total count:',
            page.totalCount
          );

          console.log(
            'Has more:',
            page.hasMore
          );


          /*
           * IMPORTANT:
           *
           * API returns CommentPage.
           *
           * We need page.comments,
           * NOT page itself.
           */
          this.comments.set(
            page.comments ?? []
          );


          this.commentsTotalCount.set(
            page.totalCount ?? 0
          );


          this.commentsHasMore.set(
            page.hasMore ?? false
          );


          this.commentsSkip =
            page.comments?.length ?? 0;


          this.isLoadingComments.set(false);

        },


        error: error => {

          console.error(
            '========== COMMENTS ERROR =========='
          );

          console.error(error);


          this.comments.set([]);

          this.commentsTotalCount.set(0);

          this.commentsHasMore.set(false);

          this.commentsSkip = 0;


          this.isLoadingComments.set(false);


          this.commentError.set(

            error?.error?.message ||

            'Failed to load comments.'

          );

        }

      });
  }


  // =====================================================
  // LOAD MORE COMMENTS
  // =====================================================

  loadMoreComments(): void {

    /*
     * Prevent duplicate requests.
     */
    if (
      this.isLoadingComments() ||
      !this.commentsHasMore()
    ) {
      return;
    }


    this.isLoadingComments.set(true);

    this.commentError.set('');


    this.commentService
      .getForTicket(
        this.incidentId,
        this.commentsSkip,
        this.commentsPageSize
      )
      .subscribe({

        next: (page: CommentPage) => {

          const existingComments =
            this.comments();

          const newComments =
            page.comments ?? [];


          /*
           * Append next page.
           */
          this.comments.set([
            ...existingComments,
            ...newComments
          ]);


          this.commentsTotalCount.set(
            page.totalCount ?? 0
          );


          this.commentsHasMore.set(
            page.hasMore ?? false
          );


          /*
           * Move skip forward.
           */
          this.commentsSkip =
            existingComments.length +
            newComments.length;


          this.isLoadingComments.set(false);

        },


        error: error => {

          console.error(
            'Failed to load more comments:',
            error
          );


          this.commentError.set(

            error?.error?.message ||

            'Failed to load more comments.'

          );


          this.isLoadingComments.set(false);

        }

      });
  }


  // =====================================================
  // POST COMMENT
  // =====================================================

  postComment(): void {


    const text =
      this.newComment.text?.trim();


    if ( !text) {

      this.commentError.set(
        'Comment text are required.'
      );

      return;
    }


    this.isPostingComment.set(true);

    this.commentError.set('');


    const request: CreateCommentRequest = {

      text

    };


    console.log(
      'Posting comment:',
      request
    );


    this.commentService
      .create(
        this.incidentId,
        request
      )
      .subscribe({

        next: createdComment => {

          console.log(
            'Comment created successfully:',
            createdComment
          );


          /*
           * Clear form.
           */
          this.newComment = {


            text: ''

          };


          this.isPostingComment.set(false);


          /*
           * Reload first page from DB.
           */
          this.loadComments();

        },


        error: err => {

          console.error(
            'Failed to post comment:',
            err
          );


          this.commentError.set(

            err?.error?.message ||

            'Failed to post comment.'

          );


          this.isPostingComment.set(false);

        }

      });
  }


  // =====================================================
  // START EDIT COMMENT
  // =====================================================

  startEditingComment(
    comment: TicketComment
  ): void {

    this.editingCommentId.set(
      comment.id
    );


    this.editingCommentText =
      comment.text ?? '';


    this.commentEditError.set('');

  }


  // =====================================================
  // CANCEL EDIT COMMENT
  // =====================================================

  cancelEditingComment(): void {

    this.editingCommentId.set(null);

    this.editingCommentText = '';

    this.commentEditError.set('');

  }


  // =====================================================
  // SAVE EDITED COMMENT
  // =====================================================

  saveEditedComment(
    comment: TicketComment
  ): void {

    const text =
      this.editingCommentText?.trim();


    if (!text) {

      this.commentEditError.set(
        'Comment cannot be empty.'
      );

      return;
    }


    this.isSavingComment.set(true);

    this.commentEditError.set('');


    this.commentService
      .update(
        this.incidentId,
        comment.id,
        {
          text
        }
      )
      .subscribe({

        next: updatedComment => {

          console.log(
            'Comment updated successfully:',
            updatedComment
          );


          this.editingCommentId.set(null);

          this.editingCommentText = '';

          this.commentEditError.set('');

          this.isSavingComment.set(false);


          /*
           * Reload from database.
           */
          this.loadComments();

        },


        error: err => {

          console.error(
            'Failed to update comment:',
            err
          );


          this.commentEditError.set(

            err?.error?.message ||

            'Failed to update comment.'

          );


          this.isSavingComment.set(false);

        }

      });
  }


  // =====================================================
  // DELETE COMMENT
  // =====================================================

  deleteComment(
    comment: TicketComment
  ): void {

    const confirmed = confirm(
      'Delete this comment? This cannot be undone.'
    );


    if (!confirmed) {
      return;
    }


    this.isDeletingCommentId.set(
      comment.id
    );


    this.commentError.set('');


    this.commentService
      .delete(
        this.incidentId,
        comment.id
      )
      .subscribe({

        next: () => {

          console.log(
            'Comment deleted successfully.'
          );


          if (
            this.editingCommentId() ===
            comment.id
          ) {

            this.editingCommentId.set(null);

            this.editingCommentText = '';

          }


          this.isDeletingCommentId.set(null);


          /*
           * Reload from database.
           */
          this.loadComments();

        },


        error: err => {

          console.error(
            'Failed to delete comment:',
            err
          );


          this.commentError.set(

            err?.error?.message ||

            'Failed to delete comment.'

          );


          this.isDeletingCommentId.set(null);

        }

      });
  }


  // =====================================================
  // DELETE TICKET
  // =====================================================

  deleteTicket(): void {

    const confirmed = confirm(

      `Delete ticket ${this.incidentId}? This cannot be undone.`

    );


    if (!confirmed) {
      return;
    }


    this.isDeleting.set(true);


    this.ticketService
      .delete(this.incidentId)
      .subscribe({

        next: () => {

          this.router.navigate(['/']);

        },


        error: err => {

          console.error(
            'Failed to delete ticket:',
            err
          );


          this.errorMessage.set(
            'Failed to delete ticket.'
          );


          this.isDeleting.set(false);

        }

      });
  }


  // =====================================================
  // SEVERITY CSS
  // =====================================================

  severityClass(
    severity: string | null
  ): string {

    if (!severity) {
      return '';
    }


    return (

      'severity-' +

      severity
        .toLowerCase()
        .replace(/\s+/g, '-')

    );
  }


  // =====================================================
  // STATUS CSS
  // =====================================================

  statusClass(
    status: string | null
  ): string {

    if (!status) {
      return '';
    }


    return (

      'status-' +

      status
        .toLowerCase()
        .replace(/\s+/g, '-')

    );
  }

}