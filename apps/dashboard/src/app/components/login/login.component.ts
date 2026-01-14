import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800">
            {{ isLogin() ? 'Welcome Back' : 'Create Account' }}
          </h1>
          <p class="text-gray-600 mt-2">
            {{ isLogin() ? 'Sign in to manage your tasks' : 'Sign up to get started' }}
          </p>
        </div>

        @if (error()) {
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {{ error() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="space-y-6">
          @if (!isLogin()) {
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input type="text" [(ngModel)]="name" name="name" required
                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name" />
            </div>
          }

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" [(ngModel)]="email" name="email" required
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input type="password" [(ngModel)]="password" name="password" required minlength="6"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password" />
          </div>

          <button type="submit" [disabled]="loading()"
            class="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:opacity-90 disabled:opacity-50">
            @if (loading()) {
              Processing...
            } @else {
              {{ isLogin() ? 'Sign In' : 'Create Account' }}
            }
          </button>
        </form>

        <div class="mt-6 text-center">
          <button (click)="toggleMode()" class="text-blue-500 hover:text-blue-700 font-medium">
            {{ isLogin() ? "Don't have an account? Sign up" : 'Already have an account? Sign in' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  name = '';
  
  isLogin = signal(true);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleMode(): void {
    this.isLogin.update((v) => !v);
    this.error.set(null);
  }

  onSubmit(): void {
    this.loading.set(true);
    this.error.set(null);

    const request = this.isLogin()
      ? this.authService.login(this.email, this.password)
      : this.authService.register(this.email, this.password, this.name);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.redirectByEmail();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Authentication failed');
      },
    });
  }

  redirectByEmail(): void {
    if (this.email === 'owner@test.com') {
      this.router.navigate(['/owner-dashboard']);
    } else if (this.email === 'admin@test.com') {
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.router.navigate(['/viewer-dashboard']);
    }
  }
}
