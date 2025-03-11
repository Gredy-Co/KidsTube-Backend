                   require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const bodyParser = require('body-parser');
const authenticate = require('./middleware/auth'); 

const { videoPost, videoGet, videoPut, videoDelete } = require('./controllers/VideoController');
const { userPost, userLogin } = require('./controllers/UserController');
const { profilePost, profileGet, profilePut,profileDelete } = require('./controllers/ProfileController');

const app = express();

const mongoData = process.env.DATABASE_URL;
mongoose.connect(mongoData);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected')
})

app.use(bodyParser.json()); 
app.use(express.json()); 
const jwt = require('jsonwebtoken');


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

// Profiles Routes
app.post('/api/profile' ,authenticate, profilePost); 
app.put('/api/profile/:id' ,authenticate, profilePut); 
app.get('/api/profile/' ,authenticate, profileGet); 
app.delete('/api/profile/:id' ,authenticate, profileDelete); 

// app.post('/api/users', userPost); // Esta ruta está duplicada


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});