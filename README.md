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

### 2. MySQL Installation
1. Visit [MySQL Community Downloads](https://dev.mysql.com/downloads/mysql/)
2. Download MySQL Installer for Windows
3. Run the installer and select:
   - Choose "Custom" installation
   - Select MySQL Server, MySQL Workbench, and Connector/J
   - Click "Next" through installation steps
   - Set root password (remember this for later)
   - Complete the setup wizard
4. Verify installation by opening MySQL Workbench and connecting to your local instance

### 3. Git Installation (Optional, for version control)
1. Visit [Git Download](https://git-scm.com/downloads)
2. Download Git for Windows
3. Run the installer with default options
4. Verify installation:
   ```bash
   git --version
   ```

## Database Setup

1. Start MySQL service:
   - Open Command Prompt as Administrator
   - Run:
     ```bash
     net start MySQL80
     ```
   - Or check Services (Windows + R, type "services.msc") and ensure MySQL is running

2. Create the database automatically using the script:
   ```bash
   cd backend
   node scripts/createDatabase.js
   ```
   
   Or manually using MySQL Workbench:
   - Open MySQL Workbench
   - Connect to your local MySQL instance
   - Create a new query and execute:
     ```sql
     CREATE DATABASE IF NOT EXISTS blog_app;
     ```

## Project Setup

### 1. Clone the Project

```bash
git clone https://github.com/yourusername/blog.git
cd blog
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
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=blog_app
   DB_DIALECT=mysql
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

4. Create database tables and admin user:
   ```bash
   node scripts/createDatabase.js
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
   REACT_APP_API_URL=http://localhost:5000/api/v1
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
- Backend API: http://localhost:5000/api/v1
- Admin Dashboard: http://localhost:3000/admin
  - Login with admin credentials:
    - Email: admin@admin.com
    - Password: admin123

## Common Issues and Solutions

### MySQL Connection Issues
1. Error: "Connection refused"
   - Ensure MySQL service is running
   - Check if the connection details in .env are correct
   - Verify MySQL is running on default port 3306

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
  - DB_HOST
  - DB_USER
  - DB_PASSWORD
  - DB_NAME
  - DB_DIALECT
  - JWT_SECRET
  - NODE_ENV

- Frontend (.env):
  - REACT_APP_API_URL

For any additional help or issues, please refer to the project repositories or create an issue on GitHub. 