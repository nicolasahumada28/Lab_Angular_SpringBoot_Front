import { Component, inject, output} from '@angular/core';
import { FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
 } from '@angular/forms';
 import { Router, RouterLink } from '@angular/router';
 import { TaskService } from '../services/task/task';


@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-task-form',
  styleUrl: './task-form.css',
  templateUrl: './task-form.html',
})
export class TaskForm {

  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);

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
    if(this.taskform.invalid){
      this.taskform.markAsTouched();
      return;
    }

    const title = this.taskform.controls.title.value.trim();

    if(title.length <3){
      this.taskform.controls.title.setErrors({minlength: true});
    }

    this.taskService.addTask(title);
    this.router.navigate(['/tasks']);
  }
}
