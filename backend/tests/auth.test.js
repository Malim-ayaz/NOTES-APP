const request = require('supertest');
const app = require('../server');
const { getDatabase } = require('../database');

describe('Authentication Routes', () => {
  let testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  };

  beforeEach((done) => {
    // Clean up test data
    const db = getDatabase();
    db.serialize(() => {
      db.run('DELETE FROM notes', () => {
        db.run('DELETE FROM users', () => {
          done();
        });
      });
    });
  });

  describe('POST /auth/signup', () => {
    it('should create a new user with valid data', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.username).toBe(testUser.username);
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should reject signup with existing email', async () => {
      // Create first user
      await request(app)
        .post('/auth/signup')
        .send(testUser);

      // Try to create duplicate
      const res = await request(app)
        .post('/auth/signup')
        .send(testUser);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject signup with invalid email', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should reject signup with short password', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '12345'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should reject signup with short username', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({
          username: 'ab',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app)
        .post('/auth/signup')
        .send(testUser);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should reject login with invalid email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'wrong@example.com',
          password: testUser.password
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject login with invalid password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject login with invalid email format', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: testUser.password
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });
});

