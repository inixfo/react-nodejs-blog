# Blog Project Setup Documentation

## Table of Contents
1. [Prerequisites Installation](#prerequisites-installation)
2. [Database Setup](#database-setup)
3. [Project Setup](#project-setup)
4. [Running the Application](#running-the-application)
5. [Common Issues and Solutions](#common-issues-and-solutions)

## Prerequisites Installation

### 1. Node.js Installation
1. Visit [Node.js official website](https://nodejs.org/)
2. Download the LTS (Long Term Support) version for Windows
3. Run the installer and follow these steps:
   - Accept the license agreement
   - Choose the installation location
   - Click "Next" through the default options
   - Click "Install"
4. Verify installation by opening Command Prompt and typing:
   ```bash
   node --version
   npm --version
   ```

### 2. MongoDB Installation
1. Visit [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Download MongoDB Community Server for Windows
3. Run the installer and follow these steps:
   - Choose "Complete" installation
   - Check "Install MongoDB as a Service"
   - Click "Install"
4. Create a data directory:
   ```bash
   mkdir C:\data\db
   ```
5. Verify installation by opening Command Prompt and typing:
   ```bash
   mongod --version
   ```

### 3. Git Installation (Optional, for version control)
1. Visit [Git Download](https://git-scm.com/downloads)
2. Download Git for Windows
3. Run the installer with default options
4. Verify installation:
   ```bash
   git --version
   ```

## Database Setup

1. Start MongoDB service:
   - Open Command Prompt as Administrator
   - Run:
     ```bash
     net start MongoDB
     ```
   - Or check Services (Windows + R, type "services.msc") and ensure MongoDB is running

2. Create the database:
   - Open MongoDB Compass (installed with MongoDB)
   - Click "New Connection"
   - Use connection string: `mongodb://localhost:27017`
   - Click "Connect"
   - Create a new database named "blog"

## Project Setup

### 1. Clone the Project
Choose one of the three repositories based on your assigned part:

```bash
# For Authentication and User Management
git clone https://github.com/inixfo/blog-auth-user-management.git

# For Post and Comment Management
git clone https://github.com/inixfo/blog-post-comment-management.git

# For Admin UI and Components
git clone https://github.com/inixfo/blog-admin-ui-components.git
```

### 2. Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/blog
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. Create admin user:
   ```bash
   node scripts/createAdmin.js
   ```
   This will create an admin user with:
   - Email: admin@admin.com
   - Password: admin123

### 3. Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

## Running the Application

### 1. Start Backend Server
1. Open a terminal in the backend directory:
   ```bash
   cd backend
   npm start
   ```
   The server will start on http://localhost:5000

### 2. Start Frontend Development Server
1. Open another terminal in the frontend directory:
   ```bash
   cd frontend
   npm start
   ```
   The application will open in your default browser at http://localhost:3000

### 3. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Admin Dashboard: http://localhost:3000/admin
  - Login with admin credentials:
    - Email: admin@admin.com
    - Password: admin123

## Common Issues and Solutions

### MongoDB Connection Issues
1. Error: "MongoDB connection failed"
   - Ensure MongoDB service is running
   - Check if the connection string is correct in .env
   - Verify MongoDB is running on port 27017

### Node.js Issues
1. Error: "node_modules not found"
   - Delete node_modules folder and package-lock.json
   - Run `npm install` again

### Frontend Issues
1. Error: "API connection failed"
   - Ensure backend server is running
   - Check if REACT_APP_API_URL is correct in .env
   - Verify no CORS issues in browser console

### Port Conflicts
1. Error: "Port 3000/5000 already in use"
   - Find and close the process using the port:
     ```bash
     # For Windows
     netstat -ano | findstr :3000
     taskkill /PID <PID> /F
     ```
   - Or use different ports in .env files

## Additional Notes

### Project Structure
```
project/
├── backend/
│   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── server.js
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── context/
│   │   │   └── services/
│   │   └── package.json
│   └── package.json
```

### Available Scripts
- Backend:
  - `npm start`: Start the server
  - `npm run dev`: Start with nodemon (development)

- Frontend:
  - `npm start`: Start development server
  - `npm run build`: Build for production
  - `npm test`: Run tests

### Environment Variables
Remember to set up all environment variables before running the application:
- Backend (.env):
  - PORT
  - MONGODB_URI
  - JWT_SECRET
  - NODE_ENV

- Frontend (.env):
  - REACT_APP_API_URL

For any additional help or issues, please refer to the project repositories or create an issue on GitHub. 