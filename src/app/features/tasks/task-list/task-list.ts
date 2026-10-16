import { Component, inject } from '@angular/core';
import { TaskItem } from '../task-item/task-item';
import { TaskForm } from '../task-form/task-form';
import { TaskService } from '../services/task/task';


@Component({
  imports: [TaskItem, TaskForm],
  selector: 'app-task-list',
  styleUrl: './task-list.css',
  templateUrl: './task-list.html',
})
export class TaskList {

  private readonly taskService = inject(TaskService);

  readonly tasks = this.taskService.tasks;
  readonly totalTasks = this.taskService.totalTasks;
  readonly completedTasks = this.taskService.completedTasks;
  readonly pendingTasks = this.taskService.pendingTasks;

  title = 'Mis Tareas';

 

  addTask(title: string): void {
    this.taskService.addTask(title);
  };

  completeTask(id: number): void {
    this.taskService.completeTask(id);
  }

  deleteTask(id: number): void {
    this.taskService.deleteTask(id);
  }
}