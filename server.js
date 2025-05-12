const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Mock data
let items = [
  {
    id: '1',
    title: 'Work Notes',
    description: 'Important meeting notes and project ideas',
    type: 'document',
    color: '#ffffff',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    metadata: {}
  },
  {
    id: '2',
    title: 'GitHub Repository',
    description: 'Main project repository',
    type: 'link',
    color: '#e8f0fe',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-10'),
    metadata: {
      url: 'https://github.com/username/repo'
    }
  },
  {
    id: '3',
    title: 'Database Credentials',
    description: 'Production database access',
    type: 'credential',
    color: '#fce8e6',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-12'),
    metadata: {
      username: 'admin',
      password: 'encrypted_password_here'
    }
  }
];

// Helper function to generate a new ID
const generateId = () => Date.now().toString();

// API Routes

// Get all items
app.get(['/api/items', '/api/items/'], (req, res) => {
  res.json(items);
});

// Get item by ID
app.get('/api/items/:id', (req, res) => {
  const item = items.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json(item);
});

// Create new item
app.post(['/api/items', '/api/items/'], (req, res) => {
  console.log('Received POST request to /api/items');
  console.log('Request body:', req.body);

  try {
    if (!req.body) {
      console.error('No request body received');
      return res.status(400).json({ error: 'No request body received' });
    }

    const newItem = {
      id: generateId(),
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Creating new item:', newItem);
    items.push(newItem);
    console.log('Item created successfully');
    
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item', details: error.message });
  }
});

// Update item
app.put(['/api/items/:id', '/api/items/:id/'], (req, res) => {
  const index = items.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  items[index] = {
    ...items[index],
    ...req.body,
    updatedAt: new Date()
  };
  
  res.json(items[index]);
});

// Delete item
app.delete('/api/items/:id', (req, res) => {
  const index = items.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  items.splice(index, 1);
  res.status(204).send();
});

// Update items order
app.put('/api/items/order', (req, res) => {
  const { itemIds } = req.body;
  const newItems = [];
  
  itemIds.forEach(id => {
    const item = items.find(i => i.id === id);
    if (item) {
      newItems.push(item);
    }
  });
  
  items = newItems;
  res.status(200).send();
});

// Search items
app.get('/api/items/search', (req, res) => {
  const query = req.query.query.toLowerCase();
  console.log('Searching for:', query);
  
  const results = items.filter(item => {
    // Search in unencrypted fields
    const titleMatch = item.title.toLowerCase().includes(query);
    
    // For metadata, only search in unencrypted fields
    const metadataMatch = item.metadata && (
      (item.metadata.url && item.metadata.url.toLowerCase().includes(query))
    );
    
    return titleMatch || metadataMatch;
  });
  
  console.log('Search results:', results.length);
  res.json(results);
});

// File upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({
    url: `/uploads/${req.file.filename}`,
    type: req.file.mimetype,
    size: req.file.size
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 