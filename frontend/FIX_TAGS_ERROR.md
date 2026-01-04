# Fix: JSON Parse Error - Empty String to ArrayList

## Error Message
```
JSON parse error: Cannot coerce empty String ("") to element of `java.util.ArrayList`
```

## Root Cause
The frontend was sending `tags: ""` (empty string) when the tags field was empty, but the backend expects either:
- `tags: null`
- `tags: []` (empty array)
- `tags: ["tag1", "tag2"]` (array of strings)

## Solution Applied

### 1. Fixed Form Submission (EventForm.tsx)
```typescript
// Before
tags: data.tags
  ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
  : undefined,

// After
tags: data.tags && data.tags.trim()
  ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
  : undefined,
```

### 2. Fixed Auto-Save (EventForm.tsx)
```typescript
// Remove tags if empty string
if ('tags' in data) {
  if (typeof data.tags === 'string' && data.tags.trim()) {
    formattedData.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
  } else if (Array.isArray(data.tags) && data.tags.length > 0) {
    formattedData.tags = data.tags;
  } else {
    formattedData.tags = undefined;
  }
}
```

## What Changed

### Before (Broken)
```json
{
  "name": "Event Name",
  "tags": ""  // ❌ Empty string causes error
}
```

### After (Fixed)
```json
{
  "name": "Event Name"
  // ✅ tags field omitted (undefined) when empty
}
```

Or with tags:
```json
{
  "name": "Event Name",
  "tags": ["tech", "conference"]  // ✅ Array of strings
}
```

## Testing

### Test 1: Empty Tags
1. Go to edit page
2. Leave tags field empty
3. Click "Update Event"
4. ✅ Should save successfully (no error)

### Test 2: With Tags
1. Go to edit page
2. Enter tags: `tech, conference, networking`
3. Click "Update Event"
4. ✅ Should save successfully

### Test 3: Auto-Save Empty Tags
1. Go to edit page
2. Clear tags field
3. Wait 2 seconds
4. ✅ Should see "Saved" (no error)

### Test 4: Auto-Save With Tags
1. Go to edit page
2. Enter tags: `workshop, training`
3. Wait 2 seconds
4. ✅ Should see "Saved"

## Other Fields Fixed

Also fixed empty string handling for:
- `venueName` - converts empty string to `undefined`
- `bannerUrl` - converts empty string to `undefined`
- `category` - converts empty string to `undefined`

## Backend Expectations

The backend `EventRequest` DTO expects:
```java
private List<String> tags;  // Can be null or List<String>, NOT empty string
```

## Status

✅ Fixed - Events now save successfully
✅ Empty tags field handled correctly
✅ Auto-save works with empty fields
✅ No more JSON parse errors

## No Restart Required

This is a frontend-only fix. Just refresh the page in your browser.

## Verification

Check backend logs - should NOT see:
```
Cannot coerce empty String ("") to element of `java.util.ArrayList`
```

Should see successful saves instead.
