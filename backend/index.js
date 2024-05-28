import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import postRoutes from './routes/post.js';
import { createPost } from './controller/post.js';
import { register } from './controller/auth.js';
import { verifyToken } from './middleware/auth.js';

/* configurations */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

/* file storage */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/assets');
    },
    filename: (req, file, cb) => {
        cb(null, req.body.name);
    }
});

const upload = multer({ storage: storage });

// We are storing the picture using the middleware before registering the user
app.post("/auth/register", upload.single("picture"), register);
app.post('/posts', verifyToken, upload.single('picture'), createPost);

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/posts', postRoutes);

const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URL)
.then(app.listen(port, () => {console.log('Server port: ' + port)}))
.catch(err => console.log(err));