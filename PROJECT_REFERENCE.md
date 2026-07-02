# Settleezy Relocation & Settlement Platform - Project Reference Guide

This document provides a comprehensive technical overview of the **Settleezy** application ecosystem (both React Frontend and Node.js/Express Backend). It serves as a core context index/reference for Phase 2 development.

---

## 📌 Project Overview
**Settleezy** is a relocation and settlement platform designed for international students and expats relocating to Germany (currently active in Berlin, with Munich and Hamburg planned next). The platform facilitates onboarding service partners, managing student guide content, subscribing to newsletters, applying as campus ambassadors, and managing customer inquiries.

---

## 🛠️ Global Technology Stack

### 1. Frontend
*   **Framework**: React 19 (`react`, `react-dom`)
*   **Build Tool**: Vite 8 (`vite`)
*   **Router**: React Router DOM v7
*   **Styling**: Vanilla CSS (highly modular dark-mode/orange-accented design system with glassmorphism)
*   **Utilities**: Axios (API connection), `qrcode.react` (QR-based benefit verification)
*   **Language System**: Custom DOM text walker + translation dictionary mapping (supporting `en` / `de`)

### 2. Backend
*   **Runtime**: Node.js + Express (`express` v5.1.0)
*   **Database**: MongoDB + Mongoose (`mongoose` v8.19.1)
*   **Email**: Nodemailer (`nodemailer` v8.0.5) using SMTP (Gmail App Passwords)
*   **Data Export**: `json2csv` v6 (for admin CSV backups)
*   **Process Manager**: `nodemon` (development hot-reloading)

---

## 📁 Repository Directory Structures

### 1. Frontend Workspace (`settleezy-frontend/`)
```
settleezy-frontend/
├── public/                       # Static public assets (images, logos, icons)
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── CommunityTeam.jsx     # Campus ambassadors & insiders search
│   │   ├── Footer.jsx            # Global site footer
│   │   ├── Navbar.jsx            # Global responsive navigation header
│   │   ├── Launchbadge.jsx       # Floating live status / countdown badge
│   │   └── PartnerLogoMarquee.jsx# Infinite-loop partner brand marquee
│   ├── context/
│   │   └── LanguageContext.jsx   # Localization (en/de) state & translate helper
│   ├── hooks/
│   │   ├── useDomLanguage.js     # Walk DOM text nodes and apply German mapping
│   │   └── useScrollReveal.js    # IntersectionObserver animation hook
│   ├── i18n/
│   │   └── domTranslations.js    # Mappings for English-to-German text translation
│   ├── layouts/
│   │   └── MainLayout.jsx        # Parent layout with Navbar, Footer & Outlet
│   ├── pages/
│   │   ├── student-guide/        # Curated relocation articles (housing, finance, daily life, admin)
│   │   ├── legal/                # Compliance pages (privacy, cookies, terms)
│   │   ├── Home.jsx              # Main landing page
│   │   ├── About.jsx             # Mission, values, and founder's story
│   │   ├── Platform.jsx          # Ecosystem feature matrix & app information
│   │   ├── Membership.jsx        # Tiered plans & payment structure
│   │   ├── Contact.jsx           # Customer & partner support channels
│   │   └── Servicepartner.jsx    # Partner directory & application page
│   ├── services/
│   │   └── api.js                # Axios client instance with auth interceptors
│   ├── App.jsx                   # Routing configuration & providers
│   └── main.jsx                  # React application entry point
```

### 2. Backend Workspace (`settleezy-backend/`)
```
settleezy-backend/
├── Db.js                         # Database connection establishment and error handlers
├── EmailService.js               # Mail generation templates & Nodemailer configuration
├── Validation.js                 # Central validation logic & form deadlines
├── server.js                     # Core Express server, CORS setup, and API routes definition
├── Partnercontroller.js          # New partner application handlers
├── Model.js                      # Schema definitions for standard partner applications
├── OldPartnerController.js       # Legacy/returning partner onboarding controllers
├── OldPartnerModel.js            # Legacy partner database schema
├── CommunityPartnerController.js # Community partner application handlers
├── CommunityPartnerModel.js      # Community partner schema
├── StudentAmbassadorController.js# Student ambassador applications controllers
├── StudentAmbassadorModel.js     # Student ambassador schema
├── ContactController.js          # General contact form controllers
├── ContactModel.js               # Contact form schema
├── EnquiryController.js          # Partnership enquiries handlers
├── EnquiryModel.js               # Partnership enquiries schema
├── NewsletterController.js       # Newsletter subscriptions handlers
├── NewsletterModel.js            # Newsletter subscriber schema
├── ControllerValidation.test.js  # API controllers logic validation tests
└── Validation.test.js            # Validation helpers test suite
```

