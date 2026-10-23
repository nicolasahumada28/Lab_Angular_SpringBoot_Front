import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Task } from '../../models/task';
import { isPlatformBrowser } from '@angular/common';
import { TaskApi } from './task-api';
import { catchError, finalize, Observable, tap, throwError, timeout } from 'rxjs';
import { time } from 'node:console';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private readonly storageKey = 'angular-learning-tasks';

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly taskApiService = inject(TaskApi);

  private readonly loadingSignal = signal(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  private readonly creatingSignal = signal(false);
  readonly creating = this.creatingSignal.asReadonly();

  private readonly createErrorSignal = signal<string | null>(null);
  readonly createError = this.createErrorSignal.asReadonly();

  private readonly updatingSignal = signal(false);
  readonly updating = this.updatingSignal.asReadonly();

  private readonly updateErrorSignal = signal<string | null>(null);
  readonly updateError = this.updateErrorSignal.asReadonly();

  private readonly deletingSignal = signal(false);
  readonly deleting = this.deletingSignal.asReadonly();

  private readonly deleteErrorSignal = signal<string | null>(null);
  readonly deleteError = this.deleteErrorSignal.asReadonly();

  private readonly initialTasks: Task[] = [
    {
      id: 1,
      title: 'Estudiar TypeScript',
      completed: true
    },
    {
      id: 2,
      title: 'Estudiar Components',
      completed: false
    },
    {
      id: 3,
      title: 'Estudiar Routing',
      completed: false
    }
  ];

  private readonly tasksSignal = signal<Task[]>(
    this.loadTasks()
  );

  readonly tasks = this.tasksSignal.asReadonly();

  readonly totalTasks = computed(() => this.tasksSignal().length);

  readonly completedTasks = computed(() => this.tasksSignal().filter(task => task.completed).length);

  readonly pendingTasks = computed(() => this.tasksSignal().filter(task => !task.completed).length);

  constructor() {
    effect(() => {
      const tasks = this.tasksSignal();

      if (!this.isBrowser) {
        return;
      }

      localStorage.setItem(
        this.storageKey,
        JSON.stringify(tasks));
    });
  }

  addTask(title: string): Task {
    const newTask: Task = {
      id: this.getNextTaskId(),
      title,
      completed: false
    };

    this.tasksSignal.update(tasks => [...tasks, newTask]);
    return newTask;
  }

    createTaskFromApi(title: string): Observable<Task> {
  const cleanTitle = title.trim();

  this.creatingSignal.set(true);
  this.createErrorSignal.set(null);

  return this.taskApiService
    .createTask({
      title: cleanTitle,
      completed: false
    })
    .pipe(
      timeout(5000),

      tap(createdTask => {
        this.tasksSignal.update(currentTasks => {
          const nextId = currentTasks.length === 0
            ? 1
            : Math.max(
                ...currentTasks.map(task => task.id)
              ) + 1;

          const localTask: Task = {
            ...createdTask,
            id: nextId
          };

          return [
            ...currentTasks,
            localTask
          ];
        });
      }),

      catchError(error => {
        console.error(
          'Error al crear la tarea:',
          error
        );

        this.createErrorSignal.set(
          'No fue posible crear la tarea.'
        );

        return throwError(() => error);
      }),

      finalize(() => {
        this.creatingSignal.set(false);
      })
    );
}

completeTaskFromApi(id: number): Observable<Task> {

  this.updatingSignal.set(true);
  this.updateErrorSignal.set(null);

  return this.taskApiService
    .updateTask(id, 
      {
        completed: true
      })
      .pipe(
        timeout(5000),
        tap(() => {
          this.tasksSignal.update(tasks =>
            tasks.map(task =>
              task.id === id
              ? {
                ...task,
                completed: true
              }
              : task
            )
          );
        }),
        
        catchError(error => {
          console.error('Error al actualizar la tarea: ', error);
          this.updateErrorSignal.set('No fue posible actualizar la tarea.');
          return throwError(() => error);
        }),
        finalize(() => {
          this.updatingSignal.set(false);
        })
      );
}

deleteTaskFromApi(id: number): Observable<void> {
  this.deletingSignal.set(true);
  this.deleteErrorSignal.set(null);

  return this.taskApiService
    .deleteTask(id)
    .pipe(
      timeout(5000),
      tap(() => {
        this.tasksSignal.update(tasks => 
          tasks.filter(task => task.id !== id)
        );
      }),
      catchError(error => {
        console.error('Error al eliminar la tarea: ',error);
        this.deleteErrorSignal.set('No fue posible eliminar la tarea.');

        return throwError(() => error);
      }),
      finalize(() => {
        this.deletingSignal.set(false);
      })
    );
  }


  completeTask(id: number): void {
    this.tasksSignal.update(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, completed: true } : task));
  }

  deleteTask(id: number): void {
    this.tasksSignal.update(tasks => tasks.filter(task => task.id !== id));
  }

  private getNextTaskId(): number {

    const tasks = this.tasksSignal();

    if (tasks.length === 0) {
      return 1;
    }

    return Math.max(...tasks.map(task => task.id)) + 1;
  }

  getTaskById(id: number): Task | undefined {
    return this.tasksSignal().find(task => task.id === id);
  }

  private loadTasks(): Task[] {

    if (!this.isBrowser) {
      return this.copyInitialTasks();
    }

    const storeTasks = localStorage.getItem(this.storageKey);

    if (!storeTasks) {
      return this.copyInitialTasks();
    }

    try {
      const parsedTasks: unknown = JSON.parse(storeTasks);

      if (!Array.isArray(parsedTasks)) {
        return this.copyInitialTasks();
      }

      return parsedTasks as Task[];
    } catch {
      return this.copyInitialTasks();
    }
  }

  private copyInitialTasks(): Task[] {
    return this.initialTasks.map(task => ({ ...task }));
  }

  loadTasksFromApi(): void {

    if(!this.isBrowser) {
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.taskApiService.getTasks().pipe(
      timeout(5000),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    ).subscribe({
      next: tasks => {
        this.tasksSignal.set(tasks);
      },
      error: error => {
        console.error('Error al cargar las tareas: ', error);
        this.errorSignal.set('No fue posible cargar las tareas.');
      }
    });
  }
}