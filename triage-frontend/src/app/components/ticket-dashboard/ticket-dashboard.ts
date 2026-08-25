import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  computed,
  signal
} from '@angular/core';
import {
  FormsModule
} from '@angular/forms';
import {
  RouterLink
} from '@angular/router';
import {
  Subject,
  Subscription,
  debounceTime,
  distinctUntilChanged
} from 'rxjs';

import {
  PagedResult,
  TicketListItem,
  TicketOptions,
  TicketQuery,
  TicketStatistics
} from '../../models/ticket';

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
export class TicketDashboard implements OnInit, OnDestroy {

  // =========================================================
  // DATA
  // =========================================================

  readonly Math = Math;

  tickets = signal<TicketListItem[]>([]);

  isLoading = signal<boolean>(true);

  errorMessage = signal<string>('');

  // =========================================================
  // SERVER PAGINATION
  // =========================================================

  currentPage = signal<number>(1);

  pageSize = signal<number>(10);

  totalCount = signal<number>(0);

  totalPages = signal<number>(0);

  // =========================================================
  // SEARCH
  // =========================================================

  searchTerm = signal<string>('');

  private searchSubject =
    new Subject<string>();

  private searchSubscription?: Subscription;

  // =========================================================
  // FILTER PANEL
  // =========================================================

  showFilters = signal<boolean>(false);

  selectedStatus = '';

  selectedSeverity = '';

  selectedCategory = '';

  selectedTeam = '';

  // =========================================================
  // OPTIONS
  // =========================================================

  statuses: string[] = [];

  severities: string[] = [];

  categories = signal<string[]>([]);

  teams = signal<string[]>([]);

  // =========================================================
  // SORTING
  // =========================================================

  sortBy = signal<string>('createdAt');

  sortDirection = signal<'asc' | 'desc'>('desc');

  // =========================================================
  // STATISTICS
  // =========================================================

  statistics = signal<TicketStatistics>({
    total: 0,

    new: 0,
    assigned: 0,
    userPending: 0,
    resolved: 0,

    p1: 0,
    p2: 0,
    p3: 0,
    p4: 0,

    byCategory: {},
    byTeam: {}
  });

  // =========================================================
  // STATISTICS COMPUTED VALUES
  // =========================================================

  totalTickets = computed(() =>
    this.statistics().total
  );

  resolvedTickets = computed(() =>
    this.statistics().resolved
  );

  openTickets = computed(() =>
    this.statistics().new
  );

  inProgressTickets = computed(() =>
    this.statistics().assigned +
    this.statistics().userPending
  );

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
  // PAGINATION DISPLAY
  // =========================================================

