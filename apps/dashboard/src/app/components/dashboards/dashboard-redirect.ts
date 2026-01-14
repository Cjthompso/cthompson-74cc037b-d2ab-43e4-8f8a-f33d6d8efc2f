import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard-redirect',
  standalone: true,
  template: `<div class="min-h-screen flex items-center justify-center"><p>Redirecting...</p></div>`
})
export class DashboardRedirectComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const role = this.authService.currentUser()?.role;

    switch (role) {
      case 'owner':
        this.router.navigate(['/owner-dashboard']);
        break;
      case 'admin':
        this.router.navigate(['/admin-dashboard']);
        break;
      default:
        this.router.navigate(['/viewer-dashboard']);
    }
  }
}