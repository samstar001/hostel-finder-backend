# Off-Campus Hostel Finder — Backend

Group 16 · TechCrush Cohort 7 Capstone

## Stack
Node.js (ESM) · Express.js · PostgreSQL · Prisma ORM (v6.19.2) · JWT · bcrypt · Resend (email) · Cloudinary (file storage) · Postman

## Architecture
REST API. All requests/responses are JSON. Versioned via URL prefix (`/api/v1`).

## Status

| Feature | Status |
|---|---|
| Project setup & DB connection | ✅ Done |
| Database schema (Prisma) | ✅ Done |
| Auth — registration (3-step, OTP-verified, role-aware) | ✅ Done |
| Auth — login | ✅ Done |
| Auth — password reset (3-step, OTP-verified) | ✅ Done |
| Role-based access control (JWT + role middleware) | ✅ Done |
| Listings CRUD | ✅ Done |
| Search & filter | ✅ Done |
| Photo upload (listings + profile pictures, via Cloudinary) | ✅ Done |
| Listing redesign (categorized photos, hostel rules, soft delete) | ✅ Done |
| Reviews | ✅ Done |
| Listing verification flow (admin approve/reject) | ✅ Done |
| Reports (scam flagging, categorized, with evidence upload) | ✅ Done |
| Production deployment (Render) | ✅ Done |
| Inspection requests | ⬜ Not started |

## Setup

1. **Install dependencies**
   ```
   npm install
   ```

2. **Set up PostgreSQL**
   - Ensure PostgreSQL is running locally
   - Create the database: `createdb hostel_finder_db`

3. **Environment variables** — copy `.env.example` to `.env` and fill in every value 
      - `JWT_SECRET` — generate with:
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
   GET http://localhost:5000/api/v1/health
   ```

## Project Structure

```
src/
├── config/
│   ├── prismaClient.js        # shared Prisma Client instance
│   └── cloudinaryUpload.js    # Cloudinary config + multer upload middleware
├── controllers/
│   ├── healthController.js
│   ├── authController.js
│   ├── listingController.js
│   ├── reviewController.js
│   ├── reportController.js
│   └── adminController.js
├── routes/
│   ├── healthRoutes.js
│   ├── authRoutes.js
│   ├── listingRoutes.js
│   ├── reviewRoutes.js        # nested under /listings/:id/reviews
│   ├── reportRoutes.js        # nested under /listings/:id/reports
│   └── adminRoutes.js
├── middleware/
│   ├── auth.js
│   ├── roleCheck.js
│   └── errorHandler.js
├── utils/
│   ├── hashPassword.js
│   ├── generateToken.js
│   ├── generateOtp.js
│   └── sendEmail.js
└── app.js
prisma/
├── schema.prisma
└── migrations/
server.js
```

## API Endpoints

Base URL: `/api/v1` — full request/response examples in `hostel-finder-api-docs.md`.

### Health
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/health` | Public |

### Auth
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/auth/register/initiate` | Public |
| POST | `/auth/register/verify-otp` | Public |
| POST | `/auth/register/complete` | Public |
| POST | `/auth/login` | Public |
| POST | `/auth/forgot-password` | Public |
| POST | `/auth/verify-reset-otp` | Public |
| POST | `/auth/reset-password` | Public |
| POST | `/auth/profile-picture` | Any authenticated user |

### Listings
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/listings` | Public (excludes soft-deleted; `?school=`, `?location=`, `?minPrice=`, `?maxPrice=`, `?amenities=`) |
| GET | `/listings/deleted` | Landlord only (own) |
| GET | `/listings/:id` | Public (excludes soft-deleted) |
| POST | `/listings` | Landlord only |
| PUT | `/listings/:id` | Landlord only (own) |
| DELETE | `/listings/:id` | Landlord only (own) — soft delete |
| POST | `/listings/:id/photos/{compound,room,kitchen,bathroom,toilet}` | Landlord only (own) |

### Reviews
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/listings/:id/reviews` | Any authenticated user (one per listing) |
| GET | `/listings/:id/reviews` | Public |

### Reports
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/listings/:id/reports` | Any authenticated user |
| POST | `/listings/:id/reports/:reportId/evidence` | Reporter only (own report) |

### Admin
*(All require `role: admin`)*
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/admin/listings/pending` | Admin |
| PATCH | `/admin/listings/:id/verify` | Admin |
| PATCH | `/admin/listings/:id/reject` | Admin |
| GET | `/admin/reports` | Admin |
| PATCH | `/admin/reports/:id/resolve` | Admin |

## Design Notes

**Auth:** JWT, stateless, `Authorization: Bearer <token>`, 7-day expiry, payload `{ id, role }` only. Registration and password reset are both 3-step OTP flows matching the product's UI. Incomplete signups live in `PendingRegistration`, never in `users`. Role-specific fields (`institution`/`housingPreference` for students, `homeAddress`/`nin` for landlords) are optional at the schema level, required by role in application code.

**Listings:** Photos are 5 named fields (compound/room/kitchen/bathroom/toilet), not a generic array — one upload endpoint per category. Deletes are soft (`isDeleted`/`deletedAt`); all public queries exclude soft-deleted rows.

**Reviews:** One review per user per listing, enforced by a database-level unique constraint — not just an application check — to avoid race conditions.

**Reports:** Structured `category` enum + free-text `description`, matching the product design. No uniqueness constraint — multiple different users reporting the same listing is a meaningful trust signal, not something to prevent. Evidence files uploaded separately, reporter-only.

**Admin:** Just a `role` value on the same `User` table — no separate login system, no public self-registration. Promoted directly in the database. Scope is intentionally limited to listing verification and report resolution — the full Figma admin flow (analytics, messaging, notifications, content management) is out of scope for this capstone.

## File Uploads (Cloudinary)
Free tier. Requires `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Allowed formats: jpg, jpeg, png, webp. Max 5MB/file. Used for: listing category photos, profile pictures, report evidence.

## Email (Resend)
OTP emails via Resend's shared test sender. Requires `RESEND_API_KEY`. Currently only deliverable to the email address the Resend account is registered under — a verified domain is needed for arbitrary recipients (a deployment-time task, not done yet).

## Deployment
Hosted on **Render** (free tier).

- **Live URL:** https://hostel-finder-backend-ht3x.onrender.com/api/v1
- **Database:** Render PostgreSQL (free tier)
- Deploys automatically from `main` on every push
- ⚠️ Free tier spins down after 15 min idle — first request after that may take 30–60s

### Deploying changes
1. Merge feature branch → `develop`, test locally
2. Merge `develop` → `main`
3. Push `main` — Render auto-deploys
4. If a new Prisma migration is included, apply it to production manually (Render's build only runs `prisma generate`, not `migrate deploy`):
   ```
   DATABASE_URL="<Render External DB URL>" npx prisma migrate deploy
   ```

## Environments
- **Development:** local, `http://localhost:5000/api/v1`
- **Production:** Render, `https://hostel-finder-backend-ht3x.onrender.com/api/v1`
- No separate staging environment

## Branching workflow
Feature branches off `develop`, descriptive names (e.g. `feat/reports`, not numbered), PR into `develop`, merged once tested. `develop` → `main` for releases/deploys.

## Next Up
Inspection requests (students requesting property viewings from landlords).

