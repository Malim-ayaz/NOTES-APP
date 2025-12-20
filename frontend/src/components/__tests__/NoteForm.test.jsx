import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteForm from '../NoteForm';

describe('NoteForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create form when no note is provided', () => {
    render(<NoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    expect(screen.getByText('Create New Note')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter note title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter note content')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('renders edit form when note is provided', () => {
    const mockNote = {
      id: 1,
      title: 'Existing Note',
      content: 'Existing content'
    };
    
    render(<NoteForm note={mockNote} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    expect(screen.getByText('Edit Note')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Note')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing content')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  it('calls onSubmit with title and content when form is submitted', async () => {
    const user = userEvent.setup();
    
    render(<NoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    await user.type(screen.getByPlaceholderText('Enter note title'), 'New Note');
    await user.type(screen.getByPlaceholderText('Enter note content'), 'New content');
    
    const submitButton = screen.getByText('Create');
    await user.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith('New Note', 'New content');
  });

  it('calls onSubmit with id, title and content when editing', async () => {
    const user = userEvent.setup();
    const mockNote = {
      id: 1,
      title: 'Existing Note',
      content: 'Existing content'
    };
    
    render(<NoteForm note={mockNote} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    await user.clear(screen.getByDisplayValue('Existing Note'));
    await user.type(screen.getByPlaceholderText('Enter note title'), 'Updated Note');
    
    const submitButton = screen.getByText('Update');
    await user.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith(1, 'Updated Note', 'Existing content');
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<NoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('trims whitespace from title and content before submitting', async () => {
    const user = userEvent.setup();
    
    render(<NoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    await user.type(screen.getByPlaceholderText('Enter note title'), '  Trimmed Title  ');
    await user.type(screen.getByPlaceholderText('Enter note content'), '  Trimmed Content  ');
    
    const submitButton = screen.getByText('Create');
    await user.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith('Trimmed Title', 'Trimmed Content');
  });
});

