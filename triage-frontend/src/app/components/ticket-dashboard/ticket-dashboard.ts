import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  computed,
  signal
} from '@angular/core';
import {
  FormsModule
} from '@angular/forms';
import {
  RouterLink
} from '@angular/router';

import { Ticket } from '../../models/ticket';
import { TicketService } from '../../services/ticket-service';

@Component({
  selector: 'app-ticket-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './ticket-dashboard.html',
  styleUrl: './ticket-dashboard.scss'
})
export class TicketDashboard implements OnInit {

  // =========================================================
  // DATA
  // =========================================================

  tickets = signal<Ticket[]>([]);

  isLoading = signal<boolean>(true);

  errorMessage = signal<string>('');

  searchTerm = signal<string>('');

  // =========================================================
  // FILTER PANEL
  // =========================================================

  showFilters = signal<boolean>(false);

  selectedStatus = '';

  selectedSeverity = '';

  selectedCategory = '';

  selectedTeam = '';

  // =========================================================
  // FILTER OPTIONS
  // =========================================================

  statuses: string[] = [
    'Open',
    'In Progress',
    'Resolved'
  ];

  severities: string[] = [
    'Low',
    'Medium',
    'High',
    'Critical'
  ];

  // =========================================================
  // DYNAMIC CATEGORY OPTIONS
  // =========================================================

  categories = computed(() => {

    const values = this.tickets()
      .map(ticket => ticket.category)
      .filter(
        (category): category is string =>
          !!category && category.trim().length > 0
      );

    return [...new Set(values)].sort();

  });

  // =========================================================
  // DYNAMIC TEAM OPTIONS
  // =========================================================

  teams = computed(() => {

    const values = this.tickets()
      .map(ticket => ticket.assignedTeam)
      .filter(
        (team): team is string =>
          !!team && team.trim().length > 0
      );

    return [...new Set(values)].sort();

  });

  // =========================================================
  // TOTAL
  // =========================================================

  totalTickets = computed(() => {
    return this.tickets().length;
  });

  // =========================================================
  // OPEN
  // =========================================================

  openTickets = computed(() => {

    return this.tickets().filter(ticket =>
      this.normalize(ticket.status) === 'open'
    ).length;

  });

  // =========================================================
  // IN PROGRESS
  // =========================================================

  inProgressTickets = computed(() => {

    return this.tickets().filter(ticket =>
      this.normalize(ticket.status) === 'in progress'
    ).length;

  });

  // =========================================================
  // RESOLVED
  // =========================================================

  resolvedTickets = computed(() => {

    return this.tickets().filter(ticket =>
      this.normalize(ticket.status) === 'resolved'
    ).length;

  });

  // =========================================================
  // RESOLUTION PERCENTAGE
  // =========================================================

  resolvedPercentage = computed(() => {

    const total = this.totalTickets();

    if (total === 0) {
      return 0;
    }

    return Math.round(
      (this.resolvedTickets() / total) * 100
    );

  });

  // =========================================================
  // ACTIVE FILTER COUNT
  // =========================================================

  activeFilterCount = computed(() => {

    let count = 0;

    if (this.selectedStatus) {
      count++;
    }

    if (this.selectedSeverity) {
      count++;
    }

    if (this.selectedCategory) {
      count++;
    }

    if (this.selectedTeam) {
      count++;
    }

    return count;

  });

  // =========================================================
  // FILTERED TICKETS
  // =========================================================

  filteredTickets = computed(() => {

    const term = this.searchTerm()
      .trim()
      .toLowerCase();

    const status = this.selectedStatus
      .trim()
      .toLowerCase();

    const severity = this.selectedSeverity
      .trim()
      .toLowerCase();

    const category = this.selectedCategory
      .trim()
      .toLowerCase();

    const team = this.selectedTeam
      .trim()
      .toLowerCase();

    return this.tickets().filter(ticket => {

      // -----------------------------------------
      // SEARCH
      // -----------------------------------------

      const matchesSearch =
        !term ||

        this.safeString(ticket.incidentId)
          .toLowerCase()
          .includes(term) ||

        this.safeString(ticket.title)
          .toLowerCase()
          .includes(term) ||

        this.safeString(ticket.createdBy)
          .toLowerCase()
          .includes(term) ||

        this.safeString(ticket.category)
          .toLowerCase()
          .includes(term) ||

        this.safeString(ticket.assignedTeam)
          .toLowerCase()
          .includes(term);

      // -----------------------------------------
      // STATUS
      // -----------------------------------------

      const matchesStatus =
        !status ||
        this.normalize(ticket.status) === status;

      // -----------------------------------------
      // SEVERITY
      // -----------------------------------------

      const matchesSeverity =
        !severity ||
        this.normalize(ticket.severity) === severity;

      // -----------------------------------------
      // CATEGORY
      // -----------------------------------------

      const matchesCategory =
        !category ||
        this.safeString(ticket.category)
          .toLowerCase() === category;

      // -----------------------------------------
      // TEAM
      // -----------------------------------------

      const matchesTeam =
        !team ||
        this.safeString(ticket.assignedTeam)
          .toLowerCase() === team;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSeverity &&
        matchesCategory &&
        matchesTeam
      );

    });

  });

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private ticketService: TicketService
  ) {}

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadTickets();
  }

  // =========================================================
  // LOAD TICKETS
  // =========================================================

  loadTickets(): void {

    this.isLoading.set(true);

    this.errorMessage.set('');

    this.ticketService.getAll().subscribe({

      next: (tickets: Ticket[]) => {

        this.tickets.set(tickets ?? []);

        this.isLoading.set(false);

      },

      error: (error) => {

        console.error(
          'Failed to load tickets:',
          error
        );

        this.errorMessage.set(
          'Failed to load incidents. Please try again.'
        );

        this.tickets.set([]);

        this.isLoading.set(false);

      }

    });

  }

  // =========================================================
  // SEARCH
  // =========================================================

  onSearchChange(value: string): void {

    this.searchTerm.set(value ?? '');

  }

  // =========================================================
  // FILTER PANEL
  // =========================================================

  toggleFilters(): void {

    this.showFilters.update(
      value => !value
    );

  }

  closeFilters(): void {

    this.showFilters.set(false);

  }

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  clearFilters(): void {

    this.selectedStatus = '';

    this.selectedSeverity = '';

    this.selectedCategory = '';

    this.selectedTeam = '';

  }

  // =========================================================
  // CLEAR EVERYTHING
  // =========================================================

  clearAll(): void {

    this.searchTerm.set('');

    this.clearFilters();

  }

  // =========================================================
  // STATUS CLASS
  // =========================================================

  statusClass(
    status: string | null | undefined
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

  // =========================================================
  // SEVERITY CLASS
  // =========================================================

  severityClass(
    severity: string | null | undefined
  ): string {

    if (!severity) {
      return '';
    }

    return (
      'severity-' +
      severity.toLowerCase()
    );

  }

  // =========================================================
  // SAFE STRING
  // =========================================================

  private safeString(
    value: unknown
  ): string {

    if (
      value === null ||
      value === undefined
    ) {
      return '';
    }

    return String(value);

  }

  // =========================================================
  // NORMALIZE
  // =========================================================

  private normalize(
    value: unknown
  ): string {

    return this.safeString(value)
      .trim()
      .toLowerCase();

  }

}