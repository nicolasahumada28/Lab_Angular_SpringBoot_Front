import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { CreateTaskRequest, PatchTaskRequest, Task, UpdateTaskRequest } from '../../models/task';
import { isPlatformBrowser } from '@angular/common';
import { TaskApi } from './task-api';
import { catchError, finalize, Observable, tap, throwError, timeout } from 'rxjs';
import { time } from 'node:console';

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

  /*private readonly initialTasks: Task[] = [
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
  ]; */

  private readonly tasksSignal = signal<Task[]>(
    []
  );

  readonly tasks = this.tasksSignal.asReadonly();

  readonly totalTasks = computed(() => this.tasksSignal().length);

  readonly completedTasks = computed(() => this.tasksSignal().filter(task => task.completed).length);

  readonly pendingTasks = computed(() => this.tasksSignal().filter(task => !task.completed).length);

  private readonly taskApi = inject(TaskApi);

  /*constructor() {
    effect(() => {
      const tasks = this.tasksSignal();

      if (!this.isBrowser) {
        return;
      }

      localStorage.setItem(
        this.storageKey,
        JSON.stringify(tasks));
    });
  }*/


  //GET /api/tasks
  loadTasksFromApi(): void {

    /*if(!this.isBrowser) {
      return;
    }*/

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

  /*getTaskById(id: number): Task | undefined {
    return this.tasksSignal().find(task => task.id === id);
  }*/

  //GET /api/tasks/{id}
  getTaskByID(id: number): Observable<Task>{
    return this.taskApi.getTaskById(id);
  }
  
  /*loadTaskBy(id: number): void {
    if(!this.isBrowser){
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.taskApi
      .getTaskById(id)
      .pipe(
        finalize(() => {
          this.loadingSignal.set(false);
        })
      )
      .subscribe({
        next: receivedTask => {
          this.tasksSignal.update(tasks => {
            const exists = tasks.some(
              task => task.id === receivedTask.id
            );

            if(!exists){
              return [
                ...tasks,
                receivedTask
              ];
            }

            return tasks.map(task => task.id === receivedTask.id
              ? receivedTask:task
            );
          });
        },
        error: error => {
          console.error(`Error al obtener la tarea ${id}: `, error);
          this.errorSignal.set('No fue posible obtener la tarea.');
        }
      });
  }*/

  /*addTask(title: string): void {
    const request: CreateTaskRequest = {
      title: title.trim(),
      completed: false
    };

    if(!request.title){
      this.errorSignal.set('El título es obligatorio.');

    return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.taskApi
      .createTask(request)
      .pipe(
        finalize(() => {
          this.loadingSignal.set(false);
        })
      )
      .subscribe({
        next: createdTask => {
          this.tasksSignal.update(task => [
            ...task,
            createdTask
          ]);
        },
        error: error =>{
          console.error('Error al crear la tarea: ',error);
          this.errorSignal.set('No fue posible crear la tarea.');
      }
    });
  }*/

  // POST /api/tasks
  createTask(request: CreateTaskRequest): Observable<Task> {
    this.errorSignal.set(null);
    
    return this.taskApi
    .createTask(request)
    .pipe(
      tap(createdTask => {
        this.tasksSignal.update(tasks => [
          ...tasks,
          createdTask
        ]);
      }),
      catchError(error => {
        console.error('Error al crear la tarea: ', error);

        if(error.status === 404){
          this.errorSignal.set('La tarea no existe.');
        } else if(error.status === 0) {
          this.errorSignal.set('No fue posible conectar con el Backend.');
        } else {
          this.errorSignal.set('No fue posible crear la tarea.');
        }

        return throwError(() => error);
      })
    );
  }

  /*updateTask(id: number, request: UpdateTaskRequest): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.taskApi
    .updateTask(id, request)
    .pipe(
      finalize(() => {
        this.loadingSignal.set(false);
      })
    )
    ;
  }*/
  
  //PUT /api/tasks/{id}
  updateTask(id: number, request: UpdateTaskRequest): Observable<Task> {
    this.errorSignal.set(null);

    return this.taskApi
    .updateTask(id, request)
    .pipe(
      tap(updatedTask  => {
        this.replaceTask(updatedTask);
      }),
      catchError(error => {
        console.error(`Error al actualizar la tarea ${id}: `, error);

        if(error.status === 404){
          this.errorSignal.set('La tarea no existe.');
        } else if(error.status === 0){
          this.errorSignal.set('No fue posible conectar con el Backend.');
        } else {
          this.errorSignal.set('No fue posible actualizar la tarea.');
        }
        return throwError(() => error);
      })
    );
  }

  /*createTaskFromApi(title: string): Observable<Task> {
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
}*/

/*completeTaskFromApi(id: number): Observable<Task> {

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
}*/

//PATCH /api/tasks/{id}
patchTask(id: number, request: PatchTaskRequest): Observable<Task> {
  this.errorSignal.set(null);

  return this.taskApi
  .patchTask(id, request)
  .pipe(
    tap(patchedTask => {
      this.replaceTask(patchedTask);
    }),
    catchError(error => {
      console.error(`Error al actualizar la tarea ${id}: `,error);

      if(error.status === 404){
        this.errorSignal.set('La tarea no existe.');
      } else if(error.status === 0){
        this.errorSignal.set('No fue posible conectar con el Backend.');
      } else {
        this.errorSignal.set('No fue posible actualizar la tarea.');
      }

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
      tasks.map(task => {
        if (task.id !== updatedTask.id) {
          return task;
        }

        return {
          ...task,
          ...updatedTask,
          title: updatedTask.title ?? task.title
        };
      })
    );
  }
}