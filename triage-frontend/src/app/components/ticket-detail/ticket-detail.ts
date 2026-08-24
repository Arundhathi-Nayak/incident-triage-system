import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  Ticket,
  UpdateTicketRequest
} from '../../models/ticket';

import { TicketService } from '../../services/ticket-service';
import { CommentService } from '../../services/comment-service';

import {
  CreateCommentRequest,
  TicketComment
} from '../../models/TicketComment';

import { TicketOptions } from '../../models/ticket-options';
import { OptionsService } from '../../services/options-service';


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
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private commentService: CommentService,
    private optionsService: OptionsService
  ) {}

  goToDashboard(): void {
    this.router.navigate(['/']);
  }

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

  /*
   * Used when editing resolution information
   * of an already resolved ticket.
   */
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

    assignedTeam: '',

    summary: '',

    rootCauseCategory: '',

    rootCause: '',

    resolution: ''
  };

  isSavingEdit = signal(false);

  editError = signal('');


  // =====================================================
  // COMMENTS
  // =====================================================

  comments = signal<TicketComment[]>([]);

  isLoadingComments = signal(false);

  commentError = signal('');

  newComment: CreateCommentRequest = {

    author: '',

    text: ''
  };

  isPostingComment = signal(false);


  // =====================================================
  // DELETE
  // =====================================================

  isDeleting = signal(false);


  // =====================================================
  // INCIDENT ID
  // =====================================================

  private incidentId = '';




  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    const incidentId =
      this.route.snapshot.paramMap.get('incidentId');

    if (!incidentId) {

      this.errorMessage.set(
        'No incident ID provided.'
      );

      return;
    }

    this.incidentId = incidentId;


    // Load dropdown options
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


    // Load ticket
    this.loadTicket();


    // Load comments
    this.loadComments();
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

          /*
           * Make sure backend actually returned
           * a ticket.
           */
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

    /*
     * IMPORTANT:
     *
     * Never read properties from a null ticket.
     */
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
     * Do not resolve an already resolved ticket again.
     */
    if (ticket.status === 'Resolved') {

      this.showResolutionTab();

      return;
    }


    /*
     * Validate resolution information.
     */
    if (!this.hasCompleteResolution()) {

      this.showResolutionTab();

      this.resolutionError.set(
        'Root cause category, root cause and resolution are required before resolving the incident.'
      );

      return;
    }


    /*
     * Resolve immediately.
     */
    this.resolveIncident();
  }


  // =====================================================
  // CHECK RESOLUTION
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


    this.ticketService
      .resolve(

        this.incidentId,

        this.resolveData.rootCauseCategory.trim(),

        this.resolveData.rootCause.trim(),

        this.resolveData.resolution.trim()

      )
      .subscribe({

        next: updatedTicket => {

          console.log(
            'Resolve API response:',
            updatedTicket
          );


          this.isResolving.set(false);

          this.resolutionError.set('');


          /*
           * Some APIs return the updated ticket.
           *
           * If yours returns null, reload it.
           */
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


    /*
     * Validate resolution.
     */
    if (!this.hasCompleteResolution()) {

      this.resolutionError.set(
        'Root cause category, root cause and resolution are required.'
      );

      return;
    }


    this.isSavingResolution.set(true);

    this.resolutionError.set('');


    /*
     * Keep ticket resolved.
     */
    const request: UpdateTicketRequest = {

      title:
        ticket.title ?? '',

      description:
        ticket.description ?? '',

      category:
        ticket.category ?? '',

      severity:
        ticket.severity ?? '',

      status:
        'Resolved',

      assignedTeam:
        ticket.assignedTeam ?? '',

      summary:
        ticket.summary ?? '',

      rootCauseCategory:
        this.resolveData.rootCauseCategory.trim(),

      rootCause:
        this.resolveData.rootCause.trim(),

      resolution:
        this.resolveData.resolution.trim()
    };


    this.ticketService
      .update(

        this.incidentId,

        request

      )
      .subscribe({

        next: () => {

          console.log(
            'Resolution updated successfully.'
          );


          this.isSavingResolution.set(false);

          this.resolutionError.set('');


          /*
           * The update API returns null.
           *
           * Therefore reload the ticket from
           * the database.
           */
          this.loadTicket();
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
        t.assignedTeam ?? '',

      summary:
        t.summary ?? '',


      /*
       * Preserve resolution information.
       *
       * These fields are NOT shown in the
       * main Edit form.
       */
      rootCauseCategory:
        t.rootCauseCategory ?? '',

      rootCause:
        t.rootCause ?? '',

      resolution:
        t.resolution ?? ''
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

  // =====================================================
  // VALIDATION
  // =====================================================

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


  // =====================================================
  // START SAVING
  // =====================================================

  this.isSavingEdit.set(true);

  this.editError.set('');


  // =====================================================
  // UPDATE REQUEST
  // =====================================================

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
      this.editData.assignedTeam,

    summary:
      this.editData.summary,


    // Preserve existing resolution information
    rootCauseCategory:
      ticket.rootCauseCategory ?? '',

    rootCause:
      ticket.rootCause ?? '',

    resolution:
      ticket.resolution ?? ''
  };


  console.log(
    'Saving ticket:',
    request
  );


  // =====================================================
  // UPDATE API
  // =====================================================

  this.ticketService
    .update(
      this.incidentId,
      request
    )
    .subscribe({

      // ===================================================
      // SUCCESS
      // ===================================================

      next: () => {

        console.log(
          'Ticket updated successfully.'
        );


        /*
         * Stop the loading state.
         */
        this.isSavingEdit.set(false);


        /*
         * Clear errors.
         */
        this.editError.set('');


        /*
         * IMPORTANT:
         *
         * We are already on:
         *
         * /tickets/:incidentId
         *
         * Therefore DO NOT navigate to the
         * same route again.
         */


        /*
         * Leave edit mode.
         *
         * This immediately displays the
         * normal ticket detail UI.
         */
        this.isEditingTicket.set(false);


        /*
         * Reload the ticket from the backend.
         *
         * This gets the actual updated values
         * from the database.
         */
        this.loadTicket();

      },


      // ===================================================
      // ERROR
      // ===================================================

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

    this.isLoadingComments.set(true);

    this.commentError.set('');


    this.commentService
      .getForTicket(this.incidentId)
      .subscribe({

        next: comments => {

          this.comments.set(comments);

          this.isLoadingComments.set(false);
        },


        error: err => {

          console.error(
            'Failed to load comments:',
            err
          );


          this.commentError.set(
            'Failed to load comments.'
          );


          this.isLoadingComments.set(false);
        }

      });
  }


  // =====================================================
  // POST COMMENT
  // =====================================================

  postComment(): void {

    if (

      !this.newComment.author.trim() ||

      !this.newComment.text.trim()

    ) {

      this.commentError.set(
        'Author and comment text are required.'
      );

      return;
    }


    this.isPostingComment.set(true);

    this.commentError.set('');


    this.commentService
      .create(

        this.incidentId,

        this.newComment

      )
      .subscribe({

        next: comment => {

          this.comments.update(

            list => [

              ...list,

              comment

            ]

          );


          this.newComment = {

            author: '',

            text: ''

          };


          this.isPostingComment.set(false);
        },


        error: err => {

          console.error(
            'Failed to post comment:',
            err
          );


          this.commentError.set(
            'Failed to post comment.'
          );


          this.isPostingComment.set(false);
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
  // SEVERITY CSS CLASS
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
  // STATUS CSS CLASS
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