  pageNumbers = computed(() => {

    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 7) {
      return Array.from(
        { length: total },
        (_, index) => index + 1
      );
    }

    const pages: number[] = [];

    pages.push(1);

    if (current > 4) {
      pages.push(-1);
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    if (current < total - 3) {
      pages.push(-1);
    }

    pages.push(total);

    return pages;
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

    this.setupSearch();

    this.loadOptions();

    this.loadStatistics();

    this.loadTickets();
  }

  // =========================================================
  // DESTROY
  // =========================================================

  ngOnDestroy(): void {

    this.searchSubscription?.unsubscribe();

    this.searchSubject.complete();
  }

  // =========================================================
  // SEARCH SETUP
  // =========================================================

  private setupSearch(): void {

    this.searchSubscription =
      this.searchSubject
        .pipe(
          debounceTime(400),
          distinctUntilChanged()
        )
        .subscribe(search => {

          this.searchTerm.set(search);

          this.currentPage.set(1);

          this.loadTickets();

        });
  }

  // =========================================================
  // LOAD OPTIONS
  // =========================================================

  loadOptions(): void {

    this.ticketService
      .getOptions()
      .subscribe({

        next: (options: TicketOptions) => {

          this.statuses =
            options.statuses ?? [];

          this.severities =
            options.severities ?? [];

          this.categories.set(
            options.categories ?? []
          );

          this.teams.set(
            options.assignedTeams ?? []
          );
        },

        error: error => {

          console.error(
            'Failed to load ticket options:',
            error
          );
        }
      });
  }

  // =========================================================
  // LOAD STATISTICS
  // =========================================================

  loadStatistics(): void {

    this.ticketService
      .getStatistics()
      .subscribe({

        next: statistics => {

          this.statistics.set(
            statistics
          );
        },

        error: error => {

          console.error(
            'Failed to load statistics:',
            error
          );
        }
      });
  }

  // =========================================================
  // LOAD TICKETS
  // =========================================================

  loadTickets(): void {

    this.isLoading.set(true);

    this.errorMessage.set('');

    const query: TicketQuery = {

      page: this.currentPage(),

      pageSize: this.pageSize(),

      search: this.searchTerm(),

      status: this.selectedStatus,

      severity: this.selectedSeverity,

      category: this.selectedCategory,

      assignedTeam: this.selectedTeam,

      sortBy: this.sortBy(),

      sortDirection: this.sortDirection()
    };

    this.ticketService
      .getTickets(query)
      .subscribe({

        next: (
          result: PagedResult<TicketListItem>
        ) => {

          this.tickets.set(
            result.items ?? []
          );

          this.currentPage.set(
            result.page
          );

          this.pageSize.set(
            result.pageSize
          );

          this.totalCount.set(
            result.totalCount
          );

          this.totalPages.set(
            result.totalPages
          );

          this.isLoading.set(false);
        },

        error: error => {

          console.error(
            'Failed to load tickets:',
            error
          );

          this.errorMessage.set(
            'Failed to load incidents. Please try again.'
          );

          this.tickets.set([]);

          this.totalCount.set(0);

          this.totalPages.set(0);

          this.isLoading.set(false);
        }
      });
  }

  // =========================================================
  // SEARCH
  // =========================================================

  onSearchChange(value: string): void {

    this.searchSubject.next(
      value ?? ''
    );
  }

  // =========================================================
  // APPLY FILTERS
  // =========================================================

  applyFilters(): void {

    this.currentPage.set(1);

    this.closeFilters();

    this.loadTickets();
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

    this.currentPage.set(1);

    this.loadTickets();
  }

  // =========================================================
  // CLEAR EVERYTHING
  // =========================================================

  clearAll(): void {

    this.searchTerm.set('');

    this.selectedStatus = '';

    this.selectedSeverity = '';

    this.selectedCategory = '';

    this.selectedTeam = '';

    this.currentPage.set(1);

    this.loadTickets();
  }

  // =========================================================
  // PAGINATION
  // =========================================================

  goToPage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages() ||
      page === this.currentPage()
    ) {
      return;
    }

    this.currentPage.set(page);

    this.loadTickets();
  }

  previousPage(): void {

    this.goToPage(
      this.currentPage() - 1
    );
  }

  nextPage(): void {

    this.goToPage(
      this.currentPage() + 1
    );
  }

  // =========================================================
  // PAGE SIZE
  // =========================================================

  onPageSizeChange(value: string): void {

    const size = Number(value);

    if (!size || size < 1) {
      return;
    }

    this.pageSize.set(size);

    this.currentPage.set(1);

    this.loadTickets();
  }

  // =========================================================
  // SORTING
  // =========================================================

  sort(column: string): void {

    if (this.sortBy() === column) {

      this.sortDirection.set(
        this.sortDirection() === 'asc'
          ? 'desc'
          : 'asc'
      );

    } else {

      this.sortBy.set(column);

      this.sortDirection.set('asc');
    }

    this.currentPage.set(1);

    this.loadTickets();
  }

  // =========================================================
  // SORT ICON
  // =========================================================

  sortIcon(column: string): string {

    if (this.sortBy() !== column) {
      return '↕';
    }

    return this.sortDirection() === 'asc'
      ? '↑'
      : '↓';
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
}