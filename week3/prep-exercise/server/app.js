import dotenv from 'dotenv';
import express from 'express';
import { getProfile, login, logout, register } from './users.js';

dotenv.config();

// TODO Use below import statement for importing middlewares from users.js for your routes
// TODO import { ....... } from "./users.js";

let app = express();

app.use(express.json()); // body-parsing middleware
// logging middleware
// auth middleware
// metrics middleware
// what else?


// Serve the front-end application from the `client` folder
app.use(express.static('client'));

async function safeRespond(req, res, callback) {
  try {
    await callback(req, res);
  } catch (error) {
    console.log(error);
    res.statusCode = error.statusCode || 500;
    res.json({
      message: error.body || "Unknown"
    })
  } finally {
    res.end();
  }
}

// check out NextJS: popular routing and server-side rendering framework

app.post('/auth/register', async (req, res) => safeRespond(req, res, register));

app.post('/auth/login', async (req, res) => safeRespond(req, res, login));

app.post('/auth/logout', async (req, res) => safeRespond(req, res, logout));

app.get('/auth/profile', async (req, res) => safeRespond(req, res, getProfile));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
