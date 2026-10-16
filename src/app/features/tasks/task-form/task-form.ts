import { Component, output} from '@angular/core';
import { FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
 } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-task-form',
  styleUrl: './task-form.css',
  templateUrl: './task-form.html',
})
export class TaskForm {

  taskCreated = output<string>();

  taskform = new FormGroup({
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

    if(!title){
      return;
    }

    this.taskCreated.emit(title);
    this.taskform.reset();
  }
}
