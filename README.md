# Lost & Found Item Management System

A complete MERN stack web application for reporting and managing lost and found personal belongings on a college campus.

## Features
- **User Authentication:** Secure registration and login using JWT & bcrypt.
- **Report Items:** Add lost or found items with location, date, contact info, and description.
- **View & Search:** View all reported items or search by item name and category.
- **Manage Own Entries:** Update or delete your own reported items.
- **Secure Dashboard:** Protected routes ensuring only authenticated users can access the dashboard.
- **Clean UI:** Responsive design using React-Bootstrap.

## Tech Stack
- **Frontend:** React, Vite, React-Router-DOM, Axios, React-Bootstrap.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT, bcrypt, CORS, dotenv.

## Project Structure
- `backend/`: Contains the Express.js server, MongoDB models, routes, and authentication middleware.
- `frontend/`: Contains the React (Vite) application with pages and components.

## Local Development Setup

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables: The project already contains a `.env` file with a sample `MONGO_URI`. You can replace it with your own MongoDB Atlas URI if needed.
4. Start the backend server:
   ```bash
   node server.js
   # or `npm start` if added to package.json
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to the URL provided by Vite (usually `http://localhost:5173`).

## Deployment Instructions

### Preparing GitHub Deployment
The project is already initialized with Git.
1. Create a new repository on GitHub.
2. Link the local repository to GitHub and push the code:
   ```bash
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

### Deploying Backend to Render
1. Go to [Render](https://render.com/) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Add Environment Variables:
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: A secure secret key.
5. Deploy the service and copy the provided Render URL.

### Deploying Frontend to Render (or Vercel/Netlify)
1. Before deploying, update the `axios` base URL in the frontend components (`Login.jsx`, `Register.jsx`, `Dashboard.jsx`) to point to your new Render Backend URL instead of `http://localhost:5000`.
2. To deploy on Render, create a new **Static Site**.
3. Configure the service:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
4. Deploy the site.
