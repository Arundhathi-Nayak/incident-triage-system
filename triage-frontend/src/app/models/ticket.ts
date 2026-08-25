export interface Ticket {
  id: number;
  incidentId: string;
  title: string;
  description: string;
  category: string | null;
  severity: string | null;
  status: string;
  assignedTeam: string | null;
  createdBy: string;
  createdAt: string;
  resolvedAt: string | null;
  resolution: string | null;
  rootCauseCategory: string | null;
  rootCause: string | null;
  summary: string | null;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  createdBy: string;
}

export interface UpdateTicketRequest {
  title: string;
  description: string;
  category: string | null;
  severity: string | null;
  status: string;
  assignedTeam: string | null;
}

export interface ResolveTicketRequest {
  rootCauseCategory: string;
  rootCause: string;
  resolution: string;
}

export interface UpdateResolutionRequest {
  rootCauseCategory: string;
  rootCause: string;
  resolution: string;
}

export interface TicketQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  severity?: string;
  category?: string;
  assignedTeam?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface TicketListItem {
  incidentId: string;
  title: string;
  category: string | null;
  severity: string | null;
  status: string;
  assignedTeam: string | null;
  createdBy: string;
  createdAt: string;
  resolvedAt: string | null;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface TicketStatistics {
  total: number;

  new: number;
  assigned: number;
  userPending: number;
  resolved: number;

  p1: number;
  p2: number;
  p3: number;
  p4: number;

  byCategory: Record<string, number>;
  byTeam: Record<string, number>;
}

export interface TicketOptions {
  categories: string[];
  severities: string[];
  statuses: string[];
  assignedTeams: string[];
  rootCauseCategories: string[];
}