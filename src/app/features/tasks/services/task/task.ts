import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { CreateTaskRequest, PatchTaskRequest, Task, UpdateTaskRequest } from '../../models/task';
import { isPlatformBrowser } from '@angular/common';
import { TaskApi } from './task-api';
import { catchError, finalize, Observable, tap, throwError, timeout } from 'rxjs';
import { time } from 'node:console';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../../models/api-error';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private readonly storageKey = 'angular-learning-tasks';

  //private readonly platformId = inject(PLATFORM_ID);
  //private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly loadingSignal = signal(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  private readonly fieldErrorsSignal = signal<Record<string, string>>({});
  readonly fieldErrors = this.fieldErrorsSignal.asReadonly();

  private readonly creatingSignal = signal(false);
  readonly creating = this.creatingSignal.asReadonly();

  private readonly createErrorSignal = signal<string | null>(null);
  readonly createError = this.createErrorSignal.asReadonly();

  private readonly updatingSignal = signal(false);
  readonly updating = this.updatingSignal.asReadonly();

  private readonly patchingSignal = signal(false);
  readonly patching = this.patchingSignal.asReadonly();

  private readonly updateErrorSignal = signal<string | null>(null);
  readonly updateError = this.updateErrorSignal.asReadonly();

  private readonly patchingErrorSignal = signal<string | null>(null);
  readonly patchingError = this.patchingErrorSignal.asReadonly();

  private readonly deletingTaskIdSignal = signal<number | null>(null);
  readonly deletingTaskId = this.deletingTaskIdSignal.asReadonly();

  private readonly deletingSignal = signal(false);
  readonly deleting = this.deletingSignal.asReadonly();

  private readonly deleteErrorSignal = signal<string | null>(null);
  readonly deleteError = this.deleteErrorSignal.asReadonly();


  private readonly tasksSignal = signal<Task[]>([]);

  readonly tasks = this.tasksSignal.asReadonly();

  readonly totalTasks = computed(() => this.tasksSignal().length);

  readonly completedTasks = computed(() => this.tasksSignal().filter(task => task.completed).length);

  readonly pendingTasks = computed(() => this.tasksSignal().filter(task => !task.completed).length);

  private readonly taskApi = inject(TaskApi);

  cleanErrors(): void {
    this.errorSignal.set(null);
    this.fieldErrorsSignal.set({});
  }

  clearFieldError(field: string): void {

    console.log(
    'ANTES clearFieldError:',
    field,
    this.fieldErrorsSignal()
        
    );

    this.fieldErrorsSignal.update(errors => {
      if(!(field in errors)){
        return errors;
      }

      const updatedErrors = {
        ...errors
      };

      delete updatedErrors[field];

      return updatedErrors;
    });
      console.log(
      'DESPUÉS clearFieldError:',
      this.fieldErrorsSignal()
    );
  }

  private handleApiError(error: HttpErrorResponse, defaultMessage: string): void {
    
    this.cleanErrors();

    if(error.status === 0){
      this.errorSignal.set('No fue posible conectar con el Backend.');

      return;
    }

  const apiError = error.error as ApiError;

  if(apiError?.errors && Object.keys(apiError.errors).length > 0){

    this.fieldErrorsSignal.set(apiError.errors);
    return;
  }
  
  if(apiError?.message){
    this.errorSignal.set(apiError.message);
    return;
  }

  this.errorSignal.set(defaultMessage);
}

