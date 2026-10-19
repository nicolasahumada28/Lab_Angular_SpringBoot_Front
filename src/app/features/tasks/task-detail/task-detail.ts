import { Component, computed, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../services/task/task';

@Component({
  imports: [],
  selector: 'app-task-detail',
  styleUrl: './task-detail.css',
  templateUrl: './task-detail.html',
})
export class TaskDetail {

  private readonly route = inject(ActivatedRoute);
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);

  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly task = computed(() => this.taskService.tasks().find(task => task.id === this.id));

  goBack() {
    this.router.navigate(['/tasks']);
  }
}
