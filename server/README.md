# AIVA Server

This is the backend server for the AIVA (AI Virtual Assistant) application. It provides APIs for user authentication, task management, workspace management, and other core functionalities.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Firebase Admin SDK credentials
- Gmail account for email notifications

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=production
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=8800
CORS_ORIGIN=https://aiva-web.vercel.app
GMAIL_USER=your_gmail
GMAIL_PASS=your_app_specific_password
CLIENT_URL=https://aiva-web.vercel.app

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id

# Firebase Admin SDK
FIREBASE_ADMIN_TYPE=service_account
FIREBASE_ADMIN_PROJECT_ID=your_firebase_project_id
FIREBASE_ADMIN_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
FIREBASE_ADMIN_CLIENT_ID=your_client_id
FIREBASE_ADMIN_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_ADMIN_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_ADMIN_CLIENT_X509_CERT_URL=your_client_cert_url
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/aiva-server.git
cd aiva-server
```

2. Install dependencies:
```bash
npm install
```

3. Create the uploads directory:
```bash
mkdir uploads
```

## Development

To run the server in development mode:

```bash
npm run dev
```

## Production

To run the server in production mode:

```bash
npm start
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- POST /api/auth/logout - Logout user
- GET /api/auth/me - Get current user

### Tasks
- GET /api/tasks - Get all tasks
- POST /api/tasks - Create a new task
- GET /api/tasks/:id - Get task by ID
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task

### Workspaces
- GET /api/workspaces - Get all workspaces
- POST /api/workspaces - Create a new workspace
- GET /api/workspaces/:id - Get workspace by ID
- PUT /api/workspaces/:id - Update workspace
- DELETE /api/workspaces/:id - Delete workspace

### Notifications
- GET /api/notifications - Get all notifications
- POST /api/notifications - Create a new notification
- PUT /api/notifications/:id - Mark notification as read
- DELETE /api/notifications/:id - Delete notification

### Notes
- GET /api/notes - Get all notes
- POST /api/notes - Create a new note
- GET /api/notes/:id - Get note by ID
- PUT /api/notes/:id - Update note
- DELETE /api/notes/:id - Delete note

## Deployment

1. Set up your environment variables in your hosting platform
2. Install dependencies: `npm install`
3. Start the server: `npm start`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
