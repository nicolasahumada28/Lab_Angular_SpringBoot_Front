import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Task, CreateTaskRequest } from '../../models/task';

interface TodoApiResponse {
    userId?: number;
    id: number;
    title: string;
    completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TaskApi {
    private readonly http = inject(HttpClient);

    private readonly apiUrl = 'https://jsonplaceholder.typicode.com/todos';

    getTasks(): Observable<Task[]> {
        //return this.http.get<Task[]>(this.apiUrl);
        return this.http.get<TodoApiResponse[]>(this.apiUrl).pipe(
            map(todos => todos.slice(0, 10)
        .map(todo => ({
            id: todo.id,
            title: todo.title,
            completed: todo.completed
            }))
        ));
    }

    createTask(request: CreateTaskRequest): Observable<Task> {

        return this.http.post<TodoApiResponse>(
            this.apiUrl,
            {
                ...request,
                userId: 1
            }
        )
        .pipe(
            map(response => ({
                id: response.id,
                title: response.title,
                completed: response.completed
            }))
        );
    }
}
