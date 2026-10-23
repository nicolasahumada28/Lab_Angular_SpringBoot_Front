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
  readonly task = computed(() => 
    this.taskService.tasks().find(
      task => task.id === this.id));
  
  readonly updating = this.taskService.updating;
  readonly updateError = this.taskService.updateError;

  readonly deleting = this.taskService.deleting;
  readonly deleteError = this.taskService.deleteError;

  completeTask(): void {
    const currentTask = this.task();

    if(!currentTask ||
      currentTask.completed ||
      this.updating()
    ){
      return;
    }

    this.taskService
    .completeTaskFromApi(currentTask.id)
    .subscribe({
      next: () => {
        console.log('Tarea actualizada correctamente');
      },
      error: () => {
        // El servicio ya guardó el mensaje
          // dentro de updateError.
      }
    });
  }

  deleteTask(): void {
    const currentTask = this.task();

    if(!currentTask || this.deleting()){
      return;
    }

    const confirmed = window.confirm(`¿Deseas eliminar la tarea "${currentTask.title}"?`);

    if(!confirmed){
      return;
    }

    this.taskService
      .deleteTaskFromApi(currentTask.id)
      .subscribe({
        next: () => {
          this.router.navigate(['/tasks']);
        },
        error: () => {
          // El servicio ya establece deleteError.
        // Permanecemos en la pantalla de detalle.
        }
      });
  }

  goBack() {
    this.router.navigate(['/tasks']);
  }
}
