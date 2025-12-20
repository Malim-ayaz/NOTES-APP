import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteCard from '../NoteCard';

describe('NoteCard', () => {
  const mockNote = {
    id: 1,
    title: 'Test Note',
    content: 'This is a test note content',
    created_at: '2024-01-01T12:00:00',
    updated_at: '2024-01-01T12:00:00'
  };

  it('renders note title and content', () => {
    render(<NoteCard note={mockNote} onEdit={vi.fn()} onDelete={vi.fn()} />);
    
    expect(screen.getByText('Test Note')).toBeInTheDocument();
    expect(screen.getByText('This is a test note content')).toBeInTheDocument();
  });

  it('calls onEdit when Edit button is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    
    render(<NoteCard note={mockNote} onEdit={onEdit} onDelete={vi.fn()} />);
    
    const editButton = screen.getByText('Edit');
    await user.click(editButton);
    
    expect(onEdit).toHaveBeenCalledWith(mockNote);
  });

  it('calls onDelete when Delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    
    render(<NoteCard note={mockNote} onEdit={vi.fn()} onDelete={onDelete} />);
    
    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);
    
    expect(onDelete).toHaveBeenCalledWith(mockNote.id);
  });

  it('displays created date when created_at equals updated_at', () => {
    render(<NoteCard note={mockNote} onEdit={vi.fn()} onDelete={vi.fn()} />);
    
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
  });

  it('displays updated date when updated_at differs from created_at', () => {
    const updatedNote = {
      ...mockNote,
      updated_at: '2024-01-02T12:00:00'
    };
    
    render(<NoteCard note={updatedNote} onEdit={vi.fn()} onDelete={vi.fn()} />);
    
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });
});

