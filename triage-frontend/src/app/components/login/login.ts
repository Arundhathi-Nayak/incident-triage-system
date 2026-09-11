import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginRequest } from '../../models/auth.models';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';

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
    private router: Router
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
      .subscribe({
        next: () => {
          this.isLoading = false;

          this.router.navigate(['/']);
        },

        error: error => {
          this.isLoading = false;

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
        }
      });
  }
 goToRegister(): void {
    this.router.navigate(['/register']);
  }


}
