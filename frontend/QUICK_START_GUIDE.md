# Quick Start Guide - Event Edit Feature

## For End Users

### How to Edit an Event

1. **Navigate to Event**
   - Go to the event detail page: `http://localhost:3000/events/[event-id]`
   - You must be logged in as a HOST or ADMIN

2. **Click Edit Button**
   - Look for the Edit icon (pencil) in the top-right corner
   - Click it to open the edit page

3. **Make Changes**
   - Modify any fields you want to update
   - Changes auto-save every 2 seconds
   - Watch for "Saving..." and "Saved" indicators

4. **Select Country & Currency**
   - Choose a country from the dropdown
   - Currency will auto-fill based on country
   - Or manually select a different currency

5. **Upload Banner (Optional)**
   - Click "Choose File" to select an image
   - Click "Upload Banner" to upload
   - Or paste an image URL directly

6. **Add Tags (Optional)**
   - Enter tags separated by commas
   - Example: `tech, conference, networking`

7. **Save Changes**
   - Click "Update Event" button
   - You'll be redirected to the event detail page
   - Your changes are now live!

### Tips for Users

- ✅ **Auto-Save**: Your changes save automatically, but always click "Update Event" to finalize
- ✅ **Validation**: Red error messages show if something is wrong
- ✅ **Required Fields**: Fields marked with * are mandatory
- ✅ **Dates**: Start date must be in the future, end date must be after start
- ✅ **Capacity**: Must be a whole number between 1 and 1,000,000
- ✅ **Price**: Can be 0 for free events, or any amount up to 1,000,000

---

## For Developers

### Quick Setup

1. **Install Dependencies** (if not already done)
   ```bash
   cd frontend
   npm install
   # or
   bun install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

3. **Access Edit Page**
   ```
   http://localhost:3000/events/[id]/edit
   ```

### Using Countries & Currencies

```typescript
import { COUNTRIES, CURRENCIES, getCurrencyByCountry } from "@/lib/countries-currencies";

// Display country dropdown
<Select onValueChange={handleCountryChange}>
  {COUNTRIES.map((country) => (
    <SelectItem key={country.code} value={country.code}>
      {country.name}
    </SelectItem>
  ))}
</Select>

// Auto-select currency
const handleCountryChange = (code: string) => {
  const currency = getCurrencyByCountry(code);
  setValue("currency", currency);
};
```

### Using Debounce Hook

```typescript
import { useDebounce } from "@/hooks/useDebounce";

const debouncedSave = useDebounce(async (data) => {
  await saveData(data);
}, 2000);

// Use in component
useEffect(() => {
  const subscription = watch((value) => {
    debouncedSave(value);
  });
  return () => subscription.unsubscribe();
}, [watch, debouncedSave]);
```

### Using Validation Utils

```typescript
import { sanitizeInput, validateUrl, validateDateRange } from "@/lib/validation";

// Sanitize user input
const cleanName = sanitizeInput(userInput);

// Validate URL
if (!validateUrl(bannerUrl)) {
  setError("Invalid URL");
}

// Validate date range
if (!validateDateRange(startDate, endDate)) {
  setError("Invalid date range");
}
```

### Adding New Countries

```typescript
// In countries-currencies.ts
export const COUNTRIES = [
  // ... existing countries
  { code: "NZ", name: "New Zealand", currency: "NZD" },
] as const;
```

### Adding New Currencies

```typescript
// In countries-currencies.ts
export const CURRENCIES = [
  // ... existing currencies
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
] as const;
```

### Customizing Validation

```typescript
// In EventForm.tsx
const eventSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(200, "Name must not exceed 200 characters")
    .transform(sanitizeInput),
  // Add more fields...
});
```

### Customizing Auto-Save Delay

```typescript
// In edit/page.tsx
const handleAutoSave = useDebounce(async (data) => {
  await updateEvent(eventId, data);
}, 3000); // Change from 2000 to 3000 for 3-second delay
```

---

## Common Tasks

### Task 1: Add a New Mandatory Field

1. **Update Type Definition** (`types/event.ts`)
   ```typescript
   export type CreateEventRequest = {
     // ... existing fields
     newField: string;
   };
   ```

2. **Update Validation Schema** (`EventForm.tsx`)
   ```typescript
   const eventSchema = z.object({
     // ... existing fields
     newField: z.string().min(1, "New field is required"),
   });
   ```

3. **Add Form Field** (`EventForm.tsx`)
   ```tsx
   <div className="space-y-2">
     <Label htmlFor="newField">New Field *</Label>
     <Input id="newField" {...register("newField")} />
     {errors.newField && (
       <p className="text-sm text-destructive">{errors.newField.message}</p>
     )}
   </div>
   ```

### Task 2: Change Auto-Save Behavior

```typescript
// Disable auto-save
<EventForm
  onSubmit={handleSubmit}
  isEditMode={false} // Set to false
  // Don't pass onAutoSave prop
