import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url'; // Import for ES modules
import cors from 'cors';
import { globalErrorHandler } from './utils/errorHandler.js';
import { connectDB } from './dbconnection/dbConnection.js';
import dockerRoute from './routes/userRoutes.js';

dotenv.config();

const app = express();

const port = process.env.PORT || 3060;

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'views' directory
app.use(express.static(path.join(__dirname, 'views')));

// Define routes for serving HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/services', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'services.html'));
});

app.get('/team', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'team.html'));
});

app.get('/testimonials', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'testimonials.html'));
});



app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

app.use('/app', dockerRoute);

app.use(globalErrorHandler);

const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    connectDB();
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use.`);
        process.exit(1);
    } else {
        throw error;
    }
});
