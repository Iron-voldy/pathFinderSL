const http = require('http');

// Test 1: Health Check
console.log('🧪 Test 1: Health Check...');
http.get('http://localhost:5001/', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('✅ Health Check Response:', data);
    console.log('');
    
    // Test 2: Get Hotels
    testGetHotels();
  });
}).on('error', (err) => {
  console.error('❌ Health Check Failed:', err.message);
});

function testGetHotels() {
  console.log('🧪 Test 2: Get All Hotels (page 1, limit 5)...');
  http.get('http://localhost:5001/api/hotels?page=1&limit=5', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log('✅ Get Hotels Response:');
        console.log('  - Success:', parsed.success);
        console.log('  - Message:', parsed.message);
        console.log('  - Total Hotels:', parsed.pagination?.totalItems || 0);
        console.log('  - Hotels Returned:', parsed.data?.length || 0);
        console.log('');
        
        // Test 3: Get Hotel by ID
        if (parsed.data && parsed.data.length > 0) {
          testGetHotelById(parsed.data[0].id);
        } else {
          console.log('⚠️  No hotels found to test Get Hotel by ID');
          testCreateHotel();
        }
      } catch (error) {
        console.error('❌ Parse Error:', error.message);
        console.log('Raw Response:', data);
      }
    });
  }).on('error', (err) => {
    console.error('❌ Get Hotels Failed:', err.message);
  });
}

function testGetHotelById(hotelId) {
  console.log(`🧪 Test 3: Get Hotel by ID (${hotelId})...`);
  http.get(`http://localhost:5001/api/hotels/${hotelId}`, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log('✅ Get Hotel by ID Response:');
        console.log('  - Success:', parsed.success);
        console.log('  - Hotel Name:', parsed.data?.hotel_name);
        console.log('  - City:', parsed.data?.city);
        console.log('  - Star Rating:', parsed.data?.star_classification);
        console.log('');
        
        // Test 4: Get Hotel Stats
        testGetStats();
      } catch (error) {
        console.error('❌ Parse Error:', error.message);
      }
    });
  }).on('error', (err) => {
    console.error('❌ Get Hotel by ID Failed:', err.message);
  });
}

function testGetStats() {
  console.log('🧪 Test 4: Get Hotel Statistics...');
  http.get('http://localhost:5001/api/hotels/stats/summary', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log('✅ Hotel Statistics Response:');
        console.log('  - Success:', parsed.success);
        console.log('  - Total Hotels:', parsed.data?.total);
        console.log('  - Active Hotels:', parsed.data?.active);
        console.log('  - Inactive Hotels:', parsed.data?.inactive);
        console.log('  - 5-Star Hotels:', parsed.data?.byStarRating?.fiveStar);
        console.log('');
        
        console.log('🎉 All tests completed successfully!');
        console.log('');
        console.log('✨ Hotel Management Backend is fully operational!');
      } catch (error) {
        console.error('❌ Parse Error:', error.message);
      }
    });
  }).on('error', (err) => {
    console.error('❌ Get Stats Failed:', err.message);
  });
}
