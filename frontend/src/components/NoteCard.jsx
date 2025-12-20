function NoteCard({ note, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="note-card">
      <h3>{note.title}</h3>
      <div className="note-date">
        {note.updated_at !== note.created_at
          ? `Updated: ${formatDate(note.updated_at)}`
          : `Created: ${formatDate(note.created_at)}`}
      </div>
      <p>{note.content}</p>
      <div className="note-actions">
        <button
          className="btn btn-primary btn-small"
          onClick={() => onEdit(note)}
        >
          Edit
        </button>
        <button
          className="btn btn-danger btn-small"
          onClick={() => onDelete(note.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default NoteCard;

