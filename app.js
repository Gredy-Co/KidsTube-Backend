const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const bodyParser = require('body-parser');

const { videoPost, videoGet, videoPut, videoDelete } = require('./controllers/VideoController');
const { userPost, userLogin } = require('./controllers/UserController');

const app = express();

mongoose.connect('mongodb+srv://keirychas:Keivanessa05@cluster0.2g9bo.mongodb.net/KidsTube?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('Conectado a MongoDB Atlas');
  })
  .catch(err => {
    console.log('Error de conexión a MongoDB:', err);
  });

app.use(bodyParser.json()); 
app.use(express.json()); 

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));

// Video Routes 
app.post('/api/video', videoPost);
app.get('/api/video/', videoGet);
app.put('/api/video/:id', videoPut);
app.delete('/api/video/:id', videoDelete);

// User Routes
app.post('/api/user', userPost); 
app.post('/api/user/login', userLogin ); 

// app.post('/api/users', userPost); // Esta ruta está duplicada


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});