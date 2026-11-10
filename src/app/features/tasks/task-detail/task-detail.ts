import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../services/task/task';
import { finalize } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { UpdateTaskRequest } from '../models/task';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TASK_TITLE_VALIDATORS } from '../../../validators/task.validators';
import { FieldError } from '../../../shared/components/field-error/field-error';


@Component({
  imports: [ReactiveFormsModule, FieldError],
  selector: 'app-task-detail',
  styleUrl: './task-detail.css',
  templateUrl: './task-detail.html',
})

export class TaskDetail {

  private readonly route = inject(ActivatedRoute);
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  readonly id = Number(this.route.snapshot.paramMap.get('id'));

  //Formulario
  readonly editForm = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: TASK_TITLE_VALIDATORS
    }),

    completed: new FormControl(false, {
      nonNullable: true
    })
  });

  //Tarea Actual
  private readonly taskSignal = signal<Task | null>(null);
  readonly task = this.taskSignal.asReadonly();

  //Estado de carga
  readonly loading = signal(false);
  readonly loadError = signal<String | null>(null);

  //Edición
  readonly editing = signal(false);
  readonly updating = this.taskService.updating;

  //Eliminación
  readonly deleting = computed(
    () =>
      this.taskService.deletingTaskId() === this.id);

  ngOnInit(): void {
    this.loadTask();
  }

  //Errores
  readonly fieldErrors = this.taskService.fieldErrors;

  //limpieza de validacion de campos
  clearFieldError(field: string): void {
    console.log('TaskDetail clearFieldError: ', field);
    this.taskService.clearFieldError(field);
  }

  //GET by ID
  private loadTask(): void {
    if (!Number.isInteger(this.id) || this.id <= 0) {
      this.loadError.set('El identificador de la tarea no es válido.');

      return;
    }

    this.loading.set(true);
    this.loadError.set(null);

    this.taskService
      .getTaskByID(this.id)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: task => {
          this.taskSignal.set(task);
        },
        error: error => {
          console.error('Error al cargar la tarea: ', error);

          if (error.status === 404) {
            this.loadError.set('La tarea solicitada no existe.');
          } else if (error.status === 0) {
            this.loadError.set('No fue posible conectar con el Backend.');
          }
          else {
            this.loadError.set('No fue posible cargar la tarea.');
          }
        }
      });
  }

  //Editar
  startEditing(): void {
    const currentTask = this.task();

    if (!currentTask) {
      return;
    }

    this.taskService.cleanErrors();

    this.editForm.reset({
      title: currentTask.title,
      completed: currentTask.completed
    })

    this.editing.set(true);
  }

  cancelEditing(): void {

    if(this.updating()){
      return;
    }

    this.taskService.cleanErrors();

    this.editing.set(false);
  }

  saveTask(): void {
    const currentTask = this.task();

    if (!currentTask || this.updating()){
      return;
    }

    if(this.editForm.invalid){
      this.editForm.markAllAsTouched();
    }


    const formValue = this.editForm.getRawValue();

    const request: UpdateTaskRequest = {
      title: formValue.title.trim(),
      completed: formValue.completed
    };    

    console.log('PUT: ', request);

    this.taskService
      .updateTask(currentTask.id, request)
      .subscribe({
        next: updatedTask => {
          console.log('Tarea actualizada correctamente: ', updatedTask);
          this.taskSignal.set(updatedTask);
          this.taskService.cleanErrors();
          this.editing.set(false);
        },
        error: error => {
          console.error('No fue posible actualizar la tarea.', error);
        }
      });
  }

  //PATCH - Completar
  completeTask(): void {
    const currentTask = this.task();

    if (!currentTask ||
      currentTask.completed ||
      this.updating()
    ) {
      return;
    }

    this.taskService
      .patchTask(currentTask.id,
        {
          completed: true
        }
      )
      .subscribe({
        next: updatedTask => {
          console.log('Tarea actualizada correctamente: ', updatedTask);
          this.editing.set(false);
          this.taskSignal.set(updatedTask);
        },
        error: error => {
          console.error('No fue posible completar la tarea: ', error);
        }
      });
  }

  //DELETE
  deleteTask(): void {
    const currentTask = this.task();

    if (!currentTask || this.deleting()) {
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const confirmed = window.confirm(`¿Deseas eliminar la tarea "${currentTask.title}"?`);

    if (!confirmed) {
      return;
    }

    this.taskService
      .deleteTask(currentTask.id)
      .subscribe({
        next: () => {
          console.log('Tarea eliminada correctamente.');
          this.router.navigate(['/tasks']);
        },
        error: error => {
          console.error('Error al eliminar la tarea: ', error);
        }
      });
  }

  goBack() {
    this.router.navigate(['/tasks']);
  }
}
