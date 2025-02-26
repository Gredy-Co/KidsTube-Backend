const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Importar controladores
const { videoPost, videoGet, videoPut } = require('./controllers/VideoController');
const { userPost } = require('./controllers/UserController');

// Crear la aplicación Express
const app = express();

// Conexión a MongoDB Atlas
mongoose.connect('mongodb+srv://keirychas:Keivanessa05@cluster0.2g9bo.mongodb.net/KidsTube?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('Conectado a MongoDB Atlas');
  })
  .catch(err => {
    console.log('Error de conexión a MongoDB:', err);
  });

// Middleware para parsear el cuerpo de las solicitudes
app.use(bodyParser.json()); // body-parser para versiones antiguas de Express
app.use(express.json()); // express.json() es el método recomendado en Express 4.16+

// Configurar CORS
app.use(cors({
  origin: '*', // Permitir solicitudes desde cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'] // Cabeceras permitidas
}));

// Rutas para videos
app.post('/api/video', videoPost);
app.get('/api/video/', videoGet);
app.put('/api/video/:id', videoPut);

// Rutas para usuarios
app.post('/api/user', userPost); // Usa esta ruta o la de abajo, pero no ambas
// app.post('/api/users', userPost); // Esta ruta está duplicada

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});