---

## 🗺️ Backend API Reference

All backend endpoints ingest POST requests, return standard JSON records, and support direct CSV exports for admin backups:

| Endpoint | Controller | Mongoose Model | Active Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST /api/partner-applications` | `Partnercontroller.js` | `PartnerApplication` | **Closed** (Deadline: May 30, 2026) | Standard partner application (cuisine, seating, social links, opening hours, tier, pricing). |
| `POST /api/old-partner-applications` | `OldPartnerController.js` | `OldPartnerApplication` | **Closed** (Deadline: May 16, 2026) | Onboarding for existing pre-relaunch partners. |
| `POST /api/community-partner-applications` | `CommunityPartnerController.js` | `CommunityPartnerApplication` | **Open** (No Deadline) | Registration for local community partners. |
| `POST /api/student-ambassador-applications` | `StudentAmbassadorController.js` | `StudentAmbassadorApplication` | **Open** (No Deadline) | Onboarding for campus ambassadors. |
| `POST /api/contact` | `ContactController.js` | `ContactForm` | **Open** (No Deadline) | Customer helpdesk submissions. |
| `POST /api/enquiries` | `EnquiryController.js` | `EnquiryForm` | **Open** (No Deadline) | B2B/Corporate partnership requests. |
| `POST /api/newsletter/subscribe` | `NewsletterController.js` | `NewsletterSubscriber` | **Open** (No Deadline) | Newsletter subscription with duplicate checks. |

### Admin Export Endpoints
For every route listed above, the endpoint `GET /api/<feature-route>/download/csv` gathers all submissions from the database, flattens array-based fields, and exports the data to a downloadable CSV file.

---

## 🌐 Localization & Translation Engine

Rather than standard translation libraries (like `react-i18next`), the system uses a custom DOM translation engine:
1.  **Context (`LanguageContext.jsx`)**: Tracks the selected language state (`en` or `de`) in local storage and manages the language attribute (`document.documentElement.lang`).
2.  **Mapping (`domTranslations.js`)**: Contains two dictionaries:
    *   `phraseMap`: Key-value pairs for full-phrase translations (e.g. `Home` -> `Startseite`).
    *   `wordMap`: Direct dictionary for single-word fallbacks.
3.  **DOM Walker Hook (`useDomLanguage.js`)**: Walks text nodes in the DOM subtree beneath `.app-wrapper` and dynamically swaps English strings with German equivalents on the fly when the language state is set to `de`.

---

## 🔒 Configuration & Environment Setup

### Backend `.env` File
Create a `.env` file in the root of `settleezy-backend/`:
```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
PORT=5000
FRONTEND_URL=http://localhost:5173,http://localhost:3000,https://settleezy.de

# Email Service Config (Nodemailer)
MAIL_USER=r.techrt123@gmail.com
MAIL_PASS=kdyqskqtkgvyullo
MAIL_HOST=smtp.hostinger.com  # Fallback to Gmail configurations if needed
MAIL_PORT=465

# Cloudinary Configuration (Image Uploads)
CLOUDINARY_CLOUD_NAME=dcpmkrcqi
CLOUDINARY_API_KEY=445664972484768
CLOUDINARY_API_SECRET=F54GZtGUj5ky3G6ZB8SI7soy0uI
CLOUDINARY_UPLOAD_PRESET=ladkjqz3
```

### Frontend `.env` File
Create a `.env` file in the root of `settleezy-frontend/`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=dcpmkrcqi
VITE_CLOUDINARY_UPLOAD_PRESET=ladkjqz3
```
