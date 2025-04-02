# AIVA

AIVA is a web application that combines a React frontend with a Node.js/Express backend.

## Project Structure

- `client/` - React frontend application
- `server/` - Node.js/Express backend server

## Features

- User authentication
- Task management
- Workspace organization
- Real-time notifications
- Note taking capabilities

## Tech Stack

### Frontend
- React
- Redux Toolkit
- TailwindCSS
- Vite

### Backend
- Node.js
- Express
- MongoDB
- Firebase

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-all
   ```
3. Start development servers:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```
MONGO_URI=your_mongodb_uri
GMAIL_USER=your_gmail
GMAIL_PASS=your_gmail_password
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
CLIENT_URL=http://localhost:5173
``` 