const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const tasksFile = path.join(__dirname, 'tasks.json');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for logging requests
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
    next();
});

//  Read tasks from `tasks.json`
const getTasks = () => {
    const data = fs.readFileSync(tasksFile, 'utf-8');
    return JSON.parse(data);
};

//  Save tasks to `tasks.json`
const saveTasks = (tasks) => {
    fs.writeFileSync(tasks, JSON.stringify(tasks, null, 2));
};

//  GET /tasks → Show all tasks (Render EJS)
app.get('/tasks', (req, res) => {
    const tasks = getTasks();
    res.render('tasks', { tasks });
});

//  GET /task?id=1 → Fetch a specific task
app.get('/task', (req, res) => {
    const taskId = parseInt(req.query.id);
    if (!taskId) {
        return res.status(400).json({ error: "Please provide a valid task ID" });
    }

    const tasks = getTasks();
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        return res.status(404).json({ error: `No task found for ID ${taskId}` });
    }

    res.json(task);
});

//  POST /add-task → Add a new task
app.post('/add-task', (req, res) => {
    const { desc } = req.body;

    if (!desc) {
        return res.status(400).json({ error: "Task description is required" });
    }

    let tasks = getTasks();
    const newTask = {
        id: tasks.length + 1,
        desc: desc,
        completed: false
    };

    tasks.push(newTask);
    saveTasks(tasks);

    res.redirect('/tasks'); // Redirect to tasks list
});

// Start Server
app.listen(3000, () => {
    console.log(" Server started on http://localhost:3000");
});
