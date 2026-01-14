import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskCategory = 'work' | 'personal' | 'urgent' | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  category: TaskCategory;
  order: number;
  userId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  category?: TaskCategory;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  category?: TaskCategory;
  order?: number;
}

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private readonly API_URL = `${environment.apiUrl}/tasks`;

  private tasksSignal = signal<Task[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  private filterSignal = signal<{ status?: TaskStatus; category?: TaskCategory }>({});
  private sortBySignal = signal<'order' | 'createdAt' | 'title'>('order');

  tasks = computed(() => this.tasksSignal());
  loading = computed(() => this.loadingSignal());
  error = computed(() => this.errorSignal());


  filteredTasks = computed(() => {
    let result = [...this.tasksSignal()];
    const filter = this.filterSignal();

    if (filter.status) {
      result = result.filter((t) => t.status === filter.status);
    }
    if (filter.category) {
      result = result.filter((t) => t.category === filter.category);
    }

    const sortBy = this.sortBySignal();
    result.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return a.order - b.order;
    });

    return result;
  });


  todoTasks = computed(() => this.filteredTasks().filter((t) => t.status === 'todo'));
  inProgressTasks = computed(() => this.filteredTasks().filter((t) => t.status === 'in_progress'));
  doneTasks = computed(() => this.filteredTasks().filter((t) => t.status === 'done'));
  stats = computed(() => {
    const tasks = this.tasksSignal();
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
      completionRate: tasks.length > 0 
        ? Math.round((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100)
        : 0,
    };
  });

  constructor(private http: HttpClient) {}

  setFilter(filter: { status?: TaskStatus; category?: TaskCategory }): void {
    this.filterSignal.set(filter);
  }

  setSortBy(sortBy: 'order' | 'createdAt' | 'title'): void {
    this.sortBySignal.set(sortBy);
  }

  loadTasks(): Observable<Task[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<Task[]>(this.API_URL).pipe(
      tap((tasks) => {
        this.tasksSignal.set(tasks);
        this.loadingSignal.set(false);
      }),
      catchError((error) => {
        this.errorSignal.set('Failed to load tasks');
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  createTask(dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.API_URL, dto).pipe(
      tap((task) => {
        this.tasksSignal.update((tasks) => [...tasks, task]);
      }),
      catchError((error) => {
        this.errorSignal.set('Failed to create task');
        return throwError(() => error);
      })
    );
  }

  updateTask(id: string, dto: UpdateTaskDto): Observable<Task> {
    return this.http.put<Task>(`${this.API_URL}/${id}`, dto).pipe(
      tap((updatedTask) => {
        this.tasksSignal.update((tasks) =>
          tasks.map((t) => (t.id === id ? updatedTask : t))
        );
      }),
      catchError((error) => {
        this.errorSignal.set('Failed to update task');
        return throwError(() => error);
      })
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.tasksSignal.update((tasks) => tasks.filter((t) => t.id !== id));
      }),
      catchError((error) => {
        this.errorSignal.set('Failed to delete task');
        return throwError(() => error);
      })
    );
  }

  updateTaskOrder(taskId: string, newStatus: TaskStatus, newOrder: number): void {
    this.tasksSignal.update((tasks) =>
      tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus, order: newOrder } : t
      )
    );

    this.updateTask(taskId, { status: newStatus, order: newOrder }).subscribe();
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.API_URL);
  }

  getAuditLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/audit-log`);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/users`);
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/users/${userId}/role`, { role });
  }
}