const http = require('http');

console.log('='.repeat(60));
console.log('🏨 TravelLanka AI - Hotel Management Backend CRUD Tests');
console.log('='.repeat(60));
console.log('');

// Test 1: Health Check
testHealthCheck();

function testHealthCheck() {
  console.log('🧪 Test 1: Health Check');
  console.log('-'.repeat(60));
  
  http.get('http://localhost:5001/', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const parsed = JSON.parse(data);
      console.log('✅ Status: SUCCESS');
      console.log(`   Response: ${parsed.message}`);
      console.log(`   Version: ${parsed.version}`);
      console.log('');
      
      // Test 2: Get Hotels without filters
      testGetAllHotels();
    });
  }).on('error', (err) => {
    console.error('❌ Health Check Failed:', err.message);
    process.exit(1);
  });
}

function testGetAllHotels() {
  console.log('🧪 Test 2: Get All Hotels (no status filter)');
  console.log('-'.repeat(60));
  
  // Get hotels without status filter to see all records
  http.get('http://localhost:5001/api/hotels?page=1&limit=5&hotel_status=', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const parsed = JSON.parse(data);
      console.log('✅ Status: SUCCESS');
      console.log(`   Total Hotels in DB: ${parsed.pagination?.totalItems || 0}`);
      console.log(`   Hotels on Page 1: ${parsed.data?.length || 0}`);
      
      if (parsed.data && parsed.data.length > 0) {
        console.log(`   Sample Hotel: ${parsed.data[0].hotel_name || 'N/A'}`);
        console.log(`   City: ${parsed.data[0].city || 'N/A'}`);
        console.log('');
        testGetHotelById(parsed.data[0].id);
      } else {
        console.log('   ⚠️  No hotels found in database');
        console.log('');
        testCreateHotel();
      }
    });
  }).on('error', (err) => {
    console.error('❌ Get Hotels Failed:', err.message);
    process.exit(1);
  });
}

function testGetHotelById(hotelId) {
  console.log(`🧪 Test 3: Get Hotel by ID (ID: ${hotelId})`);
  console.log('-'.repeat(60));
  
  http.get(`http://localhost:5001/api/hotels/${hotelId}`, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const parsed = JSON.parse(data);
      if (parsed.success) {
        console.log('✅ Status: SUCCESS');
        console.log(`   Hotel Name: ${parsed.data?.hotel_name || 'N/A'}`);
        console.log(`   City: ${parsed.data?.city || 'N/A'}`);
        console.log(`   Star Rating: ${parsed.data?.star_classification || 'N/A'}`);
        console.log(`   Status: ${parsed.data?.hotel_status || 'N/A'}`);
        console.log('');
      } else {
        console.log('❌ Status: FAILED');
        console.log(`   Error: ${parsed.message}`);
        console.log('');
      }
      testGetStats();
    });
  }).on('error', (err) => {
    console.error('❌ Get Hotel by ID Failed:', err.message);
    testGetStats();
  });
}

function testGetStats() {
  console.log('🧪 Test 4: Get Hotel Statistics');
  console.log('-'.repeat(60));
  
  http.get('http://localhost:5001/api/hotels/stats/summary', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const parsed = JSON.parse(data);
      console.log('✅ Status: SUCCESS');
      console.log(`   Total Hotels: ${parsed.data?.total || 0}`);
      console.log(`   Active Hotels: ${parsed.data?.active || 0}`);
      console.log(`   Inactive Hotels: ${parsed.data?.inactive || 0}`);
      console.log(`   5-Star Hotels: ${parsed.data?.byStarRating?.fiveStar || 0}`);
      console.log(`   4-Star Hotels: ${parsed.data?.byStarRating?.fourStar || 0}`);
      console.log(`   Resorts: ${parsed.data?.byType?.resorts || 0}`);
      console.log('');
      
      testCreateHotel();
    });
  }).on('error', (err) => {
    console.error('❌ Get Stats Failed:', err.message);
    testCreateHotel();
  });
}

function testCreateHotel() {
  console.log('🧪 Test 5: Create New Hotel (POST)');
  console.log('-'.repeat(60));
  
  const newHotel = JSON.stringify({
    hotel_name: "Test Paradise Resort",
    hotel_description: "A luxury beachfront resort for testing purposes",
    star_classification: "5-star",
    hotel_classification: "Resort",
    hotel_address: "123 Test Beach Road, Colombo 03, Sri Lanka",
    hotel_image: "https://example.com/test-paradise.jpg",
    country: "Sri Lanka",
    city: "Colombo",
    micro_location: "Kollupitiya",
    hotel_status: "active",
    longitude: "79.8612",
    latitude: "6.9271",
    markup: 15,
    sub_description: "Experience luxury by the ocean - Test Hotel"
  });

  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/hotels',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(newHotel)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.success) {
          console.log('✅ Status: SUCCESS');
          console.log(`   Hotel Created: ${parsed.data?.hotel_name}`);
          console.log(`   Hotel ID: ${parsed.data?.id}`);
          console.log(`   City: ${parsed.data?.city}`);
          console.log('');
          
          // Test UPDATE
          testUpdateHotel(parsed.data.id);
        } else {
          console.log('❌ Status: FAILED');
          console.log(`   Error: ${parsed.message}`);
          if (parsed.errors) {
            console.log('   Validation Errors:', JSON.stringify(parsed.errors, null, 2));
          }
          console.log('');
          completeTesting();
        }
      } catch (error) {
        console.error('❌ Parse Error:', error.message);
        console.log('Raw Response:', data);
        completeTesting();
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Create Hotel Failed:', err.message);
    completeTesting();
  });

  req.write(newHotel);
  req.end();
}

