import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notesAPI } from '../services/api';
import NoteForm from '../components/NoteForm';
import NoteCard from '../components/NoteCard';

function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await notesAPI.getAll();
      setNotes(data);
    } catch (err) {
      setError('Failed to load notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (title, content) => {
    try {
      setError('');
      setSuccess('');
      const newNote = await notesAPI.create(title, content);
      setNotes([newNote, ...notes]);
      setShowForm(false);
      setSuccess('Note created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create note. Please try again.');
    }
  };

  const handleUpdate = async (id, title, content) => {
    try {
      setError('');
      setSuccess('');
      const updatedNote = await notesAPI.update(id, title, content);
      setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
      setEditingNote(null);
      setSuccess('Note updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update note. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await notesAPI.delete(id);
      setNotes(notes.filter(note => note.id !== id));
      setSuccess('Note deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete note. Please try again.');
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingNote(null);
  };

  return (
    <div className="container">
      <div className="notes-container">
        <div className="notes-header">
          <div>
            <h1>My Notes</h1>
            <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
              Welcome, {user?.username}!
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {!showForm && (
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                + New Note
              </button>
            )}
            <button className="btn btn-secondary" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {showForm && (
          <NoteForm
            note={editingNote}
            onSubmit={editingNote ? handleUpdate : handleCreate}
            onCancel={handleCancel}
          />
        )}

        {loading ? (
          <div className="loading">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <h3>No notes yet</h3>
            <p>Create your first note to get started!</p>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notes;

