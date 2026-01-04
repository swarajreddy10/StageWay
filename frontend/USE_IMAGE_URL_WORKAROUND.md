# Quick Fix: Use Image URL Instead of Upload

## Issue
File upload returns 500 error - likely Redis connection issue for storing file metadata.

## Immediate Solution: Use Image URL

Instead of uploading files, use direct image URLs:

### Option 1: Use Free Image Hosting

1. **Imgur** (Recommended)
   - Go to: https://imgur.com/upload
   - Upload your image
   - Right-click image → "Copy image address"
   - Paste URL in "Banner URL" field

2. **ImgBB**
   - Go to: https://imgbb.com/
   - Upload image
   - Copy direct link
   - Paste in "Banner URL" field

3. **Cloudinary**
   - Go to: https://cloudinary.com/
   - Upload image
   - Copy URL
   - Paste in "Banner URL" field

### Option 2: Use Supabase Storage

Since you're already using Supabase:

1. Go to Supabase Dashboard
2. Navigate to Storage
3. Create a bucket (e.g., "event-banners")
4. Upload your image
5. Get public URL
6. Paste in "Banner URL" field

### How to Use in Form

1. Go to edit page
2. Scroll to "Event Banner" section
3. **Skip the file upload**
4. Paste URL directly in "Banner URL" field
5. Preview will show immediately
6. Click "Update Event"
7. ✅ Works!

## Example URLs

```
https://i.imgur.com/abc123.jpg
https://ibb.co/xyz789
https://res.cloudinary.com/demo/image/upload/sample.jpg
https://sqcyzvkbogdskfqcuxeo.supabase.co/storage/v1/object/public/banners/image.jpg
```

## Why This Works

- No file upload needed
- No Redis dependency
- Faster (no upload time)
- Images hosted on CDN
- Better performance

## Fixing File Upload (For Later)

The 500 error is likely because:
1. Redis is not running
2. Redis connection failed
3. File metadata storage failed

### To Fix Redis Issue:

1. **Check if Redis is running:**
```bash
redis-cli ping
# Should return: PONG
```

2. **Start Redis if not running:**
```bash
# Windows (if installed)
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis
```

3. **Or disable Redis in application.yml:**
```yaml
spring:
  session:
    store-type: none  # Change from 'redis' to 'none'
```

## Recommended Approach

**For now**: Use image URLs (faster, simpler)
**For production**: Fix Redis or use cloud storage (S3, Supabase Storage)

## Testing

1. Find any image URL online
2. Copy the URL
3. Paste in "Banner URL" field
4. Should see preview immediately
5. Save event
6. ✅ Works!

## Status

- ❌ File upload: Not working (Redis issue)
- ✅ Image URL: Works perfectly
- ✅ Preview: Works
- ✅ Save: Works

---

**Use image URLs for now - it's faster and works perfectly!**
