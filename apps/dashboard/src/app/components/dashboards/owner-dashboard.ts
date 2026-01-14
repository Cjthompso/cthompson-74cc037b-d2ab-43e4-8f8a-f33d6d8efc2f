import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TasksService } from '../../services/tasks.service';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <header class="bg-purple-600 text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold">Owner Dashboard</h1>
            <p class="text-purple-200">Full Access • {{ user()?.email }}</p>
          </div>
          <button (click)="logout()" class="px-4 py-2 bg-purple-800 rounded hover:bg-purple-900">Logout</button>
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
          <button (click)="activeTab.set('tasks')" class="px-4 py-2 font-medium"
                  [class]="activeTab() === 'tasks' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-600'">
            Tasks
          </button>
          <button (click)="activeTab.set('audit')" class="px-4 py-2 font-medium"
                  [class]="activeTab() === 'audit' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-600'">
            Audit Log
          </button>
          <button (click)="activeTab.set('users')" class="px-4 py-2 font-medium"
                  [class]="activeTab() === 'users' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-600'">
            Manage Users
          </button>
        </div>
        <div *ngIf="activeTab() === 'tasks'">
          <button (click)="showModal.set(true)" class="mb-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
            Add Task
          </button>

          <div class="grid grid-cols-3 gap-4">
            <div class="bg-gray-200 rounded-lg p-4">
              <h3 class="font-bold mb-4"><span class="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>To Do</h3>
              <div class="space-y-3">
                <div *ngFor="let task of getTasksByStatus('todo')" class="bg-white p-4 rounded shadow">
                  <h4 class="font-semibold">{{ task.title }}</h4>
                  <p class="text-sm text-gray-600">{{ task.description }}</p>
                  <div class="mt-2 flex gap-2">
                    <button (click)="moveTask(task, 'in_progress')" class="text-xs px-2 py-1 bg-blue-500 text-white rounded">Start</button>
                    <button (click)="editTask(task)" class="text-xs px-2 py-1 bg-gray-500 text-white rounded">Edit</button>
                    <button (click)="deleteTask(task)" class="text-xs px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-gray-200 rounded-lg p-4">
              <h3 class="font-bold mb-4"><span class="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>In Progress</h3>
              <div class="space-y-3">
                <div *ngFor="let task of getTasksByStatus('in_progress')" class="bg-white p-4 rounded shadow">
                  <h4 class="font-semibold">{{ task.title }}</h4>
                  <p class="text-sm text-gray-600">{{ task.description }}</p>
                  <div class="mt-2 flex gap-2">
                    <button (click)="moveTask(task, 'todo')" class="text-xs px-2 py-1 bg-yellow-500 text-white rounded">Back</button>
                    <button (click)="moveTask(task, 'done')" class="text-xs px-2 py-1 bg-green-500 text-white rounded">Done</button>
                    <button (click)="deleteTask(task)" class="text-xs px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-gray-200 rounded-lg p-4">
              <h3 class="font-bold mb-4"><span class="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>Done</h3>
              <div class="space-y-3">
                <div *ngFor="let task of getTasksByStatus('done')" class="bg-white p-4 rounded shadow">
                  <h4 class="font-semibold line-through opacity-75">{{ task.title }}</h4>
                  <div class="mt-2 flex gap-2">
                    <button (click)="moveTask(task, 'in_progress')" class="text-xs px-2 py-1 bg-blue-500 text-white rounded">Reopen</button>
                    <button (click)="deleteTask(task)" class="text-xs px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="activeTab() === 'audit'">
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-semibold">Timestamp</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold">Action</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold">Resource</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold">User</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let log of auditLogs()" class="border-t">
                  <td class="px-4 py-3 text-sm">{{ log.timestamp | date:'short' }}</td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-1 rounded text-xs" 
                          [class]="log.action === 'CREATE' ? 'bg-green-100 text-green-800' : log.action === 'DELETE' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'">
                      {{ log.action }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm">{{ log.resource }}</td>
                  <td class="px-4 py-3 text-sm">{{ log.userEmail }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ log.details || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div *ngIf="activeTab() === 'users'">
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-semibold">Name</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold">Role</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let u of users()" class="border-t">
                  <td class="px-4 py-3">{{ u.name }}</td>
                  <td class="px-4 py-3 text-sm">{{ u.email }}</td>
                  <td class="px-4 py-3">
                    <select [(ngModel)]="u.role" (change)="updateUserRole(u)" [disabled]="u.email === user()?.email"
                            class="px-2 py-1 rounded border">
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td class="px-4 py-3">
                    <span *ngIf="u.email === user()?.email" class="text-gray-500">(You)</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <div *ngIf="showModal()" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" (click)="closeModal()">
        <div class="bg-white rounded-lg p-6 w-full max-w-md" (click)="$event.stopPropagation()">
          <h2 class="text-xl font-bold mb-4">{{ editingTask() ? 'Edit Task' : 'Create Task' }}</h2>
          <div class="space-y-4">
            <input [(ngModel)]="taskForm.title" placeholder="Title" class="w-full px-3 py-2 border rounded">
            <textarea [(ngModel)]="taskForm.description" placeholder="Description" class="w-full px-3 py-2 border rounded"></textarea>
            <select [(ngModel)]="taskForm.category" class="w-full px-3 py-2 border rounded">
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="urgent">Urgent</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button (click)="closeModal()" class="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button (click)="saveTask()" class="px-4 py-2 bg-purple-500 text-white rounded">Save</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OwnerDashboardComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private tasksService: TasksService,
    private router: Router
  ) {}

  user = this.authService.user;
  activeTab = signal<'tasks' | 'audit' | 'users'>('tasks');
  showModal = signal(false);
  editingTask = signal<any>(null);
  tasks = signal<any[]>([]);
  auditLogs = signal<any[]>([]);
  users = signal<any[]>([]);
  taskForm = { 
  title: '', 
  description: '', 
  category: 'work' as 'work' | 'personal' | 'urgent' | 'other', 
  status: 'todo' as 'todo' | 'in_progress' | 'done' 
};

  ngOnInit() {
    this.loadTasks();
    this.loadAuditLogs();
    this.loadUsers();
  }

  loadTasks() {
    this.tasksService.getTasks().subscribe(tasks => this.tasks.set(tasks));
  }

  loadAuditLogs() {
    this.tasksService.getAuditLogs().subscribe(logs => this.auditLogs.set(logs));
  }

  loadUsers() {
    this.tasksService.getUsers().subscribe(users => this.users.set(users));
  }

  tasksByStatus(status: 'todo' | 'in_progress' | 'done') {
    return this.tasks().filter(t => t.status === status).length;
  }

  getTasksByStatus(status: 'todo' | 'in_progress' | 'done') {
    return this.tasks().filter(t => t.status === status);
  }

 moveTask(task: any, status: 'todo' | 'in_progress' | 'done') {
    this.tasksService.updateTask(task.id, { status }).subscribe(() => {
      this.loadTasks();
      this.loadAuditLogs();
    });
  }

  editTask(task: any) {
    this.editingTask.set(task);
    this.taskForm = { title: task.title, description: task.description || '', category: task.category as 'work' | 'personal' | 'urgent' | 'other', status: task.status as 'todo' | 'in_progress' | 'done' };
    this.showModal.set(true);
  }

  deleteTask(task: any) {
    if (confirm('Delete this task?')) {
      this.tasksService.deleteTask(task.id).subscribe(() => {
        this.loadTasks();
        this.loadAuditLogs();
      });
    }
  }

  saveTask() {
    if (this.editingTask()) {
      this.tasksService.updateTask(this.editingTask().id, this.taskForm).subscribe(() => {
        this.loadTasks();
        this.loadAuditLogs();
        this.closeModal();
      });
    } else {
      this.tasksService.createTask(this.taskForm).subscribe(() => {
        this.loadTasks();
        this.loadAuditLogs();
        this.closeModal();
      });
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.editingTask.set(null);
    this.taskForm = { title: '', description: '', category: 'work' as 'work' | 'personal' | 'urgent' | 'other', status: 'todo' as 'todo' | 'in_progress' | 'done' };
  }

  updateUserRole(user: any) {
    this.tasksService.updateUserRole(user.id, user.role).subscribe(() => this.loadAuditLogs());
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}