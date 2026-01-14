import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TasksService } from '../../services/tasks.service';

@Component({
  selector: 'app-viewer-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <header class="bg-gray-600 text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold">Viewer Dashboard</h1>
            <p class="text-gray-300">Read Only • {{ user()?.email }}</p>
          </div>
          <button (click)="logout()" class="px-4 py-2 bg-gray-800 rounded hover:bg-gray-900">Logout</button>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 py-6">
        <div class="grid grid-cols-4 gap-4 mb-6">
          <div class="p-4 bg-white rounded-lg shadow">
            <h3 class="text-gray-500 text-sm">Total Tasks</h3>
            <p class="text-3xl font-bold">{{ tasks().length }}</p>
          </div>
          <div class="p-4 bg-white rounded-lg shadow">
            <h3 class="text-gray-500 text-sm">To Do</h3>
            <p class="text-3xl font-bold text-yellow-500">{{ tasksByStatus('todo') }}</p>
          </div>
          <div class="p-4 bg-white rounded-lg shadow">
            <h3 class="text-gray-500 text-sm">In Progress</h3>
            <p class="text-3xl font-bold text-blue-500">{{ tasksByStatus('in_progress') }}</p>
          </div>
          <div class="p-4 bg-white rounded-lg shadow">
            <h3 class="text-gray-500 text-sm">Done</h3>
            <p class="text-3xl font-bold text-green-500">{{ tasksByStatus('done') }}</p>
          </div>
        </div>

        <div class="flex gap-2 mb-6 border-b border-gray-300">
          <button class="px-4 py-2 font-medium border-b-2 border-gray-500 text-gray-600">
           Tasks
          </button>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-gray-200 rounded-lg p-4">
            <h3 class="font-bold mb-4"><span class="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>To Do ({{ getTasksByStatus('todo').length }})</h3>
            <div class="space-y-3">
              <div *ngFor="let task of getTasksByStatus('todo')" class="bg-white p-4 rounded shadow">
                <div class="flex justify-between items-start">
                  <h4 class="font-semibold">{{ task.title }}</h4>
                  <span class="text-xs px-2 py-1 rounded" [class]="getCategoryClass(task.category)">{{ task.category }}</span>
                </div>
                <p *ngIf="task.description" class="text-sm text-gray-600 mt-2">{{ task.description }}</p>
              </div>
              <div *ngIf="getTasksByStatus('todo').length === 0" class="text-center py-8 text-gray-400">No tasks</div>
            </div>
          </div>
          <div class="bg-gray-200 rounded-lg p-4">
            <h3 class="font-bold mb-4"><span class="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>In Progress ({{ getTasksByStatus('in_progress').length }})</h3>
            <div class="space-y-3">
              <div *ngFor="let task of getTasksByStatus('in_progress')" class="bg-white p-4 rounded shadow">
                <div class="flex justify-between items-start">
                  <h4 class="font-semibold">{{ task.title }}</h4>
                  <span class="text-xs px-2 py-1 rounded" [class]="getCategoryClass(task.category)">{{ task.category }}</span>
                </div>
                <p *ngIf="task.description" class="text-sm text-gray-600 mt-2">{{ task.description }}</p>
              </div>
              <div *ngIf="getTasksByStatus('in_progress').length === 0" class="text-center py-8 text-gray-400">No tasks</div>
            </div>
          </div>


          <div class="bg-gray-200 rounded-lg p-4">
            <h3 class="font-bold mb-4"><span class="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>Done ({{ getTasksByStatus('done').length }})</h3>
            <div class="space-y-3">
              <div *ngFor="let task of getTasksByStatus('done')" class="bg-white p-4 rounded shadow">
                <div class="flex justify-between items-start">
                  <h4 class="font-semibold line-through opacity-75">{{ task.title }}</h4>
                  <span class="text-xs px-2 py-1 rounded" [class]="getCategoryClass(task.category)">{{ task.category }}</span>
                </div>
                <p *ngIf="task.description" class="text-sm text-gray-600 mt-2 line-through opacity-75">{{ task.description }}</p>
              </div>
              <div *ngIf="getTasksByStatus('done').length === 0" class="text-center py-8 text-gray-400">No tasks</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class ViewerDashboardComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private tasksService: TasksService,
    private router: Router
  ) {}

  user = this.authService.user;
  tasks = signal<any[]>([]);

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.tasksService.getTasks().subscribe(tasks => this.tasks.set(tasks));
  }

  tasksByStatus(status: string) {
    return this.tasks().filter(t => t.status === status).length;
  }

  getTasksByStatus(status: string) {
    return this.tasks().filter(t => t.status === status);
  }

  getCategoryClass(category: string) {
    switch (category) {
      case 'work': return 'bg-blue-100 text-blue-800';
      case 'personal': return 'bg-green-100 text-green-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}