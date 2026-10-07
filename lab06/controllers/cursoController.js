const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data/cursos.json');

// Funciones auxiliares para lectura/escritura síncrona
const leerCursos = () => JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const guardarCursos = (datos) => fs.writeFileSync(dataPath, JSON.stringify(datos, null, 2));

exports.getAllCursos = (req, res, next) => {
    try {
        let cursos = leerCursos();
        // Filtro por query string (?creditos=4)
        if (req.query.creditos) {
            cursos = cursos.filter(c => c.creditos === parseInt(req.query.creditos));
        }
        res.status(200).json(cursos);
    } catch (error) { next(error); } // Deriva el error al middleware global
};

exports.getCursoById = (req, res, next) => {
    try {
        const cursos = leerCursos();
        const curso = cursos.find(c => c.id === parseInt(req.params.id));
        if (!curso) return res.status(404).json({ message: 'Curso no encontrado' });
        res.status(200).json(curso);
    } catch (error) { next(error); }
};

exports.createCurso = (req, res, next) => {
    try {
        const { nombre, codigo, creditos } = req.body;
        // Validación de campos obligatorios
        if (!nombre || !codigo || !creditos) {
            return res.status(400).json({ message: 'Faltan campos obligatorios: nombre, codigo, creditos' });
        }
        const cursos = leerCursos();
        const nuevoCurso = {
            id: cursos.length > 0 ? Math.max(...cursos.map(c => c.id)) + 1 : 1,
            nombre,
            codigo,
            creditos: parseInt(creditos)
        };
        cursos.push(nuevoCurso);
        guardarCursos(cursos);
        res.status(201).json(nuevoCurso);
    } catch (error) { next(error); }
};

exports.updateCurso = (req, res, next) => {
    try {
        const cursos = leerCursos();
        const index = cursos.findIndex(c => c.id === parseInt(req.params.id));
        if (index === -1) return res.status(404).json({ message: 'Curso no encontrado' });
        
        const cursoActualizado = { ...cursos[index], ...req.body, id: cursos[index].id };
        cursos[index] = cursoActualizado;
        guardarCursos(cursos);
        
        res.status(200).json(cursoActualizado);
    } catch (error) { next(error); }
};

exports.deleteCurso = (req, res, next) => {
    try {
        let cursos = leerCursos();
        const index = cursos.findIndex(c => c.id === parseInt(req.params.id));
        if (index === -1) return res.status(404).json({ message: 'Curso no encontrado' });
        
        cursos.splice(index, 1);
        guardarCursos(cursos);
        
        res.status(200).json({ message: 'Curso eliminado exitosamente' });
    } catch (error) { next(error); }
};