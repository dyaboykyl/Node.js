import express from 'express';
import { createBlogPost, getBlogPost } from './blogs.js';

const app = express();
app.use(express.json());

async function safeRespond(req, res, callback) {
  try {
    await callback(req, res);
  } catch (error) {
    console.log(error);
    res.statusCode = error.statusCode || 500;
    res.write(error.body || "Unknown")
  } finally {
    res.end();
  }
}

// YOUR CODE GOES IN HERE
app.get('/', function (req, res) {
  res.send('Hello World')
})

app.get('/blogs/:title', async (req, res) => {
  await safeRespond(req, res, getBlogPost);
});

app.post('/blogs', async (req, res) => {
  await safeRespond(req, res, createBlogPost);
});

export default app;