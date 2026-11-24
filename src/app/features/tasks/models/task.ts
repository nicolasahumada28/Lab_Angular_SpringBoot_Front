export type TaskPriority =
| 'LOW'
| 'MEDIUM'
| 'HIGH';

export interface Task {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    priority: TaskPriority | null;
    createdAt: string;
    updatedAt: string;
    dueDate: string | null;
}

export interface CreateTaskRequest {
    title: string;
    description: string | null;
    priority: TaskPriority;
    completed: boolean;
    dueDate: string | null;
}

export interface PutTaskRequest {
    title: string;
    description: string | null;
    priority: TaskPriority;
    completed: boolean;
    dueDate: string | null;
}

export interface PatchTaskRequest {
    title?: string;
    description?: string | null;
    priority?: TaskPriority;
    completed?: boolean;
    dueDate?: string | null;
}