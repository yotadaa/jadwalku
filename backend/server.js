const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};

app.use(cors());
app.use(express.json());

const uri = `mongodb://dbmukhtada:${process.env.PASSWD}@ac-uooee3m-shard-00-00.q54xpf0.mongodb.net:27017,ac-uooee3m-shard-00-01.q54xpf0.mongodb.net:27017,ac-uooee3m-shard-00-02.q54xpf0.mongodb.net:27017/?ssl=true&replicaSet=atlas-7qzzer-shard-0&authSource=admin&retryWrites=true&w=majority
`
mongoose.connect(uri, { useNewUrlParser: true })

const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully")
});

const jadwalRouter = require('./routes/jadwal');
const usersRouter = require('./routes/users');
const tugasRouter = require('./routes/tugas');

app.use('/jadwal', jadwalRouter);
app.use('/users', usersRouter);
app.use('/tugas', tugasRouter);

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port: ${port}`);
});