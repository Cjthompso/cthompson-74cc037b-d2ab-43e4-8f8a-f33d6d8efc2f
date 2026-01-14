import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';

const environment = {
  apiUrl: 'http://localhost:3000/api'
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'viewer';
  organizationId: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  
  private userSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);
  
  user = computed(() => this.userSignal());
  token = computed(() => this.tokenSignal());
  isAuthenticated = computed(() => !!this.tokenSignal());
  isOwner = computed(() => this.userSignal()?.role === 'owner');
  isAdmin = computed(() => ['owner', 'admin'].includes(this.userSignal()?.role || ''));

  constructor(private http: HttpClient, private router: Router) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        this.tokenSignal.set(token);
        this.userSignal.set(JSON.parse(userStr));
      } catch {
        this.clearStorage();
      }
    }
  }

  private saveToStorage(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  private clearStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          this.tokenSignal.set(response.accessToken);
          this.userSignal.set(response.user);
          this.saveToStorage(response.accessToken, response.user);
        }),
        catchError((error) => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  register(email: string, password: string, name: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/register`, { email, password, name })
      .pipe(
        tap((response) => {
          this.tokenSignal.set(response.accessToken);
          this.userSignal.set(response.user);
          this.saveToStorage(response.accessToken, response.user);
        }),
        catchError((error) => {
          console.error('Register error:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.clearStorage();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  currentUser(): User | null {
    return this.userSignal();
  }
}