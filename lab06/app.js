const express = require('express');
const cursoRoutes = require('./routes/cursoRoutes');

const app = express();

// 1. Middleware global incorporado para procesar JSON
app.use(express.json());

// 2. Middleware personalizado Logger (Auditoría de método, URL y tiempo)
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} en ${req.url} - ${duration}ms`);
    });
    next();
});

// Integración de capa de rutas
app.use('/api/cursos', cursoRoutes);

// 3. Middleware de Manejo de Errores Globales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor capturado por el middleware global'
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API Express corriendo en http://localhost:${PORT}`);
});