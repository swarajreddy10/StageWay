// Critical user flows E2E test
import { test, expect } from 'bun:test';

const runIntegration = process.env.RUN_INTEGRATION_TESTS === "true";
const integrationTest = runIntegration ? test : test.skip;

integrationTest('Registration Service - No Infinite Recursion', async () => {
  // This test simulates the API call that would trigger infinite recursion
  const response = await fetch('http://localhost:8081/api/registrations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    },
    body: JSON.stringify({
      eventId: 1,
      attendeeName: 'Test User',
      attendeeEmail: 'test@example.com'
    })
  });

  // Should not timeout or crash (would happen with infinite recursion)
  expect(response.status).toBeLessThan(500);
});

integrationTest('Connection Pool - Load Test', async () => {
  // Test 50 concurrent API calls to validate connection pool scaling
  const promises = Array.from({ length: 50 }, () =>
    fetch('http://localhost:8081/api/events')
      .then(res => res.ok)
      .catch(() => false)
  );

  const results = await Promise.all(promises);
  const successCount = results.filter(Boolean).length;

  // At least 90% should succeed (connection pool should handle load)
  expect(successCount).toBeGreaterThan(45);
});

integrationTest('Event Registration Flow', async () => {
  // Test complete registration flow
  const eventResponse = await fetch('http://localhost:8081/api/events');
  expect(eventResponse.ok).toBe(true);

  const events = await eventResponse.json();
  if (events.content && events.content.length > 0) {
    const registrationResponse = await fetch('http://localhost:8081/api/registrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        eventId: events.content[0].id,
        attendeeName: 'Integration Test User',
        attendeeEmail: 'integration@test.com'
      })
    });

    // Should handle registration without crashing
    expect(registrationResponse.status).toBeLessThan(500);
  }
});
