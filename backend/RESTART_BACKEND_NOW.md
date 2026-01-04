# CRITICAL: Backend Restart Required

## ⚠️ YOU MUST RESTART THE BACKEND SERVER

The file upload configuration has been updated but **will NOT take effect** until you restart the backend.

## Quick Restart Steps

### 1. Stop Backend
In the terminal running the backend, press:
```
Ctrl + C
```

### 2. Wait for Complete Shutdown
Wait until you see the process has stopped completely.

### 3. Start Backend Again
```bash
cd backend
mvn spring-boot:run
```

### 4. Wait for Startup
Wait until you see:
```
Started BackendApplication in X.XXX seconds
```

## New Configuration

### File Upload Limits (Increased to 20MB)
```yaml
server:
  tomcat:
    max-swallow-size: 20MB
    max-http-form-post-size: 20MB

spring:
  servlet:
    multipart:
      max-file-size: 20MB
      max-request-size: 20MB
```

## Why 20MB?

Your file was 1.38MB, but we set the limit to 20MB to:
- Allow room for larger images
- Prevent future upload issues
- Support high-quality banners

## Verification

After restart, check backend logs for:
```
✅ Should NOT see: "Maximum upload size exceeded"
✅ Should see: Successful file upload
```

## Test Upload

1. **Refresh browser** (Ctrl + Shift + R)
2. Go to edit page
3. Select your image (1.38MB)
4. Click "Upload Banner"
5. ✅ Should work now!

## If Still Not Working

### Check 1: Backend Actually Restarted
```bash
# Look for this in backend logs:
Started BackendApplication in X.XXX seconds
```

### Check 2: Configuration Loaded
```bash
# Backend should show on startup:
spring.servlet.multipart.max-file-size=20MB
```

### Check 3: Port is Correct
```bash
# Should see:
Tomcat started on port 8081
```

### Check 4: Try Smaller File First
- Test with a small file (< 1MB) first
- If that works, try your 1.38MB file

## Common Mistakes

❌ **Not restarting backend** - Configuration won't load
❌ **Restarting frontend only** - Backend needs restart
❌ **Not waiting for complete shutdown** - Old process still running
❌ **Wrong directory** - Must be in `backend` folder

## File Size Reference

| Size | Status |
|------|--------|
| < 1MB | ✅ Always works |
| 1-5MB | ✅ Works (your file is here) |
| 5-10MB | ✅ Works |
| 10-20MB | ✅ Works |
| > 20MB | ❌ Too large |

## Your File

- **Size**: 1.38MB (1,383,781 bytes)
- **Status**: ✅ Will work after backend restart
- **Limit**: 20MB (plenty of room)

## Alternative: Use Image URL

If you can't restart backend right now:
1. Upload image to imgur.com or similar
2. Copy the image URL
3. Paste URL in "Banner URL" field
4. Skip file upload

## Status Checklist

- [ ] Backend stopped (Ctrl+C)
- [ ] Backend restarted (mvn spring-boot:run)
- [ ] Saw "Started BackendApplication" message
- [ ] Browser refreshed (Ctrl+Shift+R)
- [ ] Ready to test upload

---

**RESTART BACKEND NOW TO FIX FILE UPLOAD!**