private getApiErrorMessage(error: HttpErrorResponse, defaultMessage: string): string {
  if(error.status === 0){
    return 'No fue posible conectar con el Backend.';
  }

  const apiError = error.error as ApiError;

  if(apiError?.errors && Object.keys(apiError.errors).length > 0){
    return Object.values(apiError.errors).join(' ');
  }

  if(apiError?.message){
    return apiError.message;
  }

  return defaultMessage;

}  


  //GET /api/tasks
  loadTasksFromApi(): void {

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.taskApi.getTasks()
      .pipe(
        finalize(() => {
          this.loadingSignal.set(false);
        })
      )
      .subscribe({
        next: tasks => {
          this.tasksSignal.set(tasks);
        },
        error: error => {
          console.error('Error al cargar las tareas: ',error);
        this.errorSignal.set('No fue posible cargar las tareas.');
        }
      });
    }

  //GET /api/tasks/{id}
  getTaskByID(id: number): Observable<Task>{
    return this.taskApi.getTaskById(id);
  }

  // POST /api/tasks
  createTask(request: CreateTaskRequest): Observable<Task> {

    this.cleanErrors();
    this.creatingSignal.set(true);
    
    return this.taskApi
    .createTask(request)
    .pipe(
      tap(createdTask => {
        this.tasksSignal.update(tasks => [
          ...tasks,
          createdTask
        ]);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error al crear la tarea: ', error);

        this.handleApiError(
          error,
          'No fue posible crear la tarea.'
        );

        return throwError(() => error);
      }),
      finalize(() => {
        this.creatingSignal.set(false);
      })
    );
  }
  
  //PUT /api/tasks/{id}
  updateTask(id: number, request: UpdateTaskRequest): Observable<Task> {
    this.cleanErrors();
    this.updatingSignal.set(true);

    return this.taskApi
    .updateTask(id, request)
    .pipe(
      tap(updatedTask  => {
        this.replaceTask(updatedTask);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`Error al actualizar la tarea ${id}: `, error);

        this.handleApiError(
          error,
          'No fue posible actualizar la tarea.'
        );
        
        return throwError(() => error);
      }),
      finalize(() => {
        this.updatingSignal.set(false);
      })
    );
  }


//PATCH /api/tasks/{id}
patchTask(id: number, request: PatchTaskRequest): Observable<Task> {
  this.errorSignal.set(null);

  return this.taskApi
  .patchTask(id, request)
  .pipe(
    tap(patchedTask => {
      this.replaceTask(patchedTask);
    }),
    catchError((error: HttpErrorResponse) => {
      console.error(`Error al actualizar la tarea ${id}: `,error);

      this.handleApiError(
        error,
        'No fue posible actualizar la tarea.'
      );

      return throwError(() => error);
    })
  );
}

//DELETE /api/tasks/{id}
deleteTask(id: number): Observable<void> {
  this.errorSignal.set(null);
  this.deletingTaskIdSignal.set(id);

  return this.taskApi
  .deleteTask(id)
  .pipe(
    tap(() => {
      this.tasksSignal.update(tasks => 
        tasks.filter(task => task.id !== id)
      );
    }),
    catchError(error => {
      console.error(`Error al eliminar la tarea ${id}: `, error);

      if(error.status === 404){
        this.errorSignal.set('La tarea no existe o ya fue eliminada.');
      } else if (error.status === 0){
        this.errorSignal.set('No fue posible conectar con el Backend.');
      } else {
        this.errorSignal.set('No fue posible eliminar la tarea.');
      }

      return throwError(() => error);
    }),
    finalize(() => {

    })
  );
}

/*deleteTaskFromApi(id: number): Observable<void> {
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
  }*/


  /*completeTask(id: number): void {
    this.tasksSignal.update(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, completed: true } : task));
  }*/

  //deleteTask(id: number): void {
  //  this.tasksSignal.update(tasks => tasks.filter(task => task.id !== id));
  //}
  
  /*deleteTask(id: number): Observable<void> {
    return this.taskApi.deleteTask(id).pipe(
      tap(() => {

        this.tasksSignal.update(
          tasks =>
            tasks.filter(task => task.id !== id)
        );
      }),
      catchError(error => {
        console.error(`Error al eliminar la tarea ${id}`,error);

        return throwError(() => error);
      })
    );
  }*/

  /*private getNextTaskId(): number {

    const tasks = this.tasksSignal();

    if (tasks.length === 0) {
      return 1;
    }

    return Math.max(...tasks.map(task => task.id)) + 1;
  }*/

  /*private loadTasks(): Task[] {

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
  } */

  /*private replaceTask(updatedTask: Task): void {
    this.tasksSignal.update(tasks =>
      tasks.map(task => 
        task.id === updatedTask.id
        ? updatedTask : task
      )
    );
  }*/

  private replaceTask(updatedTask: Task): void {
    this.tasksSignal.update(tasks =>
      tasks.map(task =>
        task.id === updatedTask.id
        ? updatedTask
        : task
      )
    );
  }
}