import { computed, Injectable, signal } from '@angular/core';
import { Task } from '../../models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private readonly tasksSignal = signal<Task[]>([
    {
      id: 1,
      title: 'Estudiar TypeScript',
      completed: true
    },
    {
      id: 2,
      title: 'Estudiar Components',
      completed: false
    },
    {
      id: 3,
      title: 'Estudiar Routing',
      completed: false
    }
  ]);

  readonly tasks = this.tasksSignal.asReadonly();

  readonly totalTasks = computed(() => this.tasksSignal().length);

  readonly completedTasks = computed(() => this.tasksSignal().filter(task => task.completed).length);

  readonly pendingTasks = computed(() => this.tasksSignal().filter(task => !task.completed).length);

  addTask(title: string): void {
    const newTask: Task = {
      id: this.getNextTaskId(),
      title,
      completed: false
    };

    this.tasksSignal.update(tasks => [
        ...tasks,
        newTask
    ]);
  }

  completeTask(id: number): void {
    this.tasksSignal.update(tasks => 
        tasks.map(task =>
             task.id === id ? {...task, completed: true} : task));
  }

  deleteTask(id: number): void {
    this.tasksSignal.update(tasks => tasks.filter(task => task.id !== id));
  }

  private getNextTaskId(): number {
    
    const tasks = this.tasksSignal();

    if(tasks.length === 0){
        return 1;
    }

    return Math.max(...tasks.map(task => task.id)) + 1;
  }
}
