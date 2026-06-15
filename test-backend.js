const axios = require('axios');
const fs = require('fs');

async function testSendMessage() {
  try {
    // 1. First login to get the token/cookie (we can login as an existing user)
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com', // we need a valid login, or we can just bypass auth for the test if possible
      password: 'password123'
    });
    console.log("Login success:", loginRes.data);
  } catch (err) {
    console.log("Login failed:", err.response?.data || err.message);
  }
}

testSendMessage();
