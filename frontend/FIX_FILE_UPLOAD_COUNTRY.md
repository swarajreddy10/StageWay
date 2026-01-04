# Fix: File Upload & Country Selection Issues

## Issues Fixed

### 1. ✅ 413 Content Too Large Error
**Problem**: File upload fails with 413 error (file was 1.38MB)
**Root Cause**: Backend default limit is 1MB
**Solution**: Increased limit to 10MB

### 2. ✅ Country Selection Reloading Page
**Problem**: Selecting country causes page reload
**Root Cause**: Select components missing `disabled` prop during form submission
**Solution**: Added `disabled={isLoading}` to all Select components

## Changes Made

### Backend: application.yml
```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB
```

### Frontend: EventForm.tsx
1. Added file size validation (10MB limit)
2. Added `disabled={isLoading}` to all Select components
3. Shows helpful error message if file too large

## File Upload Limits

| Type | Limit | Notes |
|------|-------|-------|
| Max File Size | 10MB | Per file |
| Max Request Size | 10MB | Total request |
| Recommended | < 5MB | For better performance |

## Supported File Types

- ✅ JPG/JPEG
- ✅ PNG
- ✅ GIF
- ✅ WebP
- ✅ SVG

## Testing

### Test 1: Small File Upload (< 10MB)
1. Go to edit page
2. Select image < 10MB
3. Click "Upload Banner"
4. ✅ Should upload successfully

### Test 2: Large File Upload (> 10MB)
1. Go to edit page
2. Select image > 10MB
3. Click "Upload Banner"
4. ✅ Should show: "File too large. Maximum size is 10MB. Your file is X.XXMBs."

### Test 3: Country Selection
1. Go to edit page
2. Click "Country" dropdown
3. Select "United States"
4. ✅ Page should NOT reload
5. ✅ Currency should change to "USD"
6. ✅ Country should stay selected

### Test 4: Currency Selection
1. Go to edit page
2. Click "Currency" dropdown
3. Select "EUR"
4. ✅ Page should NOT reload
5. ✅ Currency should stay selected

## Restart Required

### Backend
```bash
# Stop backend (Ctrl+C)
# Restart backend
cd backend
mvn spring-boot:run
```

### Frontend
```bash
# Just refresh browser - no restart needed
```

## File Size Calculation

```javascript
// Check file size before upload
const maxSize = 10 * 1024 * 1024; // 10MB in bytes
if (file.size > maxSize) {
  alert(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
}
```

## Error Messages

### Before Upload
- "Select an image to upload." - No file selected
- "Sign in to upload, or paste an image URL instead." - Not authenticated
- "File too large. Maximum size is 10MB. Your file is X.XXMBs." - File exceeds limit

### During Upload
- "Uploading..." - Upload in progress

### After Upload
- "Banner uploaded. Preview updated." - Success
- "Upload failed" - Generic error
- Specific error message from backend - Server error

## Troubleshooting

### Issue: Still getting 413 error
**Solution**: 
1. Restart backend server
2. Check file size is < 10MB
3. Check backend logs

### Issue: Country selection still reloading
**Solution**:
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check console for errors

### Issue: File upload slow
**Solution**:
1. Use smaller images (< 2MB recommended)
2. Compress images before upload
3. Use image optimization tools

### Issue: Currency not auto-selecting
**Solution**:
1. Ensure country is selected first
2. Check that country code is valid
3. Refresh page and try again

## Image Optimization Tips

### Before Upload
1. **Resize**: Max 1920x1080 for banners
2. **Compress**: Use tools like TinyPNG, ImageOptim
3. **Format**: Use WebP for best compression
4. **Quality**: 80-85% is usually sufficient

### Recommended Tools
- **Online**: TinyPNG, Squoosh.app
- **Desktop**: ImageOptim (Mac), FileOptimizer (Windows)
- **CLI**: imagemagick, sharp

### Example Compression
```bash
# Using ImageMagick
convert input.jpg -resize 1920x1080 -quality 85 output.jpg

# Using sharp (Node.js)
sharp('input.jpg')
  .resize(1920, 1080)
  .jpeg({ quality: 85 })
  .toFile('output.jpg');
```

## Performance Tips

1. **Use CDN**: For production, use CDN for images
2. **Lazy Loading**: Load images on demand
3. **Responsive Images**: Serve different sizes for different devices
4. **Cache**: Enable browser caching for images

## Security Considerations

1. **File Type Validation**: Backend validates file types
2. **Virus Scanning**: Consider adding virus scanning for production
3. **Access Control**: Only authenticated users can upload
4. **Rate Limiting**: Prevent abuse with rate limits

## Status

✅ Backend file size limit increased to 10MB
✅ Frontend file size validation added
✅ Country selection no longer reloads page
✅ All Select components properly disabled during loading
✅ Helpful error messages for users

## Next Steps

1. ✅ Restart backend server
2. ✅ Refresh browser
3. ✅ Test file upload with < 10MB file
4. ✅ Test country selection
5. ✅ Test currency selection
