# Bitespeed Identity Reconciliation Service

## Overview

This is a Node.js/Express.js implementation of Bitespeed's backend task for identity reconciliation. The service consolidates contact information based on email and phone number, linking related contacts while maintaining a clear primary-secondary relationship.

## Features

- Identity reconciliation based on email and phone number
- Contact consolidation with primary-secondary relationship
- REST API endpoint for contact identification
- MongoDB data storage
- Robust error handling

## API Endpoint

### `POST /identify`

Consolidates contact information and returns the linked contact details.

**Request Body:**
```json
{
  "email": "string",
  "phoneNumber": "string"
}
```
(At least one of email or phoneNumber must be provided)

**Successful Response:**
```json
{
  "contact": {
    "primaryContatctId": "number",
    "emails": ["string"],
    "phoneNumbers": ["string"],
    "secondaryContactIds": ["number"]
  }
}
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone git@github.com:Mayurwagh98/bitespeed.git
cd bitespeed
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following content:
```
MONGODB_URI=mongodb://localhost:27017/bitespeed
PORT=8000
```

## Running the Application

Start the development server:
```bash
npm start
```

The server will start on `http://localhost:3000`.

## Testing

You can test the API using tools like Postman or cURL:

Example request:
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "mcfly@hillvalley.edu", "phoneNumber": "123456"}'
```

## Project Structure

```
bitespeed/
├── config/           - Configuration files
├── controllers/      - Route controllers
├── models/           - MongoDB models
├── routes/           - Express routes
├── services/         - Business logic
├── app.js            - Main application file
├── package.json      - NPM dependencies
└── .env              - Environment variables
```

## Database Schema

The application uses a MongoDB collection `contacts` with the following schema:

- `phoneNumber`: String (optional)
- `email`: String (optional)
- `linkedId`: ObjectId (reference to another contact)
- `linkPrecedence`: String ('primary' or 'secondary')
- `createdAt`: Date
- `updatedAt`: Date
- `deletedAt`: Date (for soft deletion)

## Error Handling

The API returns appropriate HTTP status codes:
- 400 for bad requests
- 500 for server errors
- 200 for successful operations

## Future Improvements

1. Add unit and integration tests
2. Implement rate limiting
3. Add API documentation with Swagger
4. Implement caching for frequent queries
5. Add input validation middleware
6. Support for bulk operations
