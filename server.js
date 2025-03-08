const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Habilitar CORS para permitir peticiones de diferentes puertos
app.use(cors());
app.use(express.json());  // Para poder recibir JSON en el cuerpo de la solicitud

// Almacén temporal de posts
let posts = [];

// Endpoint para obtener los posts
app.get('/api/posts', (req, res) => {
    res.json(posts);
});

// Endpoint para crear un nuevo post
app.post('/api/posts', (req, res) => {
    const { title, content, author } = req.body;
    const newPost = { title, content, author, profilePic: 'https://www.w3schools.com/w3images/avatar2.png' };
    posts.push(newPost);

    // Emitir el nuevo post a todos los clientes conectados
    io.emit('newPost', newPost);

    res.json({ post: newPost });
});

// Manejo de conexiones de socket
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Enviar los posts existentes al cliente recién conectado
    socket.emit('initialPosts', posts);

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

// Iniciar el servidor en el puerto 5000
server.listen(5000, () => {
    console.log('Servidor corriendo en http://localhost:5000');
});
