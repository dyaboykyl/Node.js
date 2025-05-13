import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import newDatabase from './database.js';

const SALT_ROUNDS = 12;

// Change this boolean to true if you wish to keep your
// users between restart of your application
const isPersistent = false
const database = newDatabase({ isPersistent })

function validateUsername(username) {
  // stateless validation
  if (!username) {
    throw { statusCode: 400, body: "Missing username" }
  }
  if (typeof username !== "string") {
    throw { statusCode: 400, body: "Username must be a string" }
  }
  if (username.length < 3 || username.length >= 16) {
    throw { statusCode: 400, body: "Username must be between 3 and 16 characters" }
  }
  // validate the pattern using regular expressions
  // Must start with a letter
  if (!/^[a-zA-Z].*/.test(username)) {
    throw { statusCode: 400, body: "Username must start with a letter" }
  }
}

function validatePassword(password) {
  if (!password) {
    throw { statusCode: 400, body: "Missing password" }
  }
  if (typeof password !== "string") {
    throw { statusCode: 400, body: "password must be a string" }
  }
  if (password.length < 8 || password.length >= 16) {
    throw { statusCode: 400, body: "Password must between 8 and 16 characters" }
  }
  // TODO: validate password pattern with regular expression
}

// Testing
// blackbox - unaware of application internals
// whitebox - unit testing, aware of exactly how things are implemented

export async function register(req, res) {
  const { username, password } = req.body;
  console.log(`[register] username: ${username}`);

  // validate the request
  validateUsername(username);
  validatePassword(password);

  // stateful validation
  // validate the username is not taken
  const existingUser = database.getByUsername(username);
  if (existingUser) {
    throw { statusCode: 400, body: "Username is taken" }
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // create a user in the database
  const user = database.create({
    username,
    hashedPassword
  })

  // optional: login and return jwt token immediately

  console.log(`[register] success id: ${user.id} username: ${username}`);
  res.json({
    id: user.id,
    username
  });
}

export async function login(req, res) {
  // extract username and password
  const { username, password } = req.body;
  console.log(`[login] username: ${username}`);

  // validate the request
  if (!username | !password) {
    throw { statusCode: 400, body: "Missing username or password" }
  }

  // lookup user in database - how?
  const user = database.getByUsername(username);
  if (!user) {
    throw { statusCode: 404, body: "User not found" }
  }

  // validate password
  const valid = await bcrypt.compare(password, user.hashedPassword);
  if (!valid) {
    throw { statusCode: 401, body: "Wrong password" } // also common to throw 404 here to protect user data
  }

  // generate token
  const token = jwt.sign({
    // useful information goes here
    id: user.id,
    isAdmin: false
  }, process.env.SECRET_JWT_KEY);

  console.log(`[login] success username: ${username} token: ${token}`)
  // return the token to user with status
  res.json({
    token,
  })
}

// Improvement: JWT middleware that handles authentication automatically
export async function getProfile(req, res) {
  const authHeader = req.headers['authorization'];
  console.log(`[getProfile] auth: ${authHeader}`)

  // extract and validate JWT using secret key
  const token = authHeader.replace('Bearer ', '');

  // verify: runs a mathematical algorithm: token + secret key 
  let data;
  try {
    data = jwt.verify(token, process.env.SECRET_JWT_KEY);
  } catch (error) {
    console.log(`[getProfile] error: ${error}`);
    throw { statusCode: 401, body: "Unauthorized" }
  }

  console.log(`[getProfile] decoded token. data: ${JSON.stringify(data)}`);
  // lookup user with ID
  const user = database.getById(data.id);
  if (!user) {
    throw { statusCode: 404, body: "User not found" }
  }

  // return user
  res.json({
    message: `Username: ${user.username}`
  })
}

export function logout(req, res) {
  const authHeader = req.headers['authorization'];
  console.log(`[logout] auth: ${authHeader}`);

  // optional: invalidate the token
  res.json({ message: 'Logout successful' });
}