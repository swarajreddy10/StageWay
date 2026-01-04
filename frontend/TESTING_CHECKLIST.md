# Testing Checklist - Event Edit Feature

## Pre-Testing Setup

- [ ] Backend server running on port 8081
- [ ] Frontend server running on port 3000
- [ ] Database connected and seeded
- [ ] Test user accounts created (HOST and ATTENDEE roles)
- [ ] At least one test event created

## 1. Route Access Tests

### Edit Route (GET /events/[id]/edit)
- [ ] Route exists and doesn't return 404
- [ ] Authenticated HOST can access edit page
- [ ] Authenticated ADMIN can access edit page
- [ ] Unauthenticated user redirected to login
- [ ] ATTENDEE role redirected to dashboard
- [ ] Invalid event ID shows "Event not found"
- [ ] Loading state shows while fetching event

## 2. Form Pre-Population Tests

### Data Loading
- [ ] Event name pre-filled correctly
- [ ] Description pre-filled correctly
- [ ] Category selected correctly
- [ ] Start date/time pre-filled correctly
- [ ] End date/time pre-filled correctly
- [ ] Location pre-filled correctly
- [ ] Venue name pre-filled correctly
- [ ] Capacity pre-filled correctly
- [ ] Price pre-filled correctly
- [ ] Currency selected correctly
- [ ] Banner URL pre-filled correctly
- [ ] Tags pre-filled correctly (comma-separated)

## 3. Validation Tests

### Mandatory Fields
- [ ] Name: Shows error if less than 3 characters
- [ ] Name: Shows error if more than 200 characters
- [ ] Name: Accepts valid input (3-200 chars)
- [ ] Description: Shows error if less than 10 characters
- [ ] Description: Shows error if more than 5000 characters
- [ ] Description: Accepts valid input (10-5000 chars)
- [ ] Start Date: Shows error if empty
- [ ] Start Date: Shows error if in the past
- [ ] End Date: Shows error if empty
- [ ] End Date: Shows error if before start date
- [ ] Location: Shows error if less than 3 characters
- [ ] Location: Shows error if more than 500 characters
- [ ] Capacity: Shows error if less than 1
- [ ] Capacity: Shows error if more than 1,000,000
- [ ] Capacity: Shows error if not an integer

### Optional Fields
- [ ] Category: Can be left empty
- [ ] Category: Accepts valid enum values
- [ ] Venue Name: Can be left empty
- [ ] Venue Name: Shows error if more than 200 characters
- [ ] Price: Can be 0 (free event)
- [ ] Price: Shows error if negative
- [ ] Price: Shows error if more than 1,000,000
- [ ] Price: Accepts decimal values
- [ ] Currency: Defaults to USD if not selected
- [ ] Currency: Shows error if not 3 characters
- [ ] Banner URL: Can be left empty
- [ ] Banner URL: Shows error if invalid URL format
- [ ] Tags: Can be left empty
- [ ] Tags: Accepts comma-separated values

### Input Sanitization
- [ ] HTML tags removed from name
- [ ] HTML tags removed from description
- [ ] HTML tags removed from location
- [ ] HTML tags removed from venue name
- [ ] Script tags blocked
- [ ] Special characters handled correctly

## 4. Countries & Currencies Tests

### Country Selection
- [ ] Country dropdown shows 20+ countries
- [ ] Countries sorted alphabetically
- [ ] Can search/filter countries
- [ ] Selecting country auto-fills currency
- [ ] Can change country after selection

### Currency Selection
- [ ] Currency dropdown shows 16+ currencies
- [ ] Currencies show symbol, code, and name
- [ ] Can manually change currency
- [ ] Currency persists after country change
- [ ] Invalid currency code rejected

### Auto-Selection
- [ ] US → USD
- [ ] GB → GBP
- [ ] IN → INR
- [ ] DE/FR/IT/ES → EUR
- [ ] JP → JPY
- [ ] CN → CNY

## 5. Auto-Save Tests

### Debouncing
- [ ] Auto-save triggers 2 seconds after typing stops
- [ ] Multiple rapid changes only trigger one save
- [ ] Shows "Saving..." status during save
- [ ] Shows "Saved" status after successful save
- [ ] Shows "Failed to save" on error
- [ ] Status message disappears after 2 seconds

### Auto-Save Behavior
- [ ] Only active in edit mode (not create mode)
- [ ] Saves partial changes
- [ ] Doesn't trigger on initial load
- [ ] Doesn't interfere with manual save
- [ ] Works for all form fields
- [ ] Handles network errors gracefully

## 6. Form Submission Tests

### Successful Submission
- [ ] "Update Event" button enabled when form valid
- [ ] Shows loading spinner during submission
- [ ] Redirects to event detail page on success
- [ ] Event data updated in database
- [ ] Updated data visible on detail page
- [ ] Success message shown (if implemented)

### Failed Submission
- [ ] Shows error message on failure
- [ ] Form data preserved after error
- [ ] Can retry submission
- [ ] Network errors handled
- [ ] Validation errors shown
- [ ] Button re-enabled after error

## 7. UI/UX Tests

