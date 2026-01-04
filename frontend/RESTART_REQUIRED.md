# Quick Fix - Restart Required

## ⚠️ IMPORTANT: Restart Frontend Server

The environment variables have been updated. You MUST restart the frontend server for changes to take effect.

## Steps to Restart

### 1. Stop Frontend Server
Press `Ctrl+C` in the terminal running the frontend

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
# or
bun dev
```

### 3. Wait for Server to Start
Look for: `Ready on http://localhost:3000`

## Quick Test

### Test 1: File Upload
1. Go to: http://localhost:3000/events/1/edit
2. Scroll to "Event Banner" section
3. Click "Choose File" → Select an image
4. Click "Upload Banner"
5. ✅ Should see "Banner uploaded. Preview updated."

### Test 2: Country & Currency
1. Scroll to "Location" section
2. Click "Country" dropdown
3. Select "United States"
4. ✅ Currency should auto-change to "USD"

### Test 3: Price
1. Scroll to "Pricing" section
2. Enter price: `50`
3. Currency should show: `$ USD - US Dollar`
4. ✅ Both fields should be filled

### Test 4: Save Event
1. Make any change (e.g., update description)
2. Wait 2 seconds (auto-save)
3. ✅ Should see "Saved" indicator
4. Click "Update Event"
5. ✅ Should redirect to event detail page

## If Still Not Working

### Check 1: Environment Variables Loaded
```bash
# In frontend directory
cat .env.local | grep API_BASE_URL
```
Should show:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
NEXT_PUBLIC_FILE_API_BASE_URL=http://localhost:8081
```

### Check 2: Backend Running
```bash
curl http://localhost:8081/api/events
```
Should return JSON array of events

### Check 3: Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors
4. Should NOT see "NEXT_PUBLIC_FILE_API_BASE_URL is not set"

### Check 4: Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try uploading a file
4. Look for POST request to `/api/files`
5. Should return 200 OK with file asset

## Common Issues After Restart

### Issue: Still getting 400 error
**Solution**: Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: File upload still failing
**Solution**: Check backend logs for errors

### Issue: Currency not auto-selecting
**Solution**: Clear form and reload page

### Issue: Changes not saving
**Solution**: Check browser console for errors

## Verification Checklist

- [ ] Frontend server restarted
- [ ] Can access http://localhost:3000
- [ ] Can access edit page
- [ ] File upload button works
- [ ] Country dropdown shows countries
- [ ] Currency dropdown shows currencies
- [ ] Price field accepts numbers
- [ ] Auto-save shows "Saved" status
- [ ] Manual save redirects to detail page

## Need Help?

1. Check `COMPLETE_FIX.md` for detailed fixes
2. Check browser console for errors
3. Check backend logs for errors
4. Verify all environment variables are set

## Status After Restart

✅ File upload should work
✅ Country/currency should work
✅ Price should save correctly
✅ Banner URL should save correctly
✅ All form fields should work

---

**Remember**: Always restart the server after changing `.env.local` file!
