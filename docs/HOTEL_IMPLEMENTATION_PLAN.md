# 🏨 Hotel & Accommodation Module - Implementation Plan

> **Member:** Member 3 - Hotels & Accommodation  
> **Branch:** `hotel-management`  
> **Database:** `production_test4_new` | **User:** `root` | **Password:** `20020224Ha`  
> **Scope:** 30% of the full project (Hotel CRUD + User-facing views)

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Database Schema](#3-database-schema)
4. [Development Steps](#4-development-steps)
   - [Step 1: Branch Setup & Project Initialization](#step-1-branch-setup--project-initialization)
   - [Step 2: Database Connection & Configuration](#step-2-database-connection--configuration)
   - [Step 3: Hotel Model (Sequelize)](#step-3-hotel-model-sequelize)
   - [Step 4: Hotel Validation Schemas](#step-4-hotel-validation-schemas)
   - [Step 5: Hotel Controller - CRUD Operations](#step-5-hotel-controller---crud-operations)
   - [Step 6: Hotel Routes (API Endpoints)](#step-6-hotel-routes-api-endpoints)
   - [Step 7: Server Entry Point & Middleware](#step-7-server-entry-point--middleware)
   - [Step 8: Client Project Setup (React + Vite)](#step-8-client-project-setup-react--vite)
   - [Step 9: API Service Layer (Axios)](#step-9-api-service-layer-axios)
   - [Step 10: Admin - Add Hotel Page](#step-10-admin---add-hotel-page)
   - [Step 11: Admin - Hotel List & Management Page](#step-11-admin---hotel-list--management-page)
   - [Step 12: Admin - Edit/Update Hotel Page](#step-12-admin---editupdate-hotel-page)
   - [Step 13: Admin - Delete Hotel Functionality](#step-13-admin---delete-hotel-functionality)
   - [Step 14: User - Hotel Listing Page (Browse)](#step-14-user---hotel-listing-page-browse)
   - [Step 15: User - Hotel Detail Page](#step-15-user---hotel-detail-page)
   - [Step 16: Search & Filter Functionality](#step-16-search--filter-functionality)
   - [Step 17: Image Upload Support](#step-17-image-upload-support)
   - [Step 18: Final Testing & Bug Fixes](#step-18-final-testing--bug-fixes)
5. [API Endpoints Summary](#5-api-endpoints-summary)
6. [Folder Structure](#6-folder-structure)
7. [Git Workflow](#7-git-workflow)

---

## 1. Project Overview

This module handles the **Hotels & Accommodation** feature of the TravelLanka AI platform. It includes:

### Admin Side (Hotel Management)
- **Create** - Add new hotels/accommodations with details
- **Read** - View all hotels in a management dashboard
- **Update** - Edit hotel information
- **Delete** - Remove hotels from the system

### User Side (Public-facing)
- Browse available hotels & accommodations
- View detailed hotel information
- Search & filter hotels by location, price, rating, etc.

---

## 2. Technology Stack

| Layer        | Technology                        |
|-------------|-----------------------------------|
| **Frontend** | React.js (Vite), Tailwind CSS / Bootstrap |
| **Backend**  | Node.js, Express.js               |
| **Database** | MySQL (`production_test4_new`)     |
| **ORM**      | Sequelize                          |
| **Validation** | Joi / express-validator          |
| **HTTP Client** | Axios                          |
| **Image Upload** | Multer (local) or Cloudinary  |
| **API Testing** | Postman                         |

---

## 3. Database Schema

### Table: `hotels` — **ACTUAL SCHEMA (verified from `production_test4_new`)**

> **Status:** ✅ Connected and verified. Database contains **2,277 hotel records**.

```sql
-- ACTUAL TABLE: hotels (production_test4_new)
-- Field                 | Type            | Null | Key | Default
id                        INT              NOT NULL  PRI
hotel_name                TEXT             YES       MUL
hotel_description         TEXT             YES
star_classification       VARCHAR(45)      YES
auto_confirmation         TINYINT          YES             0
triggers                  INT              YES             0
hotel_classification      VARCHAR(45)      YES
longitude                 VARCHAR(45)      YES
latitude                  VARCHAR(45)      YES       MUL
provider                  VARCHAR(45)      YES
hotel_address             TEXT             NOT NULL
trip_advisor_link         TEXT             YES
hotel_image               TEXT             NOT NULL
country                   VARCHAR(45)      YES       MUL
city                      VARCHAR(45)      YES
micro_location            VARCHAR(45)      YES
hotel_status              VARCHAR(45)      YES
start_date                DATE             YES
end_date                  DATE             YES
vendor_id                 BIGINT           YES
updated_by                BIGINT           YES
created_at                TIMESTAMP        YES
updated_at                TIMESTAMP        YES
additional_data_1         VARCHAR(45)      YES
markup                    DECIMAL(10,0)    YES             15
sub_description           TEXT             YES
deleted_at                TIMESTAMP        YES       -- Soft deletes!
temp_column               VARCHAR(50)      YES
```

> 🔑 **Key observations for development:**
> - Use `hotel_name` not `name`, `hotel_image` not `image_url`, `hotel_address` not `address`
> - `deleted_at` column enables **soft deletes** (records are hidden, not erased)
> - `star_classification` is a `VARCHAR` (e.g., "3-star", "5-star") not a number
> - `markup` is the price markup percentage (default 15%)
> - `hotel_status` controls visibility (e.g., "active", "inactive")
> - No separate accommodations table found — all data is in `hotels`

---

## 4. Development Steps

---

### Step 1: Branch Setup & Project Initialization

**Goal:** Create the working branch and initialize both server and client projects.

**Tasks:**
1. Create and switch to the `hotel-management` branch:
   ```bash
   git checkout -b hotel-management
   ```

2. Initialize the **server** project:
   ```bash
   cd server
   npm init -y
   npm install express mysql2 sequelize dotenv cors body-parser
   npm install --save-dev nodemon
   ```

3. Initialize the **client** project:
   ```bash
   cd ../client
   npm create vite@latest . -- --template react
   npm install
   npm install axios react-router-dom
   npm install -D tailwindcss @tailwindcss/vite   # or bootstrap
   ```

4. Create `.env` file in server root:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=20020224Ha
   DB_NAME=production_test4_new
   DB_PORT=3306
   PORT=5000
   ```

5. Create `.gitignore` in project root (if not exists):
   ```
   node_modules/
   .env
   dist/
   .DS_Store
   ```

**Git Commit:**
```bash
git add .
git commit -m "Step 1: Initialize server and client projects with dependencies"
git push -u origin hotel-management
```

---

### Step 2: Database Connection & Configuration

**Goal:** Set up Sequelize connection to MySQL database.

**Tasks:**
1. Create `server/config/database.js`:
   ```javascript
   const { Sequelize } = require('sequelize');
   require('dotenv').config();

   const sequelize = new Sequelize(
     process.env.DB_NAME,
     process.env.DB_USER,
     process.env.DB_PASSWORD,
     {
       host: process.env.DB_HOST,
       dialect: 'mysql',
       port: process.env.DB_PORT || 3306,
       logging: false,
     }
   );

   module.exports = sequelize;
   ```

2. Test the database connection by creating a simple test script.

3. Connect to `production_test4_new` and inspect the existing hotel table:
   ```sql
   USE production_test4_new;
   SHOW TABLES;
   DESCRIBE hotels;   -- or whatever the table is named
   SELECT * FROM hotels LIMIT 5;
   ```

4. Document the actual table schema found in the database.

**Git Commit:**
```bash
git add .
git commit -m "Step 2: Configure database connection with Sequelize"
git push origin hotel-management
```

---

### Step 3: Hotel Model (Sequelize)

**Goal:** Create the Sequelize model that maps to the existing hotel table.

**Tasks:**
1. Create `server/member3-hotels/models/Hotel.js`:
   - Define the model to match the **existing** database table structure
   - Map all columns with correct data types
   - Set `tableName` explicitly to match the existing table name
   - Set `timestamps: true/false` based on existing table

2. If an accommodations/rooms table exists, create `server/member3-hotels/models/Accommodation.js`

3. Define associations if applicable:
   - `Hotel.hasMany(Accommodation)`
   - `Accommodation.belongsTo(Hotel)`

4. Create `server/member3-hotels/models/index.js` to export all models.

**Git Commit:**
```bash
git add .
git commit -m "Step 3: Create Hotel and Accommodation Sequelize models"
git push origin hotel-management
```

---

### Step 4: Hotel Validation Schemas

**Goal:** Create request validation for hotel CRUD operations.

**Tasks:**
1. Install validation library:
   ```bash
   npm install joi
   ```

2. Create `server/member3-hotels/validations/hotelValidation.js`:
   - `createHotelSchema` — validate all required fields for creating a hotel
   - `updateHotelSchema` — validate fields for updating (all optional)
   - `hotelIdSchema` — validate hotel ID parameter

3. Create validation middleware in `server/middleware/validate.js`:
   ```javascript
   const validate = (schema) => (req, res, next) => {
     const { error } = schema.validate(req.body, { abortEarly: false });
     if (error) {
       return res.status(400).json({
         success: false,
         errors: error.details.map(d => d.message)
       });
     }
     next();
   };
   ```

**Git Commit:**
```bash
git add .
git commit -m "Step 4: Add hotel validation schemas with Joi"
git push origin hotel-management
```

---

### Step 5: Hotel Controller - CRUD Operations

**Goal:** Implement all controller functions for hotel management.

**Tasks:**
1. Create `server/member3-hotels/controllers/hotelController.js` with these functions:

   | Function | Description |
   |----------|-------------|
   | `createHotel` | Add a new hotel to the database |
   | `getAllHotels` | Retrieve all hotels (with pagination) |
   | `getHotelById` | Retrieve a single hotel by ID |
   | `updateHotel` | Update hotel details by ID |
   | `deleteHotel` | Delete a hotel by ID |
   | `searchHotels` | Search hotels by name/city/district |
   | `getHotelsByCity` | Filter hotels by city |

2. Each function should:
   - Use proper try/catch error handling
   - Return consistent JSON response format:
     ```json
     {
       "success": true/false,
       "message": "...",
       "data": { ... }
     }
     ```
   - Include pagination for list endpoints (`page`, `limit`, `totalPages`, `totalItems`)

**Git Commit:**
```bash
git add .
git commit -m "Step 5: Implement hotel controller with full CRUD operations"
git push origin hotel-management
```

---

### Step 6: Hotel Routes (API Endpoints)

**Goal:** Define Express routes for hotel CRUD operations.

**Tasks:**
1. Create `server/member3-hotels/routes/hotelRoutes.js`:

   ```javascript
   const express = require('express');
   const router = express.Router();
   const hotelController = require('../controllers/hotelController');
   const validate = require('../../middleware/validate');
   const { createHotelSchema, updateHotelSchema } = require('../validations/hotelValidation');

   // Public routes (User side)
   router.get('/', hotelController.getAllHotels);
   router.get('/search', hotelController.searchHotels);
   router.get('/city/:city', hotelController.getHotelsByCity);
   router.get('/:id', hotelController.getHotelById);

   // Admin routes (Hotel management)
   router.post('/', validate(createHotelSchema), hotelController.createHotel);
   router.put('/:id', validate(updateHotelSchema), hotelController.updateHotel);
   router.delete('/:id', hotelController.deleteHotel);

   module.exports = router;
   ```

2. Test all endpoints using **Postman** or **Thunder Client**.

**Git Commit:**
```bash
git add .
git commit -m "Step 6: Define hotel API routes with validation middleware"
git push origin hotel-management
```

---

### Step 7: Server Entry Point & Middleware

**Goal:** Create the main server file and configure middleware.

**Tasks:**
1. Create `server/server.js` (or `server/index.js`):
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const dotenv = require('dotenv');
   const sequelize = require('./config/database');
   const hotelRoutes = require('./member3-hotels/routes/hotelRoutes');

   dotenv.config();
   const app = express();

   // Middleware
   app.use(cors());
   app.use(express.json());
   app.use(express.urlencoded({ extended: true }));

   // Routes
   app.use('/api/hotels', hotelRoutes);

   // Health check
   app.get('/api/health', (req, res) => {
     res.json({ status: 'OK', message: 'Server is running' });
   });

   // DB sync and server start
   const PORT = process.env.PORT || 5000;
   sequelize.authenticate()
     .then(() => {
       console.log('Database connected successfully');
       app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
     })
     .catch(err => console.error('Database connection failed:', err));
   ```

2. Create `server/middleware/errorHandler.js` — global error handler.

3. Add scripts to `server/package.json`:
   ```json
   "scripts": {
     "start": "node server.js",
     "dev": "nodemon server.js"
   }
   ```

4. **Test:** Run `npm run dev` and verify:
   - Server starts on port 5000
   - Database connection is successful
   - `GET /api/health` returns OK
   - `GET /api/hotels` returns hotel data from existing table

**Git Commit:**
```bash
git add .
git commit -m "Step 7: Create server entry point with middleware and route mounting"
git push origin hotel-management
```

---

### Step 8: Client Project Setup (React + Vite)

**Goal:** Set up the React frontend with routing and base layout.

**Tasks:**
1. Configure Vite proxy for API calls (in `vite.config.js`):
   ```javascript
   export default defineConfig({
     server: {
       proxy: {
         '/api': 'http://localhost:5000'
       }
     }
   });
   ```

2. Set up React Router in `client/src/App.jsx`:
   ```jsx
   <BrowserRouter>
     <Routes>
       {/* User Routes */}
       <Route path="/hotels" element={<HotelListPage />} />
       <Route path="/hotels/:id" element={<HotelDetailPage />} />

       {/* Admin Routes */}
       <Route path="/admin/hotels" element={<AdminHotelListPage />} />
       <Route path="/admin/hotels/add" element={<AddHotelPage />} />
       <Route path="/admin/hotels/edit/:id" element={<EditHotelPage />} />
     </Routes>
   </BrowserRouter>
   ```

3. Set up base CSS / Tailwind configuration.

4. Create shared layout components in `client/src/components/shared/`:
   - `Navbar.jsx`
   - `Footer.jsx`
   - `Layout.jsx`

**Git Commit:**
```bash
git add .
git commit -m "Step 8: Set up React client with routing and base layout"
git push origin hotel-management
```

---

### Step 9: API Service Layer (Axios)

**Goal:** Create a reusable API service for hotel operations.

**Tasks:**
1. Create `client/src/services/hotelService.js`:

   ```javascript
   import axios from 'axios';

   const API_URL = '/api/hotels';

   const hotelService = {
     // Get all hotels (with pagination)
     getAllHotels: (page = 1, limit = 10) =>
       axios.get(`${API_URL}?page=${page}&limit=${limit}`),

     // Get single hotel
     getHotelById: (id) =>
       axios.get(`${API_URL}/${id}`),

     // Search hotels
     searchHotels: (query) =>
       axios.get(`${API_URL}/search?q=${query}`),

     // Admin: Create hotel
     createHotel: (hotelData) =>
       axios.post(API_URL, hotelData),

     // Admin: Update hotel
     updateHotel: (id, hotelData) =>
       axios.put(`${API_URL}/${id}`, hotelData),

     // Admin: Delete hotel
     deleteHotel: (id) =>
       axios.delete(`${API_URL}/${id}`),
   };

   export default hotelService;
   ```

2. Create `client/src/services/api.js` for base Axios instance with interceptors.

**Git Commit:**
```bash
git add .
git commit -m "Step 9: Create hotel API service layer with Axios"
git push origin hotel-management
```

---

### Step 10: Admin - Add Hotel Page

**Goal:** Build the form to add a new hotel.

**Tasks:**
1. Create `client/src/pages/member3-hotels/AddHotelPage.jsx`:
   - Form with all hotel fields (name, description, city, price, star rating, etc.)
   - Form validation (required fields, number ranges, etc.)
   - Image URL input (or file upload if Step 17 is done)
   - Submit handler calls `hotelService.createHotel()`
   - Success/error toast notifications
   - Redirect to hotel list after successful creation

2. Create reusable form component: `client/src/components/member3-hotels/HotelForm.jsx`
   - Shared between Add and Edit pages
   - Accepts `initialData` and `onSubmit` props

**Git Commit:**
```bash
git add .
git commit -m "Step 10: Build admin Add Hotel page with form and validation"
git push origin hotel-management
```

---

### Step 11: Admin - Hotel List & Management Page

**Goal:** Build an admin dashboard to view and manage all hotels.

**Tasks:**
1. Create `client/src/pages/member3-hotels/AdminHotelListPage.jsx`:
   - Table/card view of all hotels
   - Display: name, city, star rating, price, status (active/inactive)
   - Action buttons: **View**, **Edit**, **Delete** for each hotel
   - Pagination controls
   - Search bar to filter hotels
   - "Add New Hotel" button linking to `/admin/hotels/add`

2. Create component: `client/src/components/member3-hotels/HotelTable.jsx`
   - Reusable table component with sorting

3. Create component: `client/src/components/member3-hotels/HotelCard.jsx`
   - Card view for each hotel (used in both admin and user views)

**Git Commit:**
```bash
git add .
git commit -m "Step 11: Build admin hotel management dashboard with list view"
git push origin hotel-management
```

---

### Step 12: Admin - Edit/Update Hotel Page

**Goal:** Build the page to edit existing hotel details.

**Tasks:**
1. Create `client/src/pages/member3-hotels/EditHotelPage.jsx`:
   - Fetch hotel data by ID on page load
   - Pre-populate the `HotelForm` component with existing data
   - Submit handler calls `hotelService.updateHotel()`
   - Loading spinner while fetching data
   - Handle "hotel not found" error
   - Redirect to hotel list after successful update

**Git Commit:**
```bash
git add .
git commit -m "Step 12: Build admin Edit Hotel page with pre-populated form"
git push origin hotel-management
```

---

### Step 13: Admin - Delete Hotel Functionality

**Goal:** Implement hotel deletion with confirmation.

**Tasks:**
1. Add delete functionality in `AdminHotelListPage.jsx`:
   - Confirmation modal/dialog before deletion
   - Call `hotelService.deleteHotel(id)` on confirm
   - Remove hotel from list after successful deletion
   - Success/error notifications

2. Create component: `client/src/components/shared/ConfirmDialog.jsx`
   - Reusable confirmation modal

**Git Commit:**
```bash
git add .
git commit -m "Step 13: Add delete hotel functionality with confirmation dialog"
git push origin hotel-management
```

---

### Step 14: User - Hotel Listing Page (Browse)

**Goal:** Build the public-facing page where users browse all hotels.

**Tasks:**
1. Create `client/src/pages/member3-hotels/HotelListPage.jsx`:
   - Grid/card layout displaying all hotels
   - Hotel card shows: image, name, city, star rating, price
   - Click on card navigates to hotel detail page
   - Pagination (load more or page numbers)
   - Responsive design (mobile, tablet, desktop)

2. Create component: `client/src/components/member3-hotels/HotelCardUser.jsx`
   - Attractive card design for public users
   - Star rating display
   - Price display

**Git Commit:**
```bash
git add .
git commit -m "Step 14: Build user-facing hotel listing page with card layout"
git push origin hotel-management
```

---

### Step 15: User - Hotel Detail Page

**Goal:** Build the detailed view page for a single hotel.

**Tasks:**
1. Create `client/src/pages/member3-hotels/HotelDetailPage.jsx`:
   - Large hero image / image gallery
   - Hotel name, star rating, description
   - Location details (city, district, province)
   - Map embed (Google Maps / Leaflet) using latitude/longitude
   - Price information
   - Amenities list with icons
   - Room types and availability
   - Contact information (phone, email, website)
   - "Back to Hotels" navigation button

2. Create component: `client/src/components/member3-hotels/AmenitiesList.jsx`
3. Create component: `client/src/components/member3-hotels/HotelImageGallery.jsx`

**Git Commit:**
```bash
git add .
git commit -m "Step 15: Build hotel detail page with full information display"
git push origin hotel-management
```

---

### Step 16: Search & Filter Functionality

**Goal:** Allow users to search and filter hotels.

**Tasks:**
1. Add search bar component: `client/src/components/member3-hotels/HotelSearchBar.jsx`
   - Search by hotel name or city
   - Debounced search input

2. Add filter sidebar/dropdown: `client/src/components/member3-hotels/HotelFilters.jsx`
   - Filter by city/district
   - Filter by star rating
   - Filter by price range (min-max)
   - Sort by: price (low-high, high-low), rating, name

3. Update backend `searchHotels` controller to handle all filter parameters.

4. Integrate search & filter into `HotelListPage.jsx`.

**Git Commit:**
```bash
git add .
git commit -m "Step 16: Add search and filter functionality for hotels"
git push origin hotel-management
```

---

### Step 17: Image Upload Support

**Goal:** Allow hotel image uploads instead of just URL input.

**Tasks:**
1. Install Multer on backend:
   ```bash
   npm install multer
   ```

2. Create `server/middleware/upload.js`:
   - Configure Multer for image storage
   - Set file size limits and allowed types (jpg, png, webp)
   - Store in `server/uploads/hotels/`

3. Add upload route:
   ```
   POST /api/hotels/upload-image
   ```

4. Serve static files:
   ```javascript
   app.use('/uploads', express.static('uploads'));
   ```

5. Update `HotelForm.jsx` to include file upload input with image preview.

**Git Commit:**
```bash
git add .
git commit -m "Step 17: Add image upload support with Multer"
git push origin hotel-management
```

---

### Step 18: Final Testing & Bug Fixes

**Goal:** Test all features end-to-end and fix any issues.

**Tasks:**
1. **Backend Testing:**
   - Test all API endpoints with Postman
   - Verify error handling for invalid inputs
   - Test pagination with large datasets
   - Verify database operations (create, read, update, delete)

2. **Frontend Testing:**
   - Test all admin CRUD operations through UI
   - Test user browsing and search
   - Test responsive design on different screen sizes
   - Test navigation and routing
   - Test form validation messages

3. **Integration Testing:**
   - Full flow: Add hotel → View in list → Edit → View changes → Delete
   - Search and filter with various criteria
   - Error scenarios (network failure, invalid data)

4. **Bug Fixes:**
   - Fix any issues found during testing
   - Optimize queries if needed
   - Clean up console errors/warnings

**Git Commit:**
```bash
git add .
git commit -m "Step 18: Final testing, bug fixes, and optimizations"
git push origin hotel-management
```

---

## 5. API Endpoints Summary

| Method   | Endpoint                  | Description                  | Access  |
|----------|---------------------------|------------------------------|---------|
| `GET`    | `/api/hotels`             | Get all hotels (paginated)   | Public  |
| `GET`    | `/api/hotels/:id`         | Get hotel by ID              | Public  |
| `GET`    | `/api/hotels/search`      | Search hotels                | Public  |
| `GET`    | `/api/hotels/city/:city`  | Get hotels by city           | Public  |
| `POST`   | `/api/hotels`             | Create a new hotel           | Admin   |
| `PUT`    | `/api/hotels/:id`         | Update a hotel               | Admin   |
| `DELETE` | `/api/hotels/:id`         | Delete a hotel               | Admin   |
| `POST`   | `/api/hotels/upload-image`| Upload hotel image           | Admin   |

---

## 6. Folder Structure

After implementation, the hotel module structure will look like:

```
server/
├── config/
│   └── database.js
├── middleware/
│   ├── errorHandler.js
│   ├── validate.js
│   └── upload.js
├── member3-hotels/
│   ├── controllers/
│   │   └── hotelController.js
│   ├── models/
│   │   ├── Hotel.js
│   │   ├── Accommodation.js
│   │   └── index.js
│   ├── routes/
│   │   └── hotelRoutes.js
│   └── validations/
│       └── hotelValidation.js
├── uploads/
│   └── hotels/
├── .env
├── package.json
└── server.js

client/
├── public/
├── src/
│   ├── components/
│   │   ├── member3-hotels/
│   │   │   ├── HotelForm.jsx
│   │   │   ├── HotelTable.jsx
│   │   │   ├── HotelCard.jsx
│   │   │   ├── HotelCardUser.jsx
│   │   │   ├── HotelSearchBar.jsx
│   │   │   ├── HotelFilters.jsx
│   │   │   ├── AmenitiesList.jsx
│   │   │   └── HotelImageGallery.jsx
│   │   └── shared/
│   │       ├── Navbar.jsx
│   │       ├── Footer.jsx
│   │       ├── Layout.jsx
│   │       └── ConfirmDialog.jsx
│   ├── pages/
│   │   └── member3-hotels/
│   │       ├── AddHotelPage.jsx
│   │       ├── AdminHotelListPage.jsx
│   │       ├── EditHotelPage.jsx
│   │       ├── HotelListPage.jsx
│   │       └── HotelDetailPage.jsx
│   ├── services/
│   │   ├── api.js
│   │   └── hotelService.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

---

## 7. Git Workflow

### Branch Strategy
```
main
 └── hotel-management   ← your working branch
```

### Commit Convention
Use clear, descriptive commit messages following this pattern:
```
Step X: Brief description of what was done
```

### Push After Each Step
```bash
git add .
git commit -m "Step X: Description"
git push origin hotel-management
```

### After All Steps Complete
Create a **Pull Request** from `hotel-management` → `main` for team review.

---

## ⏱️ Estimated Timeline

| Step | Task | Est. Time |
|------|------|-----------|
| 1 | Branch setup & initialization | 30 min |
| 2 | Database connection | 30 min |
| 3 | Hotel model | 45 min |
| 4 | Validation schemas | 30 min |
| 5 | Hotel controller (CRUD) | 1.5 hr |
| 6 | Hotel routes | 30 min |
| 7 | Server entry point | 45 min |
| 8 | Client project setup | 1 hr |
| 9 | API service layer | 30 min |
| 10 | Admin - Add Hotel page | 2 hr |
| 11 | Admin - Hotel List page | 2 hr |
| 12 | Admin - Edit Hotel page | 1.5 hr |
| 13 | Admin - Delete functionality | 45 min |
| 14 | User - Hotel listing page | 2 hr |
| 15 | User - Hotel detail page | 2 hr |
| 16 | Search & filter | 2 hr |
| 17 | Image upload | 1.5 hr |
| 18 | Testing & bug fixes | 2 hr |
| **Total** | | **~20 hours** |

---

## ✅ Completion Checklist

- [ ] Branch `hotel-management` created and pushed
- [ ] Server project initialized with dependencies
- [ ] Database connection configured and tested
- [ ] Hotel model matches existing database table
- [ ] Validation schemas created for all operations
- [ ] All CRUD controller functions implemented
- [ ] API routes defined and tested with Postman
- [ ] Server runs successfully with all middleware
- [ ] Client project set up with routing
- [ ] API service layer created
- [ ] Admin: Can add a new hotel
- [ ] Admin: Can view all hotels in dashboard
- [ ] Admin: Can edit/update hotel details
- [ ] Admin: Can delete a hotel
- [ ] User: Can browse hotels page
- [ ] User: Can view single hotel details
- [ ] Search and filter functionality works
- [ ] Image upload works
- [ ] All Postman tests pass
- [ ] Code is clean and well-documented
- [ ] All steps committed and pushed to `hotel-management` branch
