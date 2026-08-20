import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateCommentRequest, TicketComment } from '../models/TicketComment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly baseUrl = 'http://localhost:5155/api/tickets';

  constructor(private http: HttpClient) {}

  getForTicket(incidentId: string): Observable<TicketComment[]> {
    return this.http.get<TicketComment []>(`${this.baseUrl}/${incidentId}/comments`);
  }

  create(incidentId: string, comment: CreateCommentRequest): Observable<TicketComment > {
    return this.http.post<TicketComment >(`${this.baseUrl}/${incidentId}/comments`, comment);
  }
}