/>

// Enable auto-save with custom delay
const handleAutoSave = useDebounce(async (data) => {
  await updateEvent(eventId, data);
}, 5000); // 5 seconds

<EventForm
  onSubmit={handleSubmit}
  isEditMode={true}
  onAutoSave={handleAutoSave}
/>
```

### Task 3: Add Custom Validation Rule

```typescript
const eventSchema = z.object({
  // ... existing fields
}).refine((data) => {
  // Custom validation logic
  return data.capacity >= data.minCapacity;
}, {
  message: "Capacity must be at least minimum capacity",
  path: ["capacity"],
});
```

### Task 4: Customize Error Messages

```typescript
const eventSchema = z.object({
  name: z.string()
    .min(3, "Event name is too short! Please use at least 3 characters.")
    .max(200, "Event name is too long! Please keep it under 200 characters."),
});
```

### Task 5: Add Field-Level Sanitization

```typescript
const customSanitize = (input: string): string => {
  return input
    .trim()
    .replace(/[<>\"']/g, "")
    .replace(/\s+/g, " "); // Replace multiple spaces with single space
};

const eventSchema = z.object({
  name: z.string().transform(customSanitize),
});
```

---

## Troubleshooting

### Issue: Edit page shows 404
**Solution**: Make sure you're accessing `/events/[id]/edit` with a valid event ID

### Issue: Auto-save not working
**Check**:
- Is `isEditMode` prop set to `true`?
- Is `onAutoSave` prop passed to EventForm?
- Check browser console for errors

### Issue: Currency not auto-selecting
**Check**:
- Is country code valid (2 letters)?
- Is country in COUNTRIES array?
- Check browser console for errors

### Issue: Validation errors not showing
**Check**:
- Is field registered with `{...register("fieldName")}`?
- Is error displayed with `{errors.fieldName && ...}`?
- Check Zod schema for field

### Issue: Form not submitting
**Check**:
- Are all mandatory fields filled?
- Are there any validation errors?
- Check browser console for errors
- Check network tab for API errors

### Issue: Unauthorized access
**Check**:
- Is user logged in?
- Does user have HOST or ADMIN role?
- Is token valid (not expired)?

---

## API Reference

### Update Event
```typescript
PUT /api/events/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Event Name",
  "description": "Updated description",
  "startDate": "2025-01-01T10:00:00Z",
  "endDate": "2025-01-01T18:00:00Z",
  "location": "New York, USA",
  "capacity": 100,
  "price": 50.00,
  "currency": "USD"
}
```

### Response
```json
{
  "id": 1,
  "name": "Updated Event Name",
  "description": "Updated description",
  "startDate": "2025-01-01T10:00:00Z",
  "endDate": "2025-01-01T18:00:00Z",
  "location": "New York, USA",
  "capacity": 100,
  "availableSeats": 100,
  "price": 50.00,
  "currency": "USD",
  "status": "PUBLISHED",
  "createdAt": "2024-12-01T10:00:00Z",
  "updatedAt": "2024-12-28T10:00:00Z"
}
```

---

## Best Practices

### For Users
1. ✅ Always review changes before clicking "Update Event"
2. ✅ Use descriptive event names and descriptions
3. ✅ Set realistic capacity and pricing
4. ✅ Upload high-quality banner images
5. ✅ Add relevant tags for better discoverability

### For Developers
1. ✅ Always sanitize user input
2. ✅ Validate data on both frontend and backend
3. ✅ Use TypeScript for type safety
4. ✅ Handle errors gracefully
5. ✅ Test with different user roles
6. ✅ Keep validation rules consistent
7. ✅ Document custom validation logic
8. ✅ Use debouncing for expensive operations
9. ✅ Provide clear error messages
10. ✅ Test on multiple browsers and devices

---

## Resources

- **Documentation**: See `EVENT_EDIT_FEATURE.md` for detailed docs
- **Countries Guide**: See `COUNTRIES_CURRENCIES_GUIDE.md` for usage examples
- **Testing**: See `TESTING_CHECKLIST.md` for comprehensive tests
- **Implementation**: See `IMPLEMENTATION_SUMMARY.md` for technical details

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the documentation files
3. Check browser console for errors
4. Check network tab for API errors
5. Verify user permissions and authentication

---

## Next Steps

1. ✅ Test the edit functionality
2. ✅ Customize validation rules as needed
3. ✅ Add more countries/currencies if needed
4. ✅ Implement additional features (drafts, templates, etc.)
5. ✅ Deploy to production

Happy coding! 🚀
