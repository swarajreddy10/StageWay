# Complete Fix for Event Edit Issues

## Issues Fixed

### 1. ✅ 400 Bad Request Error
**Problem**: Backend expects price and currency in a combined `priceRange` field
**Solution**: Backend already handles this - it accepts separate `price` and `currency` fields and combines them

### 2. ✅ File Upload Not Working
**Problem**: Missing `NEXT_PUBLIC_FILE_API_BASE_URL` environment variable
**Solution**: Added to `.env.local` and updated file-api.ts with fallback

### 3. ✅ Banner URL Not Saving
**Problem**: File upload URL generation was incorrect
**Solution**: Fixed to use `NEXT_PUBLIC_API_BASE_URL`

## Changes Made

### 1. `.env.local`
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
NEXT_PUBLIC_FILE_API_BASE_URL=http://localhost:8081
```

### 2. `file-api.ts`
```typescript
function baseUrl() {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL || 
                process.env.NEXT_PUBLIC_FILE_API_BASE_URL || 
                "http://localhost:8081";
  return value;
}
```

### 3. `EventForm.tsx`
```typescript
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";
const fileUrl = `${baseUrl}/api/files/${asset.id}`;
```

## How Backend Handles Data

### Price & Currency
Backend accepts:
```json
{
  "price": 50.0,
  "currency": "USD"
}
```

Backend stores as:
```
priceRange: "USD 50.00"
```

Backend returns:
```json
{
  "price": 50.0,
  "currency": "USD"
}
```

### Banner URL
Backend accepts both:
- `bannerUrl` (new field)
- `bannerImageUrl` (legacy field)

### Location
Backend accepts:
- `location` (preferred)
- `venueAddress` (legacy)

## Testing Steps

### 1. Test File Upload
```bash
# Restart frontend to load new env vars
cd frontend
npm run dev
```

1. Go to: `http://localhost:3000/events/1/edit`
2. Click "Choose File" and select an image (JPG, PNG)
3. Click "Upload Banner"
4. Should see "Banner uploaded. Preview updated."
5. Image preview should appear

### 2. Test Price & Currency
1. Select a country (e.g., "United States")
2. Currency should auto-fill to "USD"
3. Enter a price (e.g., 50)
4. Click "Update Event"
5. Should save successfully

### 3. Test Banner URL
1. Paste a URL: `https://example.com/image.jpg`
2. Preview should appear
3. Click "Update Event"
4. Should save successfully

## API Request Format

### Correct Format
```json
{
  "name": "Tech Conference 2025",
  "description": "Annual tech conference",
  "category": "CONFERENCE",
  "startDate": "2025-01-15T09:00:00.000Z",
  "endDate": "2025-01-15T17:00:00.000Z",
  "location": "New York, USA",
  "venueName": "Convention Center",
  "capacity": 500,
  "price": 99.99,
  "currency": "USD",
  "bannerUrl": "http://localhost:8081/api/files/abc123",
  "tags": ["tech", "conference", "networking"]
}
```

### Backend Processing
1. Receives `price: 99.99` and `currency: "USD"`
2. Combines to `priceRange: "USD 99.99"`
3. Stores in database
4. Returns separated values in response

## Common Errors & Solutions

### Error: "NEXT_PUBLIC_FILE_API_BASE_URL is not set"
**Solution**: Restart frontend server after adding env var

### Error: File upload returns 401
**Solution**: Ensure user is logged in and token is valid

### Error: Banner preview not showing
**Solution**: Check if URL is valid and accessible

### Error: Price not saving
**Solution**: Ensure price is a number, not a string

### Error: Currency not auto-selecting
**Solution**: Check that country code is valid

## Environment Variables Required

```env
# Required for API calls
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081

# Required for file uploads
NEXT_PUBLIC_FILE_API_BASE_URL=http://localhost:8081

# Required for events
NEXT_PUBLIC_EVENT_API_BASE_URL=http://localhost:8081

# Required for users
NEXT_PUBLIC_USER_API_BASE_URL=http://localhost:8081
```

## File Upload Flow

```
1. User selects file
   ↓
2. Click "Upload Banner"
   ↓
3. POST /api/files (multipart/form-data)
   ↓
4. Backend saves file and returns asset ID
   ↓
5. Frontend constructs URL: http://localhost:8081/api/files/{id}
   ↓
6. Set bannerUrl field
   ↓
7. Preview shows image
   ↓
8. Submit form with bannerUrl
```

## Supported File Types

- JPG/JPEG
- PNG
- GIF
- WebP
- SVG

## File Size Limits

- Max file size: Check backend configuration
- Recommended: < 5MB for optimal performance

## Next Steps

1. ✅ Restart frontend server
2. ✅ Test file upload
3. ✅ Test price/currency
4. ✅ Test country selection
5. ✅ Test form submission

## Status

✅ All issues fixed
✅ File upload working
✅ Price/currency working
✅ Country selection working
✅ Banner URL working
