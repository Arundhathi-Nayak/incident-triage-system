import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateTicketRequest,
  PagedResult,
  ResolveTicketRequest,
  Ticket,
  TicketListItem,
  TicketQuery,
  TicketStatistics,
  TicketOptions,
  UpdateResolutionRequest,
  UpdateTicketRequest
} from '../models/ticket';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private readonly baseUrl =
    'http://localhost:5155/api/Tickets';

  constructor(private http: HttpClient) {}

  getTickets(
    query: TicketQuery = {}
  ): Observable<PagedResult<TicketListItem>> {

    let params = new HttpParams();

    if (query.page != null) {
      params = params.set('page', query.page);
    }

    if (query.pageSize != null) {
      params = params.set('pageSize', query.pageSize);
    }

    if (query.search?.trim()) {
      params = params.set(
        'search',
        query.search.trim()
      );
    }

    if (query.status) {
      params = params.set(
        'status',
        query.status
      );
    }

    if (query.severity) {
      params = params.set(
        'severity',
        query.severity
      );
    }

    if (query.category) {
      params = params.set(
        'category',
        query.category
      );
    }

    if (query.assignedTeam) {
      params = params.set(
        'assignedTeam',
        query.assignedTeam
      );
    }

    if (query.sortBy) {
      params = params.set(
        'sortBy',
        query.sortBy
      );
    }

    if (query.sortDirection) {
      params = params.set(
        'sortDirection',
        query.sortDirection
      );
    }

    return this.http.get<
      PagedResult<TicketListItem>
    >(this.baseUrl, { params });
  }

  getById(
    incidentId: string
  ): Observable<Ticket> {

    return this.http.get<Ticket>(
      `${this.baseUrl}/${incidentId}`
    );
  }

  create(
    ticket: CreateTicketRequest
  ): Observable<Ticket> {

    return this.http.post<Ticket>(
      this.baseUrl,
      ticket
    );
  }

  update(
    incidentId: string,
    ticket: UpdateTicketRequest
  ): Observable<void> {

    return this.http.put<void>(
      `${this.baseUrl}/${incidentId}`,
      ticket
    );
  }

  resolve(
    incidentId: string,
    request: ResolveTicketRequest
  ): Observable<Ticket> {

    return this.http.post<Ticket>(
      `${this.baseUrl}/${incidentId}/resolve`,
      request
    );
  }

  updateResolution(
    incidentId: string,
    request: UpdateResolutionRequest
  ): Observable<Ticket> {

    return this.http.put<Ticket>(
      `${this.baseUrl}/${incidentId}/resolution`,
      request
    );
  }

  delete(
    incidentId: string
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.baseUrl}/${incidentId}`
    );
  }

  getStatistics(): Observable<TicketStatistics> {

    return this.http.get<TicketStatistics>(
      `${this.baseUrl}/statistics`
    );
  }

  getOptions(): Observable<TicketOptions> {

    return this.http.get<TicketOptions>(
      'http://localhost:5155/api/Options'
    );
  }
}