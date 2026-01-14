import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jest.Mocked<Router>;

  beforeEach(() => {
    routerSpy = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login successfully', () => {
    const mockResponse = {
      accessToken: 'test-token',
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin' as const,
        organizationId: 'org-1',
      },
    };

    service.login('test@example.com', 'password').subscribe((response) => {
      expect(response).toEqual(mockResponse);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.user()?.email).toBe('test@example.com');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should logout and clear state', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@example.com' }));

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should correctly identify admin users', () => {
    const mockResponse = {
      accessToken: 'test-token',
      user: {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin' as const,
        organizationId: 'org-1',
      },
    };

    service.login('admin@example.com', 'password').subscribe(() => {
      expect(service.isAdmin()).toBe(true);
      expect(service.isOwner()).toBe(false);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(mockResponse);
  });
});
