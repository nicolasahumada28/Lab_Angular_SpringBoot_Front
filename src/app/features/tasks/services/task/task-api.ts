import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Task, CreateTaskRequest, UpdateTaskRequest, PatchTaskRequest } from '../../models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskApi {
    private readonly http = inject(HttpClient);

    private readonly apiUrl = 'http://localhost:8080/api/tasks';

    getTasks(): Observable<Task[]> {
        return this.http.get<Task[]>(this.apiUrl);
    }

    getTaskById(id: number): Observable<Task> {
        const url = `${this.apiUrl}/${id}`;
        console.log('GET: ',url);
        return this.http.get<Task>(url);
    }

    createTask(request: CreateTaskRequest): Observable<Task> {

        return this.http.post<Task>(
            this.apiUrl,
            request
        );
    }

    updateTask(id: number, request: UpdateTaskRequest): Observable<Task> {
        const url = `${this.apiUrl}/${id}`;
        console.log('PUT: ',url);
        return this.http.put<Task>(
        url,
        request
        );
    }

    patchTask(id: number, request: PatchTaskRequest): Observable<Task> {
        const url = `${this.apiUrl}/${id}`;
        console.log('PATCH: ',url);
        return this.http.patch<Task>(
            url,
            request
        );
    }

    deleteTask(id: number): Observable<void> {
        const url = `${this.apiUrl}/${id}`;
        console.log('DELETE: ',url);
        return this.http.delete<void>(url);
    }
}
