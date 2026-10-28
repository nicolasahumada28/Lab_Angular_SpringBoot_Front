import { Component, inject} from '@angular/core';
import { FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
 } from '@angular/forms';
 import { Router } from '@angular/router';
 import { TaskService } from '../services/task/task';
import { minLength } from '@angular/forms/signals';


@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-task-form',
  styleUrl: './task-form.css',
  templateUrl: './task-form.html',
})
export class TaskForm {

  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);

  readonly creating = this.taskService.creating;
  readonly createError = this.taskService.createError;

  readonly taskform = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3)
      ]
    })
  });

  onSubmit(): void {
    if(this.taskform.invalid || this.creating()){
      this.taskform.markAllAsTouched();
      return;
    }

    const trimTitle = this.taskform.controls.title.value.trim();

    if(trimTitle.length <3){
      this.taskform.controls.title.setErrors({
        minLength: {
          requiredLength: 3,
          actualLength: trimTitle.length
        }
      });
      return;
    }

    this.taskService
      .createTask({
        title: trimTitle,
        completed: false
      })
      .subscribe({
        next: () => {
          console.log('Tarea creada correctamente.');
          this.router.navigate(['/tasks']);
        },
        error: error => {
          console.error('No fue posible crear la tarea: ', error);
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
