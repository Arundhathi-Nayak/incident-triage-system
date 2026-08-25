import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CreateCommentRequest,
  TicketComment,
  UpdateCommentRequest,
  CommentPage
} from '../models/TicketComment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  private readonly baseUrl =
    'http://localhost:5155/api/tickets';

  constructor(
    private http: HttpClient
  ) {}

  // =====================================================
  // GET COMMENTS
  // =====================================================

  getForTicket(
    incidentId: string,
    skip: number = 0,
    take: number = 5
  ): Observable<CommentPage> {

    const params = new HttpParams()
      .set('skip', skip)
      .set('take', take);

    return this.http.get<CommentPage>(
      `${this.baseUrl}/${incidentId}/comments`,
      { params }
    );
  }


  // =====================================================
  // CREATE COMMENT
  // =====================================================

  create(
    incidentId: string,
    comment: CreateCommentRequest
  ): Observable<TicketComment> {

    return this.http.post<TicketComment>(
      `${this.baseUrl}/${incidentId}/comments`,
      comment
    );
  }


  // =====================================================
  // UPDATE COMMENT
  // =====================================================

  update(
    incidentId: string,
    commentId: number,
    comment: UpdateCommentRequest
  ): Observable<TicketComment> {

    return this.http.put<TicketComment>(
      `${this.baseUrl}/${incidentId}/comments/${commentId}`,
      comment
    );
  }


  // =====================================================
  // DELETE COMMENT
  // =====================================================

  delete(
    incidentId: string,
    commentId: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.baseUrl}/${incidentId}/comments/${commentId}`
    );
  }
}