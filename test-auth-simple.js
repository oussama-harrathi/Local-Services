const http = require('http');

function testAuthEndpoint() {
  console.log('🔍 Testing NextAuth session endpoint...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/session',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Node.js Test'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response body:', data);
      
      if (res.statusCode === 200) {
        try {
          const parsed = JSON.parse(data);
          console.log('✅ Session endpoint working, parsed response:', parsed);
        } catch (e) {
          console.log('⚠️ Response not JSON:', data);
        }
      } else {
        console.log('❌ Session endpoint error');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
  });

  req.setTimeout(5000, () => {
    console.error('❌ Request timeout');
    req.destroy();
  });

  req.end();
}

// Test the endpoint
testAuthEndpoint();