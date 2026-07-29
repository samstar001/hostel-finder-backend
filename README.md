# Off-Campus Hostel Finder — Backend

Group 16 · TechCrush Cohort 7 Capstone

## Stack
Node.js (ESM) · Express.js · PostgreSQL · Prisma ORM (v6.19.2) · JWT · bcrypt · Postman

## Status

| Feature | Status |
|---|---|
| Project setup & DB connection | ✅ Done |
| Database schema (Prisma) | ✅ Done |
| Auth (register/login, JWT, role middleware) | ✅ Done |
| Listings CRUD | ✅ Done |
| Search & filter | 🔧 In progress |
| Photo upload | ⬜ Not started |
| Reviews | ⬜ Not started |
| Verification flow | ⬜ Not started |
| Reports (scam flagging) | ⬜ Not started |
| Inspection requests | ⬜ Not started |

## Setup

1. **Install dependencies**
   ```
   npm install
   ```

2. **Set up PostgreSQL**
   - Ensure PostgreSQL is running locally
   - Create the database: `createdb hostel_finder_db`

3. **Environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your DB credentials and generate a real `JWT_SECRET`:
     ```
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```

4. **Run migrations**
   ```
   npx prisma migrate dev
   ```

5. **Run the server**
   ```
   npm run dev
   ```

6. **Confirm it's working**
   ```
   GET http://localhost:5000/api/health
   ```
   Expect `{ "success": true, "database_time": "..." }`

## Project Structure

```
src/
├── config/
│   ├── db.js              # raw PostgreSQL pool (used by health check)
│   └── prismaClient.js    # shared Prisma Client instance
├── controllers/
│   ├── healthController.js
│   ├── authController.js
│   └── listingController.js
├── routes/
│   ├── healthRoutes.js
│   ├── authRoutes.js
│   └── listingRoutes.js
├── middleware/
│   ├── auth.js            # verifies JWT, attaches req.user
│   ├── roleCheck.js       # restricts routes by role
│   └── errorHandler.js
├── utils/
│   ├── hashPassword.js
│   └── generateToken.js
└── app.js
prisma/
├── schema.prisma          # User, Listing, Review, Report, InspectionRequest
└── migrations/
server.js
```

## API Endpoints (so far)

### Health
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/health` | Public |

### Auth
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |

### Listings
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/listings` | Public |
| GET | `/api/listings/:id` | Public |
| POST | `/api/listings` | Landlord only |
| PUT | `/api/listings/:id` | Landlord only (own listings) |
| DELETE | `/api/listings/:id` | Landlord only (own listings) |

## Branching workflow
Each feature is built on its own branch off `develop` (e.g. `feat/5-search-filter`), opened as a PR into `develop`, and merged once tested. `develop` merges into `main` at project completion.

## Next Up
Search & filter query parameters on `GET /api/listings` (school, price range, location, amenities).


