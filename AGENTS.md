
## 1. Styling Rules
- Do NOT generate inline styles.
- All styling must be placed in the global stylesheet:
  - `src/styles/global.css`
- All components must reference CSS via `className`.
- Reuse existing classes before creating new ones.
- If a new class is needed, Zencoder must:
  1. Add the class to `global.css`
  2. Apply it in the component
- Hover, active, and focus states must be implemented in CSS only.

### Standard classes used across this project:
- `.standardbutton`
- `.standardtitlebar`
- `.standardinput`
- `.standardcard`
- `.standardlayout`

---

## 2. React Component Guidelines
- Must use **functional components**.
- Prefer named exports unless file convention suggests otherwise.
- File naming: `ComponentName.jsx`.
- Keep components small and readable.
- Import React:
  ```jsx
  import React from "react";

---
description: Repository Information Overview
alwaysApply: true
---

# HPS v1 - Repository Information Overview

## Repository Summary
HPS v1 is a full-stack MERN (MongoDB, Express, React, Node.js) application organized as a monorepo using npm workspaces. The project consists of a React frontend client with Vite build tooling and an Express backend server with MongoDB database integration using Mongoose ODM.

## Repository Structure

### Main Repository Components
- **client/**: React-based frontend application with Vite build system, routing, and API integration
- **server/**: Express.js backend API server with MongoDB connection, user management, and HOA-related data models
- **Root Configuration**: npm workspaces setup for unified dependency and script management across both projects

## Projects

### Client Project (React + Vite)
**Configuration Files**: `client/package.json`, `client/index.html`, `client/.env`

#### Language & Runtime
**Language**: JavaScript (ES6+ modules)  
**Runtime**: Node.js v18.12.0  
**Build System**: Vite v5.1  
**Package Manager**: npm  

#### Dependencies
**Main Dependencies**:
- react@^18.3.0 - UI library
- react-dom@^18.3.0 - React rendering
- react-router-dom@^6.15.0 - Client-side routing
- axios@^1.6.0 - HTTP client for API calls

**Development Dependencies**:
- vite@^5.1.0 - Build tool and dev server
- @vitejs/plugin-react@^4.2.0 - React JSX support for Vite

#### Build & Installation
```bash
# Install dependencies (from root or client directory)
npm install --workspace client

# Development server
npm run dev --workspace client

# Production build
npm run build --workspace client

# Preview production build
npm run preview --workspace client
```

#### Main Files & Resources
- **Entry point**: `client/src/main.jsx` - React app initialization with Router
- **App component**: `client/src/App.jsx` - Main application component
- **HTML template**: `client/index.html` - Vite entry point
- **API client**: `client/src/services/api.js` - Axios configuration for backend communication
- **Structure**:
  - `src/components/` - Reusable React components
  - `src/pages/` - Page-level components
  - `src/context/` - React context for state management
  - `src/hooks/` - Custom React hooks
  - `src/assets/` - Static assets
  - `src/services/` - API and external service integration

### Server Project (Express + Node.js)
**Configuration Files**: `server/package.json`, `server/.env`, `server/src/server.js`

#### Language & Runtime
**Language**: JavaScript (ES6+ modules)  
**Runtime**: Node.js v18.12.0  
**Framework**: Express.js v4.19  
**Package Manager**: npm  

#### Dependencies
**Main Dependencies**:
- express@^4.19.0 - Web framework
- mongoose@^7.3.1 - MongoDB ODM with schema validation
- cors@^2.8.5 - Cross-Origin Resource Sharing middleware
- dotenv@^16.0.0 - Environment variable management

**Development Dependencies**:
- nodemon@^3.0.1 - Auto-restart development server on file changes

#### Build & Installation
```bash
# Install dependencies (from root or server directory)
npm install --workspace server

# Start production server
npm start --workspace server

# Start development server with auto-reload
npm run dev --workspace server
```

#### Main Files & Resources
- **Entry point**: `server/src/server.js` - Express app initialization, middleware setup, routes configuration
- **Database connection**: `server/src/config/db.js` - MongoDB connection via Mongoose (localhost:27017/hps-v1)
- **Project structure**:
  - `src/controllers/` - Request handlers (userController.js)
  - `src/models/` - Mongoose schemas (User.js, Hoa.js, hoaUser.js)
  - `src/routes/` - API route definitions (userRoutes.js)
  - `src/middleware/` - Custom middleware (errorMiddleware.js)
  - `src/utils/` - Utility functions
- **API Base**: Express server runs on port 5002 (configurable via VITE_PORT env var)
- **Routes**: `/api/users` - User management endpoints

## Root Workspace Configuration

#### Package Manager
**npm workspaces** - Unified monorepo management

#### Scripts
- `npm run install-all` - Install dependencies across all workspaces
- `npm run dev` - Run both client (Vite dev) and server (nodemon) concurrently
- `npm start` - Run production builds of both client and server concurrently

#### Dependencies
- concurrently@^8.2.2 - Run multiple npm scripts in parallel
- dotenv@^17.2.3 - Environment variable management at root level

## Environment Configuration
Both client and server use `.env` files (excluded from git via .gitignore):
- `client/.env` - Client-side environment variables
- `server/.env` - Server-side environment variables (MongoDB URI, port configuration)

## Development Workflow
1. Install all dependencies: `npm install`
2. Configure environment variables in `client/.env` and `server/.env`
3. Ensure MongoDB is running on localhost:27017
4. Run both services concurrently: `npm run dev`
5. Client available at Vite dev server (typically http://localhost:5173)
6. Server API available at http://localhost:5002/api
