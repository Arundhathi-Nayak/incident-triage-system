import { HttpClient } from '@angular/common/http';
import { Injectable, Service } from '@angular/core';
import { AuthResponse, CurrentUser, LoginRequest, RegisterRequest } from '../models/auth.models';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
 private readonly baseUrl =
    'http://localhost:5155/api/auth';

  private readonly tokenKey = 'token';
  private readonly userKey = 'currentUser';

    constructor(
        private http: HttpClient
    ) {}

  login(request: LoginRequest): Observable<AuthResponse> {

    return this.http
      .post<AuthResponse>(
        `${this.baseUrl}/login`,
        request
      )
      .pipe(
        tap(response => {
          this.storeSession(response);
        })
      );
  }

   register(request: RegisterRequest): Observable<AuthResponse> {

    return this.http
      .post<AuthResponse>(
        `${this.baseUrl}/register`,
        request
      )
      .pipe(
        tap((response) => {
          this.storeSession(response);
        })
      );
  }

   logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

   getToken(): string | null {
    return localStorage.getItem(
      this.tokenKey
    );
  }

  getCurrentUser(): CurrentUser | null {

    const value =
      localStorage.getItem(this.userKey);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as CurrentUser;
    }
    catch {
      return null;
    }
  }
  getRoles(): string[] {

    return this
      .getCurrentUser()
      ?.roles ?? [];
  }

  hasRole(role: string): boolean {

    return this
      .getRoles()
      .includes(role);
  }

  isLoggedIn(): boolean {

    return !!this.getToken();
  }

private storeSession(
    response: AuthResponse
  ): void {

    localStorage.setItem(
      this.tokenKey,
      response.token
    );

    const currentUser: CurrentUser = {
      userId: response.userId,
      displayName: response.displayName,
      email: response.email,
      roles: response.roles
    };

    localStorage.setItem(
      this.userKey,
      JSON.stringify(currentUser)
    );
  }
}
