# 🚀 PathFinderSL - Quick Start Guide

## Prerequisites
- ✅ Node.js installed (v16+)
- ✅ MySQL database running
- ✅ Git (optional)

---

## 1. Start Backend Server

Open a terminal and run:

```bash
cd d:\pathFinderSL\travellanka-ai\server
node server.js
```

**Expected Output:**
```
✅ Database connected successfully
🚀 Server running on port 5001
📊 Hotels test: Found 2277 hotels
```

**Backend URL:** http://localhost:5001  
**API Base:** http://localhost:5001/api

---

## 2. Start Frontend Server

Open a **new terminal** and run:

```bash
cd d:\pathFinderSL\travellanka-ai\client
npm run dev
```

**Expected Output:**
```
VITE v6.4.1  ready in 1944 ms
➜  Local:   http://localhost:3000/
```

**Frontend URL:** http://localhost:3000

---

## 3. Access the Application

### Public Pages
- 🏠 **Home**: http://localhost:3000/
- 🏨 **Hotels Listing**: http://localhost:3000/hotels
- 📄 **Hotel Detail**: http://localhost:3000/hotels/1

### Admin Pages
- 📊 **Manage Hotels**: http://localhost:3000/admin/dev/hotels
- ➕ **Add New Hotel**: http://localhost:3000/admin/dev/hotels/add
- ✏️ **Edit Hotel**: http://localhost:3000/admin/dev/hotels/edit/1

---

## 4. Test API Endpoints

### Using Browser (GET requests)
```
http://localhost:5001/api/hotels
http://localhost:5001/api/hotels/1
http://localhost:5001/api/hotels/stats/summary
```

### Using PowerShell (POST/PUT/DELETE)

**Create Hotel:**
```powershell
$body = @{
    hotel_name = "Test Hotel"
    hotel_address = "123 Test Street"
    hotel_image = "https://example.com/image.jpg"
    city = "Colombo"
    country = "Sri Lanka"
    hotel_status = "active"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/hotels" -Method POST -Body $body -ContentType "application/json"
```

**Update Hotel:**
```powershell
$body = @{
    hotel_name = "Updated Hotel Name"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/hotels/1" -Method PUT -Body $body -ContentType "application/json"
```

**Delete Hotel:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/api/hotels/1" -Method DELETE
```

---

## 5. Common Tasks

### Filter Hotels
Visit: http://localhost:3000/hotels

Use the left sidebar to:
- 🔍 Search by name or city
- 🏙️ Filter by city (Colombo, Kandy, Galle, etc.)
- ⭐ Filter by star rating (1-5 stars)
- 🏨 Filter by property type (Hotel, Resort, Villa, etc.)
- 📊 Sort by newest, name, rating, or city

### Add a New Hotel (Admin)
1. Go to: http://localhost:3000/admin/dev/hotels
2. Click "Add New Hotel" button
3. Fill in the form:
   - **Required**: Hotel Name, Address, Image URL
   - **Optional**: Phone, email, city, rating, etc.
4. Click "Create Hotel"
5. Success! Redirected to admin list

### Edit Existing Hotel (Admin)
1. Go to: http://localhost:3000/admin/dev/hotels
2. Find the hotel in the list
3. Click the ✏️ (edit) icon
4. Update any fields
5. Click "Update Hotel"

### Delete Hotel (Admin)
1. Go to: http://localhost:3000/admin/dev/hotels
2. Find the hotel in the list
3. Click the 🗑️ (delete) icon
4. Confirm deletion
5. Hotel is soft-deleted (can be restored)

---

## 6. Database Quick Check

Using MySQL Workbench or command line:

```sql
-- Check total hotels
SELECT COUNT(*) FROM hotels;

-- Get all active hotels
SELECT hotel_name, city, star_classification 
FROM hotels 
WHERE hotel_status = 'active' 
ORDER BY created_at DESC 
LIMIT 10;

-- Get hotels by city
SELECT hotel_name, hotel_address 
FROM hotels 
WHERE city = 'Colombo';

-- Check soft-deleted hotels
SELECT hotel_name, deleted_at 
FROM hotels 
WHERE deleted_at IS NOT NULL;
```

---

## 7. Troubleshooting

### Backend Issues

**Port 5001 already in use:**
```bash
# Option 1: Kill the process using port 5001
netstat -ano | findstr :5001
taskkill /PID <PID_NUMBER> /F

# Option 2: Change port in .env file
# Edit: server\.env
PORT=5002
```

**Database connection error:**
```bash
# Check MySQL is running
# Check credentials in: server\.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=20020224Ha
DB_NAME=production_test4_new
```

### Frontend Issues

**Port 3000 already in use:**
```bash
# Vite will automatically try port 3001, 3002, etc.
# Or kill the process:
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

