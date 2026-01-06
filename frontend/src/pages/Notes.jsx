import { useState, useEffect, useCallback } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const { user, logout } = useAuth();

  const fetchNotes = useCallback(async (currentPage = 1, search = '') => {
    try {
      setLoading(true);
      setError('');
      const data = await notesAPI.getAll(currentPage, limit, search);
      setNotes(data.notes || []);
      setPagination(data.pagination || { total: 0, totalPages: 0 });
    } catch (err) {
      setError('Failed to load notes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchNotes(page, searchTerm);
  }, [page, fetchNotes]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchNotes(1, searchTerm);
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchNotes]);

  const handleCreate = async (title, content) => {
    let tempNote = null;
    try {
      setError('');
      setSuccess('');
      // Optimistic update
      tempNote = {
        id: Date.now(),
        title,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setNotes([tempNote, ...notes]);
      setShowForm(false);
      
      const newNote = await notesAPI.create(title, content);
      // Replace temp note with real note
      setNotes(prevNotes => prevNotes.map(n => n.id === tempNote.id ? newNote : n));
      setSuccess('Note created successfully!');
      setTimeout(() => setSuccess(''), 3000);
      // Refresh to get correct pagination
      fetchNotes(page, searchTerm);
    } catch (err) {
      // Revert optimistic update
      if (tempNote) {
        setNotes(prevNotes => prevNotes.filter(n => n.id !== tempNote.id));
      }
      setError(err.response?.data?.error || 'Failed to create note. Please try again.');
    }
  };

  const handleUpdate = async (id, title, content) => {
    let originalNote = null;
    try {
      setError('');
      setSuccess('');
      // Optimistic update
      originalNote = notes.find(n => n.id === id);
      setNotes(notes.map(note => 
        note.id === id 
          ? { ...note, title, content, updated_at: new Date().toISOString() }
          : note
      ));
      setEditingNote(null);
      
      const updatedNote = await notesAPI.update(id, title, content);
      setNotes(prevNotes => prevNotes.map(note => note.id === updatedNote.id ? updatedNote : note));
      setSuccess('Note updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Revert optimistic update
      if (originalNote) {
        setNotes(prevNotes => prevNotes.map(note => note.id === id ? originalNote : note));
      }
      setError(err.response?.data?.error || 'Failed to update note. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    let deletedNote = null;
    try {
      setError('');
      setSuccess('');
      // Optimistic update
      deletedNote = notes.find(n => n.id === id);
      setNotes(notes.filter(note => note.id !== id));
      
      await notesAPI.delete(id);
      setSuccess('Note deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      // Refresh to get correct pagination
      fetchNotes(page, searchTerm);
    } catch (err) {
      // Revert optimistic update
      if (deletedNote) {
        setNotes(prevNotes => [...prevNotes, deletedNote].sort((a, b) => 
          new Date(b.updated_at) - new Date(a.updated_at)
        ));
      }
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

        {/* Search Bar */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>

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
            <h3>{searchTerm ? 'No notes found' : 'No notes yet'}</h3>
            <p>{searchTerm ? 'Try a different search term' : 'Create your first note to get started!'}</p>
          </div>
        ) : (
          <>
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
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: '10px',
                marginTop: '20px',
                padding: '20px'
              }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  Previous
                </button>
                <span style={{ padding: '0 15px' }}>
                  Page {page} of {pagination.totalPages} ({pagination.total} total)
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages || loading}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Notes;

