import { Component, inject, OnInit } from '@angular/core';
import { TaskItem } from '../task-item/task-item';
import { TaskService } from '../services/task/task';
import { RouterLink } from '@angular/router';
import { subscribe } from 'diagnostics_channel';


@Component({
  imports: [TaskItem, RouterLink],
  selector: 'app-task-list',
  styleUrl: './task-list.css',
  templateUrl: './task-list.html',
})
export class TaskList implements OnInit{

  private readonly taskService = inject(TaskService);

  readonly tasks = this.taskService.tasks;
  readonly totalTasks = this.taskService.totalTasks;
  readonly completedTasks = this.taskService.completedTasks;
  readonly pendingTasks = this.taskService.pendingTasks;

  readonly loading = this.taskService.loading;
  readonly error = this.taskService.error;

  /*constructor() {
    this.taskService.loadTasksFromApi();
  }*/

    //loadFromApi(): void {
    //  this.taskService.loadTasksFromApi();
    //}
  
  ngOnInit(): void {
    this.taskService.loadTasksFromApi();
  }

  completeTask(id: number): void {
    this.taskService.patchTask(id,
      {
        completed: true
      }
    )
    .subscribe({
      next: updatedTask => {
        console.log(`Tarea ${id} completada correctamente.`, updatedTask);
      },
      error: error => {
        console.error(`No fue posible completar la tarea ${id}: `, error);
      }
    });
  }

  deleteTask(id: number): void {
    const confirmed = window.confirm(
      '¿Estás seguro de que deseas eliminar esta tarea?'
    );

    if(!confirmed){
      return;
    }

    this.taskService
    .deleteTask(id)
    .subscribe({
      next: () => {
        console.log(`Tarea ${id} eliminada correctamente`);
      },
      error: error => {
        console.error(`No fue posible eliminar la tarea ${id}`, error);
      }
    });
  }
}