import { Service } from '@angular/core';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../../models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskApi {
    private readonly http = inject(HttpClient);

    private readonly apiUrl = 'http://localhost:4200/tasks';

    getTasks(): Observable<Task[]> {
        return this.http.get<Task[]>(this.apiUrl);
    }
}
