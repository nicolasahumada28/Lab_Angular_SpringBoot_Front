import { Component, inject, input, output } from '@angular/core';
import { Task } from '../models/task';
import { RouterLink } from '@angular/router';
import { Router, ActivatedRoute } from '@angular/router';

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

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  onComplete(): void {
    this.completeRequest.emit(this.task().id);
  }

  onDelete(): void {
    this.deleteRequest.emit(this.task().id);
  }

  getDetail(): void {
    this.router.navigate([`/tasks/${this.task().id}`]);
  }
}
