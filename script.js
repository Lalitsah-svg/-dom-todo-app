// ==========================================
// TASKFLOW - TODO APPLICATION
// ==========================================

// DOM ELEMENTS

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const emptyTitle = document.getElementById("emptyTitle");
const emptyMessage = document.getElementById("emptyMessage");
const searchInput = document.getElementById("searchInput");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");

const totalStat = document.getElementById("totalStat");
const activeStat = document.getElementById("activeStat");
const completedStat = document.getElementById("completedStat");

const allCount = document.getElementById("allCount");
const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");

const progressPercent = document.getElementById("progressPercent");
const progressFill = document.getElementById("progressFill");
const taskSummary = document.getElementById("taskSummary");

const currentDate = document.getElementById("currentDate");


// APPLICATION STATE

let tasks = loadTasks();
let currentFilter = "all";
let searchTerm = "";


// DATE DISPLAY

currentDate.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
});


// LOCAL STORAGE

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem("taskflow_tasks");

        if (!savedTasks) {
            return [];
        }

        const parsedTasks = JSON.parse(savedTasks);

        if (!Array.isArray(parsedTasks)) {
            return [];
        }

        return parsedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.title === "string" &&
            typeof task.completed === "boolean"
        );

    } catch (error) {
        console.error("Unable to load tasks:", error);
        return [];
    }
}


function saveTasks() {
    try {
        localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
        console.log("Tasks saved successfully!");
    } catch (error) {
        console.error("Unable to save tasks:", error);
    }
}


// ADD TASK

function addTask(title) {

    const cleanTitle = title.trim();

    if (cleanTitle === "") {
        alert("Please enter a task before adding!");
        return;
    }

    if (cleanTitle.length > 100) {
        alert("Task cannot exceed 100 characters.");
        return;
    }

    const newTask = {
        id: crypto.randomUUID(),
        title: cleanTitle,
        completed: false,
        createdAt: new Date().toLocaleString()
    };

    tasks.unshift(newTask);

    saveTasks();
    renderApp();

    taskInput.value = "";
    taskInput.focus();

    console.log("New task added:", newTask);
}


// DELETE TASK

function deleteTask(id) {

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderApp();

    console.log("Task deleted:", id);
}


// TOGGLE TASK

function toggleTask(id) {

    tasks = tasks.map(task => {

        if (task.id === id) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();
    renderApp();
}


// CLEAR COMPLETED TASKS

function clearCompletedTasks() {

    const completedTasks = tasks.filter(task => task.completed);

    if (completedTasks.length === 0) {
        alert("There are no completed tasks to clear.");
        return;
    }

    const confirmed = confirm(
        `Delete all ${completedTasks.length} completed task(s)?`
    );

    if (!confirmed) {
        return;
    }

    tasks = tasks.filter(task => !task.completed);

    saveTasks();
    renderApp();
}


// FILTER TASKS

function getFilteredTasks() {

    return tasks.filter(task => {

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "active" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        const matchesSearch =
            task.title.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });
}


// RENDER TASKS

function renderTasks() {

    const filteredTasks = getFilteredTasks();

    taskList.innerHTML = "";

    filteredTasks.forEach(task => {

        const taskElement = document.createElement("div");

        taskElement.className = `task-item ${task.completed ? "completed" : ""}`;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", `Complete ${task.title}`);

        checkbox.addEventListener("change", () => {
            toggleTask(task.id);
        });

        const details = document.createElement("div");
        details.className = "task-details";

        const title = document.createElement("p");
        title.className = "task-title";
        title.textContent = task.title;

        const date = document.createElement("p");
        date.className = "task-date";
        date.textContent = `Added ${task.createdAt}`;

        details.appendChild(title);
        details.appendChild(date);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "×";
        deleteButton.setAttribute("aria-label", `Delete ${task.title}`);

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        taskElement.appendChild(checkbox);
        taskElement.appendChild(details);
        taskElement.appendChild(deleteButton);

        taskList.appendChild(taskElement);
    });

    // EMPTY STATE

    const shouldShowEmpty = filteredTasks.length === 0;

    emptyState.style.display = shouldShowEmpty ? "block" : "none";

    if (shouldShowEmpty) {

        if (searchTerm) {
            emptyTitle.textContent = "No matching tasks";
            emptyMessage.textContent = "Try searching with another keyword.";
        } else if (currentFilter === "completed") {
            emptyTitle.textContent = "No completed tasks";
            emptyMessage.textContent = "Complete a task to see it here.";
        } else if (currentFilter === "active") {
            emptyTitle.textContent = "No active tasks";
            emptyMessage.textContent = "You're all caught up!";
        } else {
            emptyTitle.textContent = "Nothing here yet";
            emptyMessage.textContent = "Add your first task and get started!";
        }
    }

    taskSummary.textContent =
        `${filteredTasks.length} ${filteredTasks.length === 1 ? "task" : "tasks"}`;
}


// UPDATE STATISTICS

function updateStatistics() {

    const total = tasks.length;

    const completed = tasks.filter(task => task.completed).length;

    const active = total - completed;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    totalStat.textContent = total;
    activeStat.textContent = active;
    completedStat.textContent = completed;

    allCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;

    progressPercent.textContent = `${percentage}%`;
    progressFill.style.width = `${percentage}%`;

    console.log("Statistics updated:", {
        total,
        active,
        completed,
        percentage
    });
}


// UPDATE ACTIVE FILTER BUTTONS

function updateFilterButtons() {

    document.querySelectorAll("[data-filter]").forEach(button => {

        const isActive = button.dataset.filter === currentFilter;

        button.classList.toggle("active", isActive);
    });
}


// MAIN RENDER FUNCTION

function renderApp() {

    renderTasks();
    updateStatistics();
    updateFilterButtons();
}


// EVENT LISTENERS

// Add task form
taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    addTask(taskInput.value);

});


// Filter buttons
document.querySelectorAll("[data-filter]").forEach(button => {

    button.addEventListener("click", function() {

        currentFilter = this.dataset.filter;

        renderApp();

    });

});


// Search tasks
searchInput.addEventListener("input", function() {

    searchTerm = this.value.trim();

    renderTasks();

});


// Clear completed
clearCompletedBtn.addEventListener("click", clearCompletedTasks);


// INITIALIZE APPLICATION

renderApp();

console.log("TaskFlow application initialized successfully!");