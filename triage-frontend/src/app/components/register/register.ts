import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegisterRequest } from '../../models/auth.models';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';

@Component({
  imports: [
    CommonModule,
    FormsModule
  ],
  standalone: true,
  selector: 'app-register',
  styleUrl: './register.scss',
  templateUrl: './register.html',
})
export class Register {

 registerRequest: RegisterRequest = {
    displayName: '',
    email: '',
    password: ''
  };

  confirmPassword = '';

  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register(): void {

    this.errorMessage = '';

    if (!this.registerRequest.displayName.trim()) {
      this.errorMessage = 'Display name is required.';
      return;
    }

    if (!this.registerRequest.email.trim()) {
      this.errorMessage = 'Email is required.';
      return;
    }

    if (!this.registerRequest.password) {
      this.errorMessage = 'Password is required.';
      return;
    }

    if (this.registerRequest.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;

    this.authService
      .register(this.registerRequest)
      .subscribe({
        next: () => {
          this.isLoading = false;

          this.router.navigate(['/']);
        },

        error: error => {
          this.isLoading = false;

          if (error.error) {
            if (typeof error.error === 'string') {
              this.errorMessage = error.error;
            }
            else if (error.error.errors) {
              const errors = error.error.errors;

              this.errorMessage = Object.values(errors)
                .flat()
                .join(' ');
            }
            else {
              this.errorMessage =
                'Registration failed. Please check your details.';
            }
          }
          else {
            this.errorMessage =
              'Unable to connect to the server.';
          }
        }
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

}
