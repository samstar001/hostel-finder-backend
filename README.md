# Off-Campus Hostel Finder — Backend

Group 16 · TechCrush Cohort 7 Capstone

## Stack
Node.js (ESM) · Express.js · PostgreSQL · Prisma ORM (v6.19.2) · JWT · bcrypt · Resend (email) · Postman

## Architecture
REST API. All requests/responses are JSON. API is versioned via URL prefix (`/api/v1`).

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
| Reviews | ✅ Done |
| Listing verification flow (admin approve/reject) | ✅ Done |
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

3. **Environment variables** — copy `.env.example` to `.env` and fill in:
   - Database credentials
   - `JWT_SECRET` — generate with:
     ```
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```
   - `RESEND_API_KEY` — see Email section below
   - `RESET_PASSWORD_URL` — placeholder frontend URL until real one is provided

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
   Expect `{ "success": true, "database_time": "..." }`

## Project Structure

```
src/
├── config/
│   ├── db.js                  # raw PostgreSQL pool (used by health check)
│   ├── prismaClient.js        # shared Prisma Client instance
│   └── cloudinaryUpload.js    # Cloudinary config + multer upload middleware
├── controllers/
│   ├── healthController.js
│   ├── authController.js
│   ├── listingController.js
│   ├── reviewController.js
│   └── adminController.js
├── routes/
│   ├── healthRoutes.js
│   ├── authRoutes.js
│   ├── listingRoutes.js
│   ├── reviewRoutes.js        # nested under /listings/:id/reviews
│   └── adminRoutes.js
├── middleware/
│   ├── auth.js                # verifies JWT, attaches req.user
│   ├── roleCheck.js           # restricts routes by role
│   └── errorHandler.js
├── utils/
│   ├── hashPassword.js
│   ├── generateToken.js
│   ├── generateOtp.js
│   └── sendEmail.js           # Resend wrapper
└── app.js
prisma/
├── schema.prisma              # User, PendingRegistration, Listing, Review, Report, InspectionRequest
└── migrations/
server.js
```

## API Endpoints

Base URL: `/api/v1`

### Health
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/health` | Public |

### Auth — Registration (3-step)
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/auth/register/initiate` | Public |
| POST | `/auth/register/verify-otp` | Public |
| POST | `/auth/register/complete` | Public |

### Auth — Login & Password Reset
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/auth/login` | Public |
| POST | `/auth/forgot-password` | Public |
| POST | `/auth/verify-reset-otp` | Public |
| POST | `/auth/reset-password` | Public |
| POST | `/auth/profile-picture` | Any authenticated user |

### Listings
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/listings` | Public (excludes soft-deleted; supports `?school=`, `?location=`, `?minPrice=`, `?maxPrice=`, `?amenities=`) |
| GET | `/listings/deleted` | Landlord only (own deleted listings) |
| GET | `/listings/:id` | Public (excludes soft-deleted) |
| POST | `/listings` | Landlord only |
| PUT | `/listings/:id` | Landlord only (own listings) |
| DELETE | `/listings/:id` | Landlord only (own listings) — soft delete |
| POST | `/listings/:id/photos/compound` | Landlord only (own listings) |
| POST | `/listings/:id/photos/room` | Landlord only (own listings) |
| POST | `/listings/:id/photos/kitchen` | Landlord only (own listings) |
| POST | `/listings/:id/photos/bathroom` | Landlord only (own listings) |
| POST | `/listings/:id/photos/toilet` | Landlord only (own listings) |

### Reviews
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/listings/:id/reviews` | Any authenticated user (one review per listing) |
| GET | `/listings/:id/reviews` | Public |

### Admin
*(All routes require `role: admin`)*
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/admin/listings/pending` | Admin only |
| PATCH | `/admin/listings/:id/verify` | Admin only |
| PATCH | `/admin/listings/:id/reject` | Admin only |



## Auth Design Notes

- **JWT**, stateless, `Authorization: Bearer <token>`, 7-day expiry, payload limited to `{ id, role }`
- **Registration** is 3 steps to match the product's actual UI (Create Account → Verify Email OTP → Complete Registration with password). Incomplete signups live in a separate `PendingRegistration` table, never in `users`, until verified and completed.
- **Role-specific fields**: students get `institution`/`housingPreference`; landlords get `homeAddress`/`nin`. Both optional at the schema level; required-ness enforced in the controller based on role.
- **Password reset** is also 3 steps (request OTP → verify OTP → set new password via a short-lived `resetToken`), matching the same OTP pattern as registration.
- **Sensitive fields** (`password`, `nin`, all reset tokens/OTPs) are never included in any API response.

## Email (Resend)
OTP emails (registration + password reset) are sent via Resend, using the shared `onboarding@resend.dev` test sender. Requires `RESEND_API_KEY` in `.env`. Currently only deliverable to the email address the Resend account is registered under — a verified custom domain is needed to send to arbitrary addresses (a task for deployment, not local dev).

## Environments
- **Development:** local, `http://localhost:5000/api/v1`
- **Production:** Render, `https://hostel-finder-backend-ht3x.onrender.com/api/v1`
No separate staging environment — team tests directly against production for now, given project timeline.

## Branching workflow
Each feature is built on its own branch off `develop`, using descriptive names (e.g. `feat/otp-registration-and-reset`, `feat/photo-upload`), opened as a PR into `develop`, and merged once tested. `develop` merges into `main` at project completion.

## Listing Design Notes
Photos are stored as 5 named fields (compound/room/kitchen/bathroom/toilet), not a generic array — each category uploaded via its own endpoint, matching the product design's per-category upload UI. Deletes are soft (`isDeleted`/`deletedAt`) rather than permanent, so landlords can view what they've removed via `GET /listings/deleted`. Public listing queries always exclude soft-deleted rows.

## File Uploads (Cloudinary)
Listing photos and profile pictures are uploaded via `multipart/form-data` and stored on Cloudinary (free tier). Requires `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in `.env`. Allowed formats: jpg, jpeg, png, webp. Max file size: 5MB. Listing photos: up to 5 per upload request, field name `photos`. Profile picture: single file, field name `profilePicture`.

## Review Design Notes
One review per user per listing, enforced by a database-level unique constraint (`@@unique([listingId, studentId])`) rather than an application-level check alone — avoids race conditions on near-simultaneous duplicate submissions. `GET` returns individual reviews plus a computed `averageRating`.

## Admin Design Notes
Admin is a `role` value on the same `User` table — no separate login system. There is deliberately no public way to self-register as admin; admin accounts are created by directly promoting a user's role in the database. Full admin panel scope (analytics, messaging, content management, etc., per the product's Figma admin flow) is out of scope for this capstone — only verification-related actions are built.

## Deployment
Hosted on Render (free tier).

- **Live URL:** https://hostel-finder-backend-ht3x.onrender.com/api/v1
- **Database:** Render PostgreSQL (free tier)
- Deploys automatically from `main` on every push
- ⚠️ Free tier spins down after 15 min of inactivity — first request after idle may take 30-60s to respond

### Deploying changes
1. Merge feature branches into `develop`, test locally
2. Merge `develop` → `main`
3. Push to `main` — Render auto-deploys
4. If the change includes a new Prisma migration, run it against production manually:

## Next Up
Reports (scam/suspicious listing flagging), then Inspection Requests.