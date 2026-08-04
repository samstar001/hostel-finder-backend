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
| Reviews | ⬜ Not started |
| Listing verification flow | ⬜ Not started |
| Reports (scam flagging) | ⬜ Not started |
| Inspection requests | ⬜ Not started |
| Listing redesign (categorized photos, hostel rules, legal docs) | ⬜ Planned, not started |

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
│   ├── generateToken.js
│   ├── generateOtp.js
│   └── sendEmail.js       # Resend wrapper
└── app.js
prisma/
├── schema.prisma          # User, PendingRegistration, Listing, Review, Report, InspectionRequest
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

Full request/response examples: see `hostel-finder-api-docs.md` (shared with frontend/mobile).

## Auth Design Notes

- **JWT**, stateless, `Authorization: Bearer <token>`, 7-day expiry, payload limited to `{ id, role }`
- **Registration** is 3 steps to match the product's actual UI (Create Account → Verify Email OTP → Complete Registration with password). Incomplete signups live in a separate `PendingRegistration` table, never in `users`, until verified and completed.
- **Role-specific fields**: students get `institution`/`housingPreference`; landlords get `homeAddress`/`nin`. Both optional at the schema level; required-ness enforced in the controller based on role.
- **Password reset** is also 3 steps (request OTP → verify OTP → set new password via a short-lived `resetToken`), matching the same OTP pattern as registration.
- **Sensitive fields** (`password`, `nin`, all reset tokens/OTPs) are never included in any API response.

## Email (Resend)
OTP emails (registration + password reset) are sent via Resend, using the shared `onboarding@resend.dev` test sender. Requires `RESEND_API_KEY` in `.env`. Currently only deliverable to the email address the Resend account is registered under — a verified custom domain is needed to send to arbitrary addresses (a task for deployment, not local dev).

## Environments
Currently **development only** — running locally against a local PostgreSQL instance. No staging or production deployment yet. Base URL for now: `http://localhost:5000/api/v1`. A hosted (Render/Railway) environment is planned once core features are further along, so frontend/mobile can integrate against something other than a teammate's laptop.

## Branching workflow
Each feature is built on its own branch off `develop`, using descriptive names (e.g. `feat/otp-registration-and-reset`, `feat/photo-upload`), opened as a PR into `develop`, and merged once tested. `develop` merges into `main` at project completion.

## Listing Design Notes
Photos are stored as 5 named fields (compound/room/kitchen/bathroom/toilet), not a generic array — each category uploaded via its own endpoint, matching the product design's per-category upload UI. Deletes are soft (`isDeleted`/`deletedAt`) rather than permanent, so landlords can view what they've removed via `GET /listings/deleted`. Public listing queries always exclude soft-deleted rows.

## File Uploads (Cloudinary)
Listing photos and profile pictures are uploaded via `multipart/form-data` and stored on Cloudinary (free tier). Requires `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in `.env`. Allowed formats: jpg, jpeg, png, webp. Max file size: 5MB. Listing photos: up to 5 per upload request, field name `photos`. Profile picture: single file, field name `profilePicture`.

## Next Up
Reviews (students reviewing listings), then Reports (scam flagging) and Inspection Requests.