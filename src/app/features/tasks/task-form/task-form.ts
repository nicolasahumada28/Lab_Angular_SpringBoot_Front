import { Component, inject} from '@angular/core';
import { FormControl,
  FormGroup,
  ReactiveFormsModule
 } from '@angular/forms';
 import { Router } from '@angular/router';
 import { TaskService } from '../services/task/task';
import { CreateTaskRequest } from '../models/task';
import { notBlankValidator } from '../../../validators/not-blank.validator';
import { TASK_TITLE_VALIDATORS } from '../../../validators/task.validators';
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

    completed: new FormControl(false, {
    nonNullable: true
    })
  });


  onSubmit(): void {
    if(this.taskform.invalid || this.creating()){
      this.taskform.markAllAsTouched();
      return;
    }

    const formValue = this.taskform.getRawValue();

    const request: CreateTaskRequest = {
      title: formValue.title.trim(),
      completed: formValue.completed
    };

    this.taskService
      .createTask(request)
        .subscribe({
        next: createdTask => {
          console.log('Tarea creada: ', createdTask);

          this.taskService.cleanErrors();
          this.taskform.reset({
            title: '',
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
