# VaultX Server

This is a mock server for the VaultX application, providing API endpoints for managing vault items.

## Features

- RESTful API endpoints for CRUD operations
- File upload support
- Search functionality
- Mock data for testing
- CORS enabled for local development

## API Endpoints

- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `PUT /api/items/order` - Update items order
- `GET /api/items/search` - Search items
- `POST /api/upload` - Upload file

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create uploads directory:
```bash
mkdir -p public/uploads
```

3. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on http://localhost:3000

## Mock Data

The server includes mock data for testing:
- Sample documents
- Links
- Credentials

## Error Handling

The server includes basic error handling for:
- 404 Not Found
- 400 Bad Request
- 500 Internal Server Error

## File Upload

Uploaded files are stored in the `public/uploads` directory with unique filenames.