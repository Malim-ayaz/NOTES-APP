const request = require('supertest');
const app = require('../server');
const { getDatabase } = require('../database');

describe('Notes Routes', () => {
  let authToken;
  let userId;
  let testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  };

  beforeEach(async () => {
    // Clean up test data
    const db = getDatabase();
    await new Promise((resolve) => {
      db.serialize(() => {
        db.run('DELETE FROM notes', () => {
          db.run('DELETE FROM users', () => {
            resolve();
          });
        });
      });
    });

    // Create a user and get auth token
    const signupRes = await request(app)
      .post('/auth/signup')
      .send(testUser);

    authToken = signupRes.body.token;
    userId = signupRes.body.user.id;
  });

  describe('POST /notes', () => {
    it('should create a new note with valid data', async () => {
      const res = await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Note',
          content: 'This is a test note'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Test Note');
      expect(res.body.content).toBe('This is a test note');
      expect(res.body.user_id).toBe(userId);
    });

    it('should reject note creation without authentication', async () => {
      const res = await request(app)
        .post('/notes')
        .send({
          title: 'Test Note',
          content: 'This is a test note'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should reject note creation with empty title', async () => {
      const res = await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '',
          content: 'This is a test note'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should reject note creation with empty content', async () => {
      const res = await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Note',
          content: ''
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('GET /notes', () => {
    it('should get all notes for authenticated user', async () => {
      // Create a note first
      await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Note 1',
          content: 'Content 1'
        });

      await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Note 2',
          content: 'Content 2'
        });

      const res = await request(app)
        .get('/notes')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    it('should return empty array when user has no notes', async () => {
      const res = await request(app)
        .get('/notes')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should reject request without authentication', async () => {
      const res = await request(app)
        .get('/notes');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /notes/:id', () => {
    let noteId;

    beforeEach(async () => {
      // Create a note for update tests
      const res = await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Original Title',
          content: 'Original Content'
        });
      noteId = res.body.id;
    });

    it('should update a note with valid data', async () => {
      const res = await request(app)
        .put(`/notes/${noteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
          content: 'Updated Content'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Updated Title');
      expect(res.body.content).toBe('Updated Content');
    });

    it('should update only title when only title is provided', async () => {
      const res = await request(app)
        .put(`/notes/${noteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title Only'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Updated Title Only');
    });

    it('should reject update for non-existent note', async () => {
      const res = await request(app)
        .put('/notes/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title'
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject update without authentication', async () => {
      const res = await request(app)
        .put(`/notes/${noteId}`)
        .send({
          title: 'Updated Title'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('DELETE /notes/:id', () => {
    let noteId;

    beforeEach(async () => {
      // Create a note for delete tests
      const res = await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Note to Delete',
          content: 'This note will be deleted'
        });
      noteId = res.body.id;
    });

    it('should delete a note successfully', async () => {
      const res = await request(app)
        .delete(`/notes/${noteId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');

      // Verify note is deleted
      const getRes = await request(app)
        .get('/notes')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.body.length).toBe(0);
    });

    it('should reject delete for non-existent note', async () => {
      const res = await request(app)
        .delete('/notes/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject delete without authentication', async () => {
      const res = await request(app)
        .delete(`/notes/${noteId}`);

      expect(res.statusCode).toBe(401);
    });
  });
});

