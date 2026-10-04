// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    console.log(`Petición recibida: ${req.method} ${req.url}`);

    // 1. Servir archivos estáticos desde la carpeta /public
    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html' || req.url === '/style.css')) {
        // Por defecto servimos index.html si la ruta es '/'
        let urlRuta = req.url === '/' ? '/index.html' : req.url;
        const filePath = path.join(__dirname, 'public', urlRuta);
        
        // Inferir el Content-Type correctamente
        const extname = path.extname(filePath);
        let contentType = 'text/html';
        if (extname === '.css') contentType = 'text/css';

        // Lectura asíncrona de archivos
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error interno del servidor');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
        });
    }
    // 2. Ruta GET /api/estudiantes (Leer JSON)
    else if (req.url === '/api/estudiantes' && req.method === 'GET') {
        const dataPath = path.join(__dirname, 'data', 'estudiantes.json');
        
        fs.readFile(dataPath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error leyendo los datos' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            }
        });
    }
    // 3. Ruta POST /api/estudiantes (Agregar al JSON)
    else if (req.url === '/api/estudiantes' && req.method === 'POST') {
        let body = '';
        
        // Capturar los chunks de datos
        req.on('data', chunk => {
            body += chunk.toString();
        });

        // Termina de recibir datos
        req.on('end', () => {
            try {
                const nuevoEstudiante = JSON.parse(body);
                const dataPath = path.join(__dirname, 'data', 'estudiantes.json');
                
                // Leer archivo actual
                fs.readFile(dataPath, 'utf8', (err, data) => {
                    let estudiantes = [];
                    if (!err && data) {
                        estudiantes = JSON.parse(data);
                    }
                    
                    // Asignar ID autoincremental y agregar al array
                    nuevoEstudiante.id = estudiantes.length > 0 ? estudiantes[estudiantes.length - 1].id + 1 : 1;
                    estudiantes.push(nuevoEstudiante);
                    
                    // Escribir archivo JSON asíncronamente
                    fs.writeFile(dataPath, JSON.stringify(estudiantes, null, 2), (err) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Error al guardar' }));
                        } else {
                            res.writeHead(201, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(nuevoEstudiante));
                        }
                    });
                });
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'JSON inválido' }));
            }
        });
    }
    // 4. Manejo de rutas no existentes
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Recurso no encontrado' }));
    }
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});