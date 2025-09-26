import express from 'express';
import dotenv from 'dotenv';
import { connectMongo } from './db.js';
import productsRouter from './routes.products.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api', productsRouter);

export async function start() {
  await connectMongo();
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;


