import express from 'express'
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import userRouter from './routers/user.router';
import categoryRouter from './routers/category.router';
import publicRouter from './routers/public.router';
import clientRouter from './routers/client.router';
import printerRouter from './routers/printer.router';

const app = express()
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/printing_house')
  .then(() => {
    console.log('Connected to the database successfully!');
  })
  .catch((err) => {
    console.log('Connection error: ' + err);
  });

const router = express.Router();

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

router.use('/users',userRouter);
router.use('/categories', categoryRouter);
router.use('/products',publicRouter);
router.use('/client',clientRouter);
router.use('/printer',printerRouter);
app.use('/',router);

app.listen(4000, ()=>console.log("Express running on port 4000!"))