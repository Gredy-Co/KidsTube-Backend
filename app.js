                   require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const bodyParser = require('body-parser');
const authenticate = require('./middleware/auth'); 

const { userPost, userLogin, validateUserPin } = require('./controllers/UserController');
const { profilePost, profileGet, profilePut, profileDelete, validatePin, getProfileById } = require('./controllers/ProfileController');
const { playlistPost, playlistGetAll, playlistGetById, playlistPut, playlistDelete,playlistGetByProfileId } = require('./controllers/PlaylistController');
const { videoPost, videoGet, videoGetById, videoPut, videoDelete } = require('./controllers/VideoController');


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

// User Routes
app.post('/api/user', userPost); 
app.post('/api/user/login', userLogin ); 
app.post('/api/user/validateUserPin', authenticate,authorizeRole(['parent']), validateUserPin);

// Profiles Routes
app.post('/api/profile' ,authenticate,authorizeRole(['parent']), profilePost); 
app.put('/api/profile/:id' ,authenticate,authorizeRole(['parent']), profilePut); 
app.get('/api/profile/' ,authenticate, profileGet); 
app.delete('/api/profile/:id' ,authenticate,authorizeRole(['parent']), profileDelete);
app.post('/api/profile/validatePin/:profileId', authenticate, validatePin);
app.get('/api/profile/:id' ,authenticate, getProfileById); 

// Playlist Routes
app.post('/api/playlist' ,authenticate, playlistPost); 
app.put('/api/playlist/:id' ,authenticate, playlistPut); 
app.get('/api/playlists' ,authenticate, playlistGetAll);
app.get('/api/playlist/:id',authenticate, playlistGetById);
app.get('/api/playlist/profile/:profileId',authenticate, playlistGetByProfileId);
app.delete('/api/playlist/:id' ,authenticate, playlistDelete); 

// Video Routes
app.post('/api/video' , authenticate, authorizeRole(['parent']),videoPost); 
app.put('/api/video/:id' ,authenticate, videoPut); 
app.get('/api/video' ,authenticate, videoGet);
app.get('/api/video/:id' ,authenticate, videoGetById);
app.delete('/api/video/:id',authenticate ,authorizeRole(['parent']), videoDelete);

// app.post('/api/users', userPost); // Esta ruta está duplicada


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});