**npm install needed:**
```bash
cd client
npm install
```

**Missing dependencies:**
```bash
cd client
npm install axios gsap react-router-dom
```

---

## 8. Development Workflow

### Making Changes

**Backend Changes:**
1. Edit files in `server/` directory
2. Stop server (Ctrl+C)
3. Restart: `node server.js`

**Frontend Changes:**
1. Edit files in `client/src/`
2. Vite hot-reloads automatically
3. Check browser for updates

### Adding New Features

**New API Endpoint:**
1. Add route in `server/member3-hotels/routes/hotelRoutes.js`
2. Add controller in `server/member3-hotels/controllers/hotelController.js`
3. Add validation in `server/member3-hotels/validations/hotelValidation.js`
4. Restart server

**New Frontend Page:**
1. Create component in `client/src/pages/`
2. Add route in `client/src/App.jsx`
3. Import Navbar and Footer
4. Add navigation link in `client/src/components/shared/Navbar.jsx`

---

## 9. Project Structure Reference

```
travellanka-ai/
├── server/
│   ├── server.js              ← Start backend here
│   ├── .env                   ← Database config
│   └── member3-hotels/        ← Hotel module
│       ├── models/            ← Database models
│       ├── controllers/       ← Business logic
│       ├── routes/            ← API endpoints
│       └── validations/       ← Input validation
│
└── client/
    ├── package.json           ← Dependencies
    ├── public/
    │   └── travelVid.mp4      ← Hero video
    └── src/
        ├── App.jsx            ← Routes
        ├── components/
        │   └── shared/        ← Navbar, Footer
        ├── pages/             ← Page components
        │   ├── Home.jsx
        │   ├── Hotels.jsx
        │   ├── HotelDetail.jsx
        │   └── admin/hotels/  ← Admin pages
        └── services/
            └── api.js         ← API calls
```

---

## 10. Keyboard Shortcuts

### Browser
- `Ctrl + Shift + R` - Hard refresh (clear cache)
- `F12` - Open developer tools
- `Ctrl + Shift + C` - Inspect element

### VS Code
- `Ctrl + ~` - Toggle terminal
- `Ctrl + P` - Quick file open
- `Ctrl + Shift + F` - Search in files
- `Ctrl + B` - Toggle sidebar

### Terminal
- `Ctrl + C` - Stop running server
- `Ctrl + L` - Clear terminal

---

## 11. Quick Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Home page loads with video
- [ ] Hotels page shows 2,277 hotels
- [ ] Filters work on hotels page
- [ ] Hotel detail page loads correctly
- [ ] Admin list page loads
- [ ] Can add new hotel
- [ ] Can edit existing hotel
- [ ] Can delete hotel
- [ ] Navbar navigation works
- [ ] Footer displays correctly
- [ ] Mobile responsive (resize browser)

---

## 12. Useful Commands

### Backend
```bash
# Start server
cd server
node server.js

# Run CRUD tests
node test-crud.js

# Check for errors
node server.js | findstr "ERROR"
```

### Frontend
```bash
# Install dependencies
cd client
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database
```bash
# MySQL command line
mysql -u root -p

# Use database
USE production_test4_new;

# Show tables
SHOW TABLES;

# Describe hotels table
DESCRIBE hotels;
```

---

## 13. Environment Variables

### Backend (.env)
```env
PORT=5001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=20020224Ha
DB_NAME=production_test4_new
DB_PORT=3306
NODE_ENV=development
```

### Frontend (Vite automatically handles)
```javascript
// In code, API base URL is set in:
// client/src/services/api.js
const API_BASE_URL = 'http://localhost:5001/api';
```

---

## 14. Support & Documentation

- 📖 **Full Documentation**: [DEVELOPMENT_SUMMARY.md](DEVELOPMENT_SUMMARY.md)
- 🔌 **API Reference**: [docs/HOTEL_API_DOCUMENTATION.md](docs/HOTEL_API_DOCUMENTATION.md)
- 🏗️ **Architecture**: [docs/system-architecture.puml](docs/system-architecture.puml)
- 📋 **Implementation Plan**: [docs/HOTEL_IMPLEMENTATION_PLAN.md](docs/HOTEL_IMPLEMENTATION_PLAN.md)

---

## 15. Need Help?

### Common Questions

**Q: Where's the video file?**  
A: `client/public/travelVid.mp4`

**Q: How to change database credentials?**  
A: Edit `server/.env` file

**Q: How to add a new page?**  
A: Create component in `client/src/pages/` and add route in `App.jsx`

**Q: API not responding?**  
A: Check backend server is running on port 5001

**Q: Frontend shows blank page?**  
A: Check browser console (F12) for errors

---

**You're all set! 🎉**

Visit http://localhost:3000/ to see your application!