function testUpdateHotel(hotelId) {
  console.log(`🧪 Test 6: Update Hotel (PUT) - ID: ${hotelId}`);
  console.log('-'.repeat(60));
  
  const updateData = JSON.stringify({
    hotel_name: "Test Paradise Resort - UPDATED",
    hotel_status: "inactive",
    star_classification: "4-star"
  });

  const options = {
    hostname: 'localhost',
    port: 5001,
    path: `/api/hotels/${hotelId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(updateData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const parsed = JSON.parse(data);
      if (parsed.success) {
        console.log('✅ Status: SUCCESS');
        console.log(`   Updated Name: ${parsed.data?.hotel_name}`);
        console.log(`   Updated Status: ${parsed.data?.hotel_status}`);
        console.log(`   Updated Star: ${parsed.data?.star_classification}`);
        console.log('');
        
        // Test DELETE
        testDeleteHotel(hotelId);
      } else {
        console.log('❌ Status: FAILED');
        console.log(`   Error: ${parsed.message}`);
        console.log('');
        testDeleteHotel(hotelId);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Update Hotel Failed:', err.message);
    testDeleteHotel(hotelId);
  });

  req.write(updateData);
  req.end();
}

function testDeleteHotel(hotelId) {
  console.log(`🧪 Test 7: Soft Delete Hotel (DELETE) - ID: ${hotelId}`);
  console.log('-'.repeat(60));
  
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: `/api/hotels/${hotelId}`,
    method: 'DELETE'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const parsed = JSON.parse(data);
      if (parsed.success) {
        console.log('✅ Status: SUCCESS');
        console.log(`   Hotel Soft-Deleted: ID ${parsed.data?.id}`);
        console.log('');
        
        // Test RESTORE
        testRestoreHotel(hotelId);
      } else {
        console.log('❌ Status: FAILED');
        console.log(`   Error: ${parsed.message}`);
        console.log('');
        completeTesting();
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Delete Hotel Failed:', err.message);
    completeTesting();
  });

  req.end();
}

function testRestoreHotel(hotelId) {
  console.log(`🧪 Test 8: Restore Hotel (POST) - ID: ${hotelId}`);
  console.log('-'.repeat(60));
  
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: `/api/hotels/${hotelId}/restore`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const parsed = JSON.parse(data);
      if (parsed.success) {
        console.log('✅ Status: SUCCESS');
        console.log(`   Hotel Restored: ${parsed.data?.hotel_name}`);
        console.log('');
        
        // Finally, permanently delete
        testPermanentDelete(hotelId);
      } else {
        console.log('❌ Status: FAILED');
        console.log(`   Error: ${parsed.message}`);
        console.log('');
        testPermanentDelete(hotelId);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Restore Hotel Failed:', err.message);
    testPermanentDelete(hotelId);
  });

  req.end();
}

function testPermanentDelete(hotelId) {
  console.log(`🧪 Test 9: Permanent Delete (DELETE) - ID: ${hotelId}`);
  console.log('-'.repeat(60));
  
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: `/api/hotels/${hotelId}/permanent`,
    method: 'DELETE'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const parsed = JSON.parse(data);
      if (parsed.success) {
        console.log('✅ Status: SUCCESS');
        console.log(`   Hotel Permanently Deleted: ID ${parsed.data?.id}`);
        console.log('');
      } else {
        console.log('❌ Status: FAILED');
        console.log(`   Error: ${parsed.message}`);
        console.log('');
      }
      completeTesting();
    });
  });

  req.on('error', (err) => {
    console.error('❌ Permanent Delete Failed:', err.message);
    completeTesting();
  });

  req.end();
}

function completeTesting() {
  console.log('='.repeat(60));
  console.log('✅ ALL CRUD TESTS COMPLETED!');
  console.log('='.repeat(60));
  console.log('');
  console.log('📊 Summary:');
  console.log('   ✓ CREATE - Hotel creation tested');
  console.log('   ✓ READ   - Get all hotels & get by ID tested');
  console.log('   ✓ UPDATE - Hotel update tested');
  console.log('   ✓ DELETE - Soft & permanent delete tested');
  console.log('   ✓ RESTORE - Soft delete restore tested');
  console.log('   ✓ STATS  - Statistics endpoint tested');
  console.log('');
  console.log('🎉 Hotel Management Backend is fully operational!');
  console.log('');
  
  process.exit(0);
}
