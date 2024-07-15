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
  const noteId = req.params.id.toString(); // Parse noteId as a string

  fs.readFile(path.join(__dirname, 'db.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).send(err);

    let notes = JSON.parse(data);
    notes = notes.filter(note => note.id !== noteId); // Compare as strings

    fs.writeFile(path.join(__dirname, 'db.json'), JSON.stringify(notes), (err) => {
      if (err) return res.status(500).send(err);
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