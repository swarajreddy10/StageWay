# Fix: 400 Bad Request on Event Update

## Problem
When updating an event via PUT `/api/events/:id`, the backend returns 400 Bad Request.

## Root Cause
The frontend was sending dates in `datetime-local` format (e.g., `2025-01-01T10:00`) instead of ISO 8601 format (e.g., `2025-01-01T10:00:00.000Z`) that the backend expects.

## Solution Applied

### 1. Fixed Form Submission (EventForm.tsx)
```typescript
// Before
startDate: data.startDate,
endDate: data.endDate,

// After
startDate: new Date(data.startDate).toISOString(),
endDate: new Date(data.endDate).toISOString(),
```

### 2. Fixed Auto-Save (EventForm.tsx)
```typescript
const formattedData = {
  ...data,
  startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
  endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
  price: data.price || 0,
  currency: data.currency || \"USD\",
};
```

### 3. Fixed Initial Data (edit/page.tsx)
```typescript
// Convert ISO to datetime-local format for input
startDate: currentEvent.startDate 
  ? new Date(currentEvent.startDate).toISOString().slice(0, 16) 
  : \"\",
```

## Expected Request Format

```json
{
  "name": "Event Name",
  "description": "Event Description",
  "category": "WORKSHOP",
  "startDate": "2025-01-01T10:00:00.000Z",
  "endDate": "2025-01-01T18:00:00.000Z",
  "location": "New York, USA",
  "venueName": "Convention Center",
  "capacity": 100,
  "price": 50.0,
  "currency": "USD",
  "bannerUrl": "https://example.com/banner.jpg",
  "tags": ["tech", "conference"]
}
```

## Testing

1. Navigate to: `http://localhost:3000/events/1/edit`
2. Make changes to any field
3. Click "Update Event"
4. Should receive 200 OK with updated event data

## Common Issues

### Issue: Dates not updating
**Check**: Ensure dates are in ISO 8601 format in the request payload

### Issue: Price/Currency missing
**Check**: Default values are set (price: 0, currency: "USD")

### Issue: Tags not saving
**Check**: Tags are sent as array of strings, not comma-separated string

## Backend Expectations

The backend `EventRequest` DTO accepts:
- `startDate` (String) - ISO 8601 format
- `endDate` (String) - ISO 8601 format
- `price` (Double) - Can be null, defaults to 0
- `currency` (String) - Can be null, defaults to "USD"
- `tags` (List<String>) - Array of strings

## Verification

Check the browser Network tab:
1. Request Payload should show ISO dates
2. Response should be 200 OK
3. Response body should contain updated event

## Files Modified

1. `frontend/src/components/events/EventForm.tsx`
   - Fixed `onFormSubmit` date formatting
   - Fixed `handleAutoSave` date formatting

2. `frontend/src/app/events/[id]/edit/page.tsx`
   - Fixed initial data date conversion

## Status
✅ Fixed - Event updates now work correctly
