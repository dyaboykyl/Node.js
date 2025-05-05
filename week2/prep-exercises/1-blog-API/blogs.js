
import fsSync from 'fs';
import fs from 'fs/promises';

const BLOGS_DIR = "blogs"

function createBlogsDirectory() {
  if (fsSync.existsSync(BLOGS_DIR)) {
    return true;
  }
  return fs.mkdir(BLOGS_DIR);
}

export async function createBlogPost(req, res) {
  const { title, content } = req.body;
  const filename = `${BLOGS_DIR}/${title}`
  // validate the parameters
  if (!title || !content) {
    throw { statusCode: 400, body: "Missing title or content" }
  }
  if (typeof title !== "string") {
    throw { statusCode: 400, body: "Title must be a string" }
  }
  if (title.length >= 50) {
    throw { statusCode: 400, body: "Title must be less than 50 characters" }
  }

  // TODO: return error if file exists already

  await createBlogsDirectory();
  await fs.writeFile(filename, content);
  res.end('ok')
}

export async function getBlogPost(req, res) {
  const title = req.params.title;
  const filename = `${BLOGS_DIR}/${title}`
  if (!title) {
    throw { statusCode: 400, body: "Missing title" }
  }

  try {
    await fs.access(filename)
  } catch (error) {
    throw { statusCode: 404, body: "Not found" }
  }

  const file = await fs.readFile(filename, "utf8");
  res.json({ content: file })
}
