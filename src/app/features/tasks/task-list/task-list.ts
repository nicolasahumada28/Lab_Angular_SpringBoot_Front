import { Component, inject,OnInit } from '@angular/core';
import { TaskItem } from '../task-item/task-item';
import { TaskForm } from '../task-form/task-form';
import { TaskService } from '../services/task/task';
import { RouterLink } from '@angular/router';


@Component({
  imports: [TaskItem, TaskForm, RouterLink],
  selector: 'app-task-list',
  styleUrl: './task-list.css',
  templateUrl: './task-list.html',
})
export class TaskList implements OnInit {

  private readonly taskService = inject(TaskService);

  readonly tasks = this.taskService.tasks;
  readonly totalTasks = this.taskService.totalTasks;
  readonly completedTasks = this.taskService.completedTasks;
  readonly pendingTasks = this.taskService.pendingTasks;

  readonly loading = this.taskService.loading;
  readonly error = this.taskService.error;

  ngOnInit(): void {
    this.taskService.loadTasksFromApi();
  }

  completeTask(id: number): void {
    this.taskService.completeTask(id);
  }

  deleteTask(id: number): void {
    this.taskService.deleteTask(id);
  }
}