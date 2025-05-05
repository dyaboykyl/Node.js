import fs from 'fs/promises';
import supertest from "supertest";
import app from "../app.js";

const server = supertest(app);

// triple A
// Arrange - setting up the test situation
// Act - triggering an action
// Assert - checking the result

describe("POST /", () => {
  it(`should respond with "Hello World"`, (done) => {
    server.get('/')
      .expect(200, 'Hello World', done);
  });
});

describe("POST /blogs", () => {

  let request;

  beforeEach(() => {
    request = {
      title: "Test Title",
      content: "Test Content"
    }
  })

  const post = () => server.post("/blogs").send(request);

  it(`when not title it should respond with 400 and error message`, (done) => {
    delete request.title;

    post()

      .expect(400, 'Missing title or content', done);
  });

  it(`when not content it should respond with 400 and error message`, (done) => {
    delete request.content;

    post()

      .expect(400, 'Missing title or content', done);
  });

  it(`when title is not string it should respond with 400 and error message`, (done) => {
    request.title = 42;

    post()

      .expect(400, 'Title must be a string', done);
  });

  it(`when title is too long it should respond with 400 and error message`, (done) => {
    request.title = 'x'.repeat(50);

    post()

      .expect(400, 'Title must be less than 50 characters', done);
  });

  it(`when valid request should write blog post to fs`, (done) => {
    post()

      .expect(200, 'ok')
      .end(async function (err, res) {
        // we should be mocking out the file system and not interacting with it in tests !!
        const blogPost = await fs.readFile(request.title);
        expect(blogPost.toString()).toBe(request.content);

        if (err) return done(err);
        return done();
      });;

  })
});


describe("GET /blogs/{title}", () => {

  const get = (title) => server.get(`/blogs/${title}`);

  it(`when post doesn't exist it should respond with 404`, (done) => {
    get("fake title")

      .expect(404, {}, done);
  });

  it('when valid request returns blog post', (done) => {
    get('Test Title')

      .expect(200, { content: 'Test Content' }, done)
  })
});