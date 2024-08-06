const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Helper function to get the next ID
const getNextId = (notes) => {
  const maxId = notes.reduce((max, note) => Math.max(max, note.id), 0);
  return maxId + 1; // Incrementing ID
};

// API route to get all notes
app.get('/api/notes', (req, res) => {
  fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read notes' });
    }
    res.json(JSON.parse(data));
  });
});

// API route to add a new note
app.post('/api/notes', (req, res) => {
  fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read notes' });
    }
    const notes = JSON.parse(data);
    const newNote = { id: getNextId(notes), ...req.body }; // Use next ID
    notes.push(newNote);
    fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to save note' });
      }
      res.json(newNote);
    });
  });
});

// API route to delete a note
app.delete('/api/notes/:id', (req, res) => {
  const noteId = parseInt(req.params.id, 10); // Parse noteId as an integer
  console.log('Attempting to delete note with ID:', noteId);

  fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Failed to read notes file.' });
    }

    let notes = JSON.parse(data);
    console.log('Notes before deletion:', notes);

    const originalLength = notes.length;
    notes = notes.filter(note => note.id !== noteId);

    if (notes.length === originalLength) {
      console.log('No note found with ID:', noteId);
      return res.status(404).json({ error: 'Note not found.' });
    }

    fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).json({ error: 'Failed to save notes file.' });
      }
      console.log('Note successfully deleted.');
      res.json({ message: 'Note deleted successfully' });
    });
  });
});

// HTML route to serve the notes page
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/notes.html'));
});

// HTML route to serve the index page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});