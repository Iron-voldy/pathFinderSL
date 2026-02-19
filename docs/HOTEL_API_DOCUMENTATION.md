# TravelLanka AI - Hotel Management API Documentation

## Base URL
```
http://localhost:5000/api/hotels
```

## Endpoints

### 1. Create Hotel
**POST** `/api/hotels`

**Description:** Create a new hotel/accommodation

**Request Body:**
```json
{
  "hotel_name": "Paradise Beach Resort",
  "hotel_description": "Luxury beachfront resort with world-class amenities",
  "star_classification": "5-star",
  "auto_confirmation": 1,
  "hotel_classification": "Resort",
  "longitude": "79.8612",
  "latitude": "6.9271",
  "provider": "TravelLanka",
  "hotel_address": "123 Beach Road, Colombo 03, Sri Lanka",
  "trip_advisor_link": "https://tripadvisor.com/hotel/paradise-beach",
  "hotel_image": "https://example.com/images/paradise-beach.jpg",
  "country": "Sri Lanka",
  "city": "Colombo",
  "micro_location": "Kollupitiya",
  "hotel_status": "active",
  "start_date": "2024-01-01",
  "markup": 15,
  "sub_description": "Experience luxury by the ocean"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Hotel created successfully",
  "data": {
    "id": 2278,
    "hotel_name": "Paradise Beach Resort",
    ...
  }
}
```

---

### 2. Get All Hotels
**GET** `/api/hotels`

**Description:** Retrieve all hotels with pagination, filtering, and search

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `city` (string) - Filter by city
- `country` (string) - Filter by country
- `star_classification` (string) - Filter by star rating
- `hotel_status` (string, default: 'active') - Filter by status
- `hotel_classification` (string) - Filter by type
- `search` (string) - Search in name, description, address
- `sortBy` (string, default: 'created_at') - Sort field
- `sortOrder` (string, default: 'DESC') - Sort direction

**Example Request:**
```
GET /api/hotels?city=Colombo&star_classification=5-star&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Hotels retrieved successfully",
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 228,
    "totalItems": 2277,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

### 3. Get Hotel by ID
**GET** `/api/hotels/:id`

**Description:** Retrieve a single hotel by ID

**Example Request:**
```
GET /api/hotels/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Hotel retrieved successfully",
  "data": {
    "id": 1,
    "hotel_name": "Galle Face Hotel",
    ...
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Hotel not found"
}
```

---

### 4. Update Hotel
**PUT** `/api/hotels/:id`

**Description:** Update hotel information

**Request Body (all fields optional):**
```json
{
  "hotel_name": "Updated Hotel Name",
  "hotel_status": "inactive",
  "star_classification": "4-star",
  "updated_by": 1
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Hotel updated successfully",
  "data": {
    "id": 1,
    "hotel_name": "Updated Hotel Name",
    ...
  }
}
```

---

### 5. Delete Hotel (Soft Delete)
**DELETE** `/api/hotels/:id`

**Description:** Soft delete a hotel (sets deleted_at timestamp)

**Example Request:**
```
DELETE /api/hotels/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Hotel deleted successfully",
  "data": {
    "id": 1
  }
}
```

---

### 6. Permanent Delete Hotel
**DELETE** `/api/hotels/:id/permanent`

**Description:** Permanently delete a hotel from database

**Example Request:**
```
DELETE /api/hotels/1/permanent
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Hotel permanently deleted",
  "data": {
    "id": 1
  }
}
```

---

### 7. Restore Hotel
**POST** `/api/hotels/:id/restore`

**Description:** Restore a soft-deleted hotel

**Example Request:**
```
POST /api/hotels/1/restore
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Hotel restored successfully",
  "data": {
    "id": 1,
    "hotel_name": "Restored Hotel",
    ...
  }
}
```

---

### 8. Get Hotels by Location
**GET** `/api/hotels/location/:location`

**Description:** Get hotels by city, country, or micro-location

**Example Request:**
```
GET /api/hotels/location/Colombo?limit=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Hotels in Colombo retrieved successfully",
  "data": [...],
  "count": 150
}
```

---

### 9. Get Hotel Statistics
**GET** `/api/hotels/stats/summary`

**Description:** Get statistical overview of hotels

**Example Request:**
```
GET /api/hotels/stats/summary
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Hotel statistics retrieved successfully",
  "data": {
    "total": 2277,
    "active": 2100,
    "inactive": 177,
    "byStarRating": {
      "fiveStar": 450,
      "fourStar": 850,
      "threeStar": 800
    },
    "byType": {
      "hotels": 1500,
      "resorts": 500,
      "villas": 277
    }
  }
}
```

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "body": [
      {
        "field": "hotel_name",
        "message": "Hotel name is required"
      }
    ]
  }
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Hotel not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Failed to create hotel",
  "error": "Database connection error"
}
```

---

## Valid Values

### Star Classification
- `1-star`
- `2-star`
- `3-star`
- `4-star`
- `5-star`
- `Unrated`

### Hotel Classification
- `Hotel`
- `Resort`
- `Villa`
- `Guesthouse`
- `Apartment`
- `Hostel`
- `Boutique`
- `Other`

### Hotel Status
- `active`
- `inactive`
- `pending`
- `maintenance`

### Auto Confirmation
- `0` - No
- `1` - Yes

---

## Testing with cURL

### Create Hotel
```bash
curl -X POST http://localhost:5000/api/hotels \
  -H "Content-Type: application/json" \
  -d '{
    "hotel_name": "Test Hotel",
    "hotel_address": "123 Test Street, Colombo",
    "hotel_image": "https://example.com/test.jpg",
    "city": "Colombo",
    "country": "Sri Lanka"
  }'
```

### Get All Hotels
```bash
curl http://localhost:5000/api/hotels?page=1&limit=10
```

### Get Hotel by ID
```bash
curl http://localhost:5000/api/hotels/1
```

### Update Hotel
```bash
curl -X PUT http://localhost:5000/api/hotels/1 \
  -H "Content-Type: application/json" \
  -d '{
    "hotel_status": "inactive"
  }'
```

### Delete Hotel
```bash
curl -X DELETE http://localhost:5000/api/hotels/1
```

---

## Postman Collection

Import this URL into Postman for ready-to-use API tests:
```
http://localhost:5000/api/hotels
```

Create a new collection with all the endpoints listed above for comprehensive testing.
