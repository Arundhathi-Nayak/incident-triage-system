import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  UserSummary,
  ChangeUserRoleRequest
} from '../models/admin-user';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {

  private readonly apiUrl =
    'http://localhost:5155/api/admin/users';

  constructor(
    private http: HttpClient
  ) {}

  getUsers(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(
      this.apiUrl
    );
  }

  changeRole(
    userId: string,
    role: string
  ): Observable<void> {

    const request: ChangeUserRoleRequest = {
      role
    };

    return this.http.put<void>(
      `${this.apiUrl}/${userId}/role`,
      request
    );
  }
}