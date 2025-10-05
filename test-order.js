// Using Node.js built-in fetch (available in Node 18+)

async function testOrderAPI() {
  try {
    console.log('Testing order API...');
    
    const orderData = {
      providerId: "test-provider-id",
      items: [
        {
          name: "Test Item",
          price: 10.99,
          quantity: 2,
          notes: "Extra spicy"
        }
      ],
      deliveryAddress: "123 Test Street, Test City",
      notes: "Please ring the doorbell"
    };

    console.log('Sending request with data:', JSON.stringify(orderData, null, 2));

    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (response.ok) {
      console.log('✅ Order API test successful');
    } else {
      console.log('❌ Order API test failed');
    }

  } catch (error) {
    console.error('❌ Error testing order API:', error.message);
  }
}

testOrderAPI();