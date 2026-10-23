export interface Task {
    id: number;
    title: string;
    completed: boolean;
}

export interface CreateTaskRequest {
    title: string;
    completed: boolean;
}

export interface UpdateTaskRequest {
    title?: string;
    completed?: boolean;
}