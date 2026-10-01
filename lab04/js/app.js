// 1. Gestión del Estado
const form = document.querySelector('#task-form');
const inputTitulo = document.querySelector('#titulo');
const inputCurso = document.querySelector('#curso');
const inputFecha = document.querySelector('#fechaEntrega');
const alertas = document.querySelector('#alertas');
const taskList = document.querySelector('#task-list');
const filtrosContainer = document.querySelector('#filtros');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let filtroActual = 'todas';

// 4. Persistencia y Renderizado
function renderTasks() {
    taskList.innerHTML = '';
    
    // Filtrado de arreglo con ES6+
    let tareasFiltradas = tasks;
    if (filtroActual === 'pendientes') {
        tareasFiltradas = tasks.filter(t => !t.completada);
    } else if (filtroActual === 'completadas') {
        tareasFiltradas = tasks.filter(t => t.completada);
    }

    // 3. Manipulación Dinámica del DOM
    tareasFiltradas.forEach(task => {
        const li = document.createElement('li');
        li.className = task.completada ? 'completada' : '';
        li.innerHTML = `
            <div>
                <strong>${task.titulo}</strong> - ${task.curso} <br>
                <small>Entrega: ${task.fechaEntrega}</small>
            </div>
            <div class="acciones">
                <button class="btn-toggle" data-id="${task.id}">
                    ${task.completada ? 'Deshacer' : 'Completar'}
                </button>
                <button class="btn-delete" data-id="${task.id}">Eliminar</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function mostrarAlerta(mensaje) {
    alertas.innerHTML = `<div class="alerta-error">${mensaje}</div>`;
    setTimeout(() => alertas.innerHTML = '', 3000);
}

// 2. Captura y Validación de Formulario
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const titulo = inputTitulo.value.trim();
    const curso = inputCurso.value.trim();
    const fechaStr = inputFecha.value;

    if (!titulo || !curso || !fechaStr) {
        mostrarAlerta('Todos los campos son obligatorios.');
        return;
    }

    // Validación de fecha posterior a la actual
    const fechaIngresada = new Date(fechaStr + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaIngresada <= hoy) {
        mostrarAlerta('La fecha de entrega debe ser posterior a la fecha actual.');
        return;
    }

    const nuevaTarea = {
        id: Date.now(),
        titulo,
        curso,
        fechaEntrega: fechaStr,
        completada: false
    };

    tasks.push(nuevaTarea);
    saveTasks();
    renderTasks();
    form.reset();
});

// Delegación de Eventos para Completar/Eliminar
taskList.addEventListener('click', (e) => {
    const id = Number(e.target.dataset.id);
    
    if (e.target.classList.contains('btn-delete')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    } 
    else if (e.target.classList.contains('btn-toggle')) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completada = !task.completada;
            saveTasks();
            renderTasks();
        }
    }
});

// Manejo del estado visual de los filtros
filtrosContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        document.querySelectorAll('.filtros button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        filtroActual = e.target.dataset.filter;
        renderTasks();
    }
});

// Carga inicial
document.addEventListener('DOMContentLoaded', renderTasks);