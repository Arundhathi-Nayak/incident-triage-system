import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginRequest } from '../../../models/auth.models';
import { AuthService } from '../../../services/auth-service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {

  loginRequest: LoginRequest = {
    email: '',
    password: ''
  };

  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  login(): void {

    this.errorMessage = '';

    if (!this.loginRequest.email.trim()) {
      this.errorMessage = 'Email is required.';
      return;
    }

    if (!this.loginRequest.password) {
      this.errorMessage = 'Password is required.';
      return;
    }

    this.isLoading = true;

    this.authService
      .login(this.loginRequest)
      .pipe(
        finalize(() => {
          this.isLoading = false;

          // Force Angular to update the UI
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: () => {

          this.router.navigate(['/']);

        },

        error: error => {

          console.log('Login error:', error);
          console.log('Status:', error.status);

          if (error.status === 401) {

            this.errorMessage =
              'Invalid email or password.';

          }
          else if (error.error) {

            this.errorMessage =
              typeof error.error === 'string'
                ? error.error
                : 'Login failed. Please try again.';

          }
          else {

            this.errorMessage =
              'Unable to connect to the server.';

          }

          // Update UI immediately
          this.cdr.detectChanges();
        }

      });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}