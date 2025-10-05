const fetch = require('node-fetch');

async function testNotificationAPI() {
  try {
    console.log('=== Testing Notification API ===\n');

    // Test the API endpoint directly
    const response = await fetch('http://localhost:3000/api/notifications?type=provider&limit=10', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: This won't work without proper session cookies
        // But we can see if the endpoint is accessible
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.text();
    console.log('Response body:', data);

    if (response.status === 401) {
      console.log('\nExpected 401 - API requires authentication');
      console.log('This confirms the API is working but needs proper session');
    }

  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testNotificationAPI();