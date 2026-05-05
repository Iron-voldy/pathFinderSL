# 🏨 TravelLanka AI - Hotel Management System

Complete hotel and accommodation management system with full CRUD operations, built with Node.js, Express, and MySQL.

## 🚀 Quick Start

### Prerequisites
- Node.js v22+ installed
- MySQL database running
- Database `production_test4_new` with 2,277 hotel records

### Installation

1. **Clone and navigate:**
   ```bash
   cd d:\pathFinderSL\travellanka-ai\server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   - Ensure `.env` file exists with database credentials
   - Server runs on port 5001

4. **Start the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

5. **Server should display:**
   ```
   ✅ Database connected successfully
   📊 Database: production_test4_new
   🖥️  Host: localhost:3306
   ✅ Models synchronized with database
   
   ==================================================
   🚀 TravelLanka AI Server is running
   ==================================================
   🌐 Server URL: http://localhost:5001
   📡 API Base: http://localhost:5001/api
   🏨 Hotels API: http://localhost:5001/api/hotels
   ==================================================
   ```

## 📊 Test the API

Run comprehensive CRUD tests:
```bash
node test-crud.js
```

Expected output:
```
✅ ALL CRUD TESTS COMPLETED!
   ✓ CREATE - Hotel creation tested
   ✓ READ   - Get all hotels & get by ID tested
   ✓ UPDATE - Hotel update tested
   ✓ DELETE - Soft & permanent delete tested
   ✓ RESTORE - Soft delete restore tested
   ✓ STATS  - Statistics endpoint tested
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hotels` | Get all hotels (paginated, filterable) |
| POST | `/api/hotels` | Create new hotel |
| GET | `/api/hotels/:id` | Get hotel by ID |
| PUT | `/api/hotels/:id` | Update hotel |
| DELETE | `/api/hotels/:id` | Soft delete hotel |
| POST | `/api/hotels/:id/restore` | Restore deleted hotel |
| DELETE | `/api/hotels/:id/permanent` | Permanently delete hotel |
| GET | `/api/hotels/location/:location` | Get hotels by location |
| GET | `/api/hotels/stats/summary` | Get statistics |

## 📖 Documentation

- **[API Documentation](docs/HOTEL_API_DOCUMENTATION.md)** - Complete API reference with examples
- **[Backend Summary](docs/BACKEND_IMPLEMENTATION_SUMMARY.md)** - Implementation details and test results
- **[Implementation Plan](docs/HOTEL_IMPLEMENTATION_PLAN.md)** - Complete development plan

## 🏗️ Architecture

```
Modular Monolithic 3-Tier Architecture
├── Client Layer (React + Vite) [Pending]
├── Server Layer (Node.js + Express) ✅ COMPLETE
└── Data Layer (MySQL Database) ✅ CONNECTED
```

## 📁 Project Structure

```
travellanka-ai/
├── server/
│   ├── server.js                 # Main server
│   ├── config/                   # Database config
│   ├── middleware/               # Custom middleware
│   ├── hotel-accommodation-management/           # Hotel management module
│   │   ├── models/               # Sequelize models
│   │   ├── controllers/          # Business logic
│   │   ├── routes/               # API routes
│   │   └── validations/          # Joi schemas
│   ├── test-crud.js              # CRUD tests
│   └── package.json
├── client/                       # React app [To be developed]
├── database/                     # Migrations & seeders
└── docs/                         # Documentation
```

## 🛠️ Technologies

- **Backend**: Node.js, Express.js 5.2.1
- **Database**: MySQL (Sequelize ORM 6.37.7)
- **Validation**: Joi 18.0.2
- **Dev Tools**: Nodemon, dotenv

## ✨ Features

✅ **Complete CRUD Operations**
- Create, Read, Update, Delete hotels
- Soft delete with restore capability
- Permanent delete option

✅ **Advanced Queries**
- Pagination (page, limit)
- Filtering (city, country, star rating, status)
- Search (across multiple fields)
- Sorting (multiple fields, ASC/DESC)

✅ **Quality Assurance**
- Request validation (Joi)
- Error handling
- Request logging
- Comprehensive testing

✅ **Database Features**
- Soft deletes (paranoid mode)
- Timestamps (created_at, updated_at, deleted_at)
- 2,277 existing hotel records

## 🧪 Example Usage

### Create a Hotel
```bash
curl -X POST http://localhost:5001/api/hotels \
  -H "Content-Type: application/json" \
  -d '{
    "hotel_name": "Paradise Resort",
    "hotel_address": "Beach Road, Colombo",
    "hotel_image": "https://example.com/image.jpg",
    "city": "Colombo",
    "country": "Sri Lanka",
    "star_classification": "5-star",
    "hotel_status": "active"
  }'
```

### Get Hotels
```bash
curl "http://localhost:5001/api/hotels?page=1&limit=10&city=Colombo"
```

## 🎯 Status

- ✅ **Backend Development**: 100% Complete
- 🔄 **Frontend Development**: Pending
- 🔜 **Image Upload**: Planned
- 🔜 **Authentication**: Planned

## 📝 Environment Variables

```env
PORT=5001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=20020224Ha
DB_NAME=production_test4_new
DB_PORT=3306
NODE_ENV=development
```

## 🤝 Contributing

Module Owner: Member 3 - Hotels & Accommodation  
Branch: `hotel-management`

## 📄 License

ISC

---

**Last Updated**: February 24, 2026  
**Status**: Backend Operational ✅  
**Next**: Frontend Development