### Visual Feedback
- [ ] Loading spinner shows while fetching event
- [ ] Auto-save status visible and clear
- [ ] Error messages styled correctly
- [ ] Success states styled correctly
- [ ] Disabled states styled correctly
- [ ] Focus states visible

### Navigation
- [ ] "Back to Event" button works
- [ ] Edit button visible on event detail page (for HOST/ADMIN)
- [ ] Edit button hidden for ATTENDEE role
- [ ] Edit button hidden for unauthenticated users
- [ ] Breadcrumb navigation works (if implemented)

### Responsive Design
- [ ] Form usable on mobile (320px width)
- [ ] Form usable on tablet (768px width)
- [ ] Form usable on desktop (1024px+ width)
- [ ] Dropdowns work on touch devices
- [ ] Date pickers work on mobile
- [ ] Image upload works on mobile

## 8. Image Upload Tests

### Banner Upload
- [ ] File input accepts images
- [ ] Upload button enabled when file selected
- [ ] Shows "Uploading..." during upload
- [ ] Shows success message after upload
- [ ] Preview updates with uploaded image
- [ ] Can paste URL instead of uploading
- [ ] Invalid URLs rejected
- [ ] Large files handled (size limit)
- [ ] Invalid file types rejected

## 9. Integration Tests

### API Integration
- [ ] GET /api/events/:id returns event data
- [ ] PUT /api/events/:id updates event
- [ ] Authorization header sent with requests
- [ ] 401 errors handled (token expired)
- [ ] 403 errors handled (insufficient permissions)
- [ ] 404 errors handled (event not found)
- [ ] 500 errors handled (server error)

### State Management
- [ ] Event store updated after edit
- [ ] Current event updated in store
- [ ] Events list updated in store
- [ ] Store persists across navigation
- [ ] Error state cleared appropriately

## 10. Edge Cases

### Data Edge Cases
- [ ] Event with no banner URL
- [ ] Event with no tags
- [ ] Event with no category
- [ ] Event with no venue name
- [ ] Free event (price = 0)
- [ ] Event at capacity (availableSeats = 0)
- [ ] Event with very long description
- [ ] Event with special characters in name

### User Edge Cases
- [ ] User loses internet during edit
- [ ] User navigates away during auto-save
- [ ] User opens multiple edit tabs
- [ ] User's token expires during edit
- [ ] User's role changes during edit

### Browser Edge Cases
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge
- [ ] Works in mobile browsers
- [ ] Works with JavaScript disabled (graceful degradation)
- [ ] Works with slow network (3G)

## 11. Performance Tests

### Load Time
- [ ] Page loads in < 2 seconds
- [ ] Form renders in < 500ms
- [ ] Auto-save completes in < 1 second
- [ ] Image upload completes in < 5 seconds

### Memory
- [ ] No memory leaks on repeated edits
- [ ] Debounce timers cleaned up
- [ ] Event listeners removed on unmount

## 12. Accessibility Tests

### Keyboard Navigation
- [ ] Can tab through all form fields
- [ ] Can submit form with Enter key
- [ ] Can close dropdowns with Escape
- [ ] Focus visible on all interactive elements

### Screen Reader
- [ ] Form labels read correctly
- [ ] Error messages announced
- [ ] Loading states announced
- [ ] Success messages announced

### ARIA Attributes
- [ ] aria-label on icon buttons
- [ ] aria-required on mandatory fields
- [ ] aria-invalid on error fields
- [ ] aria-describedby for error messages

## 13. Security Tests

### Input Security
- [ ] XSS attempts blocked
- [ ] SQL injection attempts blocked
- [ ] Script tags removed
- [ ] HTML tags sanitized
- [ ] URL validation prevents javascript: URLs

### Authentication
- [ ] Unauthenticated requests rejected
- [ ] Expired tokens handled
- [ ] Invalid tokens rejected
- [ ] CSRF protection active

### Authorization
- [ ] ATTENDEE cannot edit events
- [ ] HOST can only edit own events
- [ ] ADMIN can edit all events
- [ ] Role changes reflected immediately

## Test Results Summary

| Category | Passed | Failed | Skipped | Total |
|----------|--------|--------|---------|-------|
| Route Access | | | | 7 |
| Form Pre-Population | | | | 12 |
| Validation | | | | 30 |
| Countries & Currencies | | | | 11 |
| Auto-Save | | | | 12 |
| Form Submission | | | | 12 |
| UI/UX | | | | 15 |
| Image Upload | | | | 9 |
| Integration | | | | 9 |
| Edge Cases | | | | 17 |
| Performance | | | | 4 |
| Accessibility | | | | 11 |
| Security | | | | 13 |
| **TOTAL** | | | | **162** |

## Bug Report Template

```markdown
### Bug Title
[Brief description]

### Steps to Reproduce
1. 
2. 
3. 

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- Browser: 
- OS: 
- User Role: 
- Event ID: 

### Screenshots
[If applicable]

### Console Errors
[If any]

### Priority
[ ] Critical
[ ] High
[ ] Medium
[ ] Low
```

## Testing Notes

- Test with different user roles
- Test with different event states (draft, published, cancelled)
- Test with different data sizes (small, medium, large)
- Test with different network conditions (fast, slow, offline)
- Test with different browsers and devices
- Document any issues found
- Retest after fixes applied
