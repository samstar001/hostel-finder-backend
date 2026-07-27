# Off-Campus Hostel Finder — Backend

Group 16 · TechCrush Cohort 7 Capstone

## Status: Feature 1 — Project Setup & DB Connection ✅

## Stack
Node.js · Express.js · PostgreSQL · (Postman for testing)

## Setup

1. **Install dependencies**
   ```
   npm install
   ```

2. **Set up PostgreSQL**
   - Make sure PostgreSQL is installed and running locally.
   - Create the database:
     ```
     createdb hostel_finder
     ```
     (or via psql: `CREATE DATABASE hostel_finder;`)

3. **Environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your local DB credentials

4. **Run the server**
   ```
   npm run dev      # with nodemon, auto-restarts on file changes
   # or
   npm start        # plain node
   ```

5. **Confirm it's working**
   - Server should log: `Server running in development mode on port 5000`
   - In Postman (or a browser), hit:
     ```
     GET http://localhost:5000/api/health
     ```
   - Expected response:
     ```json
     {
       "success": true,
       "message": "API is running and database is connected",
       "database_time": "..."
     }
     ```
   - If `success` is `false`, the server is up but can't reach Postgres — check your `.env` values and that PostgreSQL is running.

## Project Structure

```
src/
├── config/db.js            # PostgreSQL connection pool
├── app.js                  # Express app + middleware + route mounting
├── routes/healthRoutes.js  # /api/health
├── controllers/healthController.js
└── middleware/errorHandler.js
server.js                   # entry point — starts the HTTP server
```

## Next Up
Feature 2 — Database Schema (users, listings, reviews, reports, inspection_requests tables + migrations)