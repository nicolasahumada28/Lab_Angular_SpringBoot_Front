import { Component, input, output } from '@angular/core';
import { Task } from '../models/task';

@Component({
  imports: [],
  selector: 'app-task-item',
  styleUrl: './task-item.css',
  templateUrl: './task-item.html',
})
export class TaskItem {
  task = input.required<Task>();

  completeRequest = output<number>();
  deleteRequest = output<number>();

  onComplete(): void {
    this.completeRequest.emit(this.task().id);
  }

  onDelete(): void {
    this.deleteRequest.emit(this.task().id);
  }
}
