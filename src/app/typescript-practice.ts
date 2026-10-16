interface Task{
    id: number;
    title: string;
    description?: string;
    completed: boolean;
}

const tasks: Task[] = 
[
    {
        id: 1,
        title: 'Estudiar Typescript',
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
];

function findTask(id: number): Task | undefined {
    return tasks.find(task => task.id === id);
}

function getPendingTasks(): Task[] {
    return tasks.filter(task => !task.completed);
}

function getTaskTitles(): string[] {
    return tasks.map(task => task.title);
}

function completeTask(id: number): Task | undefined {
    const task = tasks.find(task => task.id === id);

    if(!task){
        return undefined;
    }

    return {
        ...task,
        completed: true
    };
}

console.log(findTask(2));
console.log(getPendingTasks());
console.log(getTaskTitles());

const completedTask = completeTask(2);

console.log('Resultado: ', completedTask);
console.log('Original: ',tasks.find(task => task.id === 2));