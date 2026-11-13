import { Component, inject} from '@angular/core';
import { FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
 } from '@angular/forms';
 import { Router } from '@angular/router';
 import { TaskService } from '../services/task/task-service';
import { TaskPriority, CreateTaskRequest } from '../models/task';
import { notBlankValidator } from '../../../validators/not-blank.validator';
import { TASK_DESCRIPTION_VALIDATORS, TASK_TITLE_VALIDATORS } from '../../../validators/task.validators';
import { FieldError } from '../../../shared/components/field-error/field-error';


@Component({
  imports: [ReactiveFormsModule, FieldError],
  selector: 'app-task-form',
  styleUrl: './task-form.css',
  templateUrl: './task-form.html',
})

export class TaskForm {

  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);

  readonly creating = this.taskService.creating;
  readonly createError = this.taskService.createError;

  readonly error = this.taskService.error;
  readonly fieldErrors = this.taskService.fieldErrors;

  clearFieldError(field: string): void {
    this.taskService.clearFieldError(field);
  }


  readonly taskform = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: TASK_TITLE_VALIDATORS
    }),

    description: new FormControl('', {
      nonNullable: true,
      validators: TASK_DESCRIPTION_VALIDATORS
    }),

    priority: new FormControl<TaskPriority>('MEDIUM', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }),

    completed: new FormControl(false, {
    nonNullable: true
    }),

    dueDate: new FormControl('',{
      nonNullable: true
    })
  });


  onSubmit(): void {
    if(this.taskform.invalid || this.creating()){
      this.taskform.markAllAsTouched();
      return;
    }

    const formValue = this.taskform.getRawValue();
    const description = formValue.description.trim() || null;
    const dueDate = formValue.dueDate || null;

    const request: CreateTaskRequest = {
      title: formValue.title.trim(),
      description,
      priority: formValue.priority,
      completed: formValue.completed,
      dueDate: dueDate
    };

    this.taskService
      .createTask(request)
        .subscribe({
        next: createdTask => {
          console.log('Tarea creada: ', createdTask);

          this.taskService.cleanErrors();
          this.taskform.reset({
            title: '',
            description: '',
            completed: false
          });
          this.taskform.markAsPristine();
          this.taskform.markAsUntouched();
        },

        error: error => {
          console.log('Error al crear la tarea: ', error);
        }
      });
  }

  cancel(): void {
    if (this.creating()){
      return;
    }

    this.router.navigate(['/tasks']);

  }
}

export { notBlankValidator };
