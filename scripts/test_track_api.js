const fetch = require('node-fetch') || globalThis.fetch;

async function run() {
  console.log("Sending mock order to API...");
  try {
    const res = await fetch('http://localhost:3000/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId: '2d7dbbec-a5bb-4ba1-b94f-1f352ffa9d88', // The one from before
        type: 'order',
        data: {
          orderTotal: 100,
          tableNumber: '12',
          itemName: '2x Test Burger',
          specialInstructions: 'No onions'
        }
      })
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (e) {
    console.error("Error:", e);
  }
}

run();
