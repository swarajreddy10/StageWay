# Quick Reference: Countries & Currencies

## Import

```typescript
import { COUNTRIES, CURRENCIES, getCurrencyByCountry, getCurrencySymbol } from "@/lib/countries-currencies";
```

## Usage Examples

### 1. Display Country Dropdown

```tsx
<Select onValueChange={handleCountryChange}>
  <SelectTrigger>
    <SelectValue placeholder="Select country" />
  </SelectTrigger>
  <SelectContent>
    {COUNTRIES.map((country) => (
      <SelectItem key={country.code} value={country.code}>
        {country.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 2. Display Currency Dropdown

```tsx
<Select onValueChange={handleCurrencyChange}>
  <SelectTrigger>
    <SelectValue placeholder="Select currency" />
  </SelectTrigger>
  <SelectContent>
    {CURRENCIES.map((currency) => (
      <SelectItem key={currency.code} value={currency.code}>
        {currency.symbol} {currency.code} - {currency.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 3. Auto-Select Currency from Country

```typescript
const handleCountryChange = (countryCode: string) => {
  const currency = getCurrencyByCountry(countryCode);
  setValue("currency", currency);
};
```

### 4. Display Price with Currency Symbol

```typescript
const symbol = getCurrencySymbol(event.currency);
const formattedPrice = `${symbol}${event.price.toFixed(2)}`;
// Example: "$99.99" or "€50.00"
```

## Adding More Countries/Currencies

### Add a Country

```typescript
// In countries-currencies.ts
export const COUNTRIES = [
  // ... existing countries
  { code: "NZ", name: "New Zealand", currency: "NZD" },
] as const;
```

### Add a Currency

```typescript
// In countries-currencies.ts
export const CURRENCIES = [
  // ... existing currencies
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
] as const;
```

## Validation Examples

### Validate Currency Code

```typescript
import { z } from "zod";

const currencySchema = z.string().length(3, "Currency must be 3 letters");
```

### Validate Country Code

```typescript
const countrySchema = z.string().length(2, "Country code must be 2 letters");
```

## Best Practices

1. **Always validate currency codes** - Use 3-letter ISO codes (USD, EUR, GBP)
2. **Store prices as numbers** - Don't store currency symbols in database
3. **Use currency for display only** - Convert to user's currency on frontend
4. **Handle missing currencies** - Default to USD if currency not found
5. **Consider exchange rates** - For multi-currency support

## Common Patterns

### Pattern 1: Country-First Selection

```typescript
// User selects country first, currency auto-fills
const [country, setCountry] = useState("");
const [currency, setCurrency] = useState("");

const handleCountryChange = (code: string) => {
  setCountry(code);
  setCurrency(getCurrencyByCountry(code));
};
```

### Pattern 2: Independent Selection

```typescript
// User can select country and currency independently
const [country, setCountry] = useState("");
const [currency, setCurrency] = useState("USD");

// No auto-selection, full control
```

### Pattern 3: Smart Defaults

```typescript
// Detect user's location and set defaults
useEffect(() => {
  const userCountry = detectUserCountry(); // From IP or browser
  setCountry(userCountry);
  setCurrency(getCurrencyByCountry(userCountry));
}, []);
```

## Internationalization (i18n)

For multi-language support:

```typescript
// Use i18n library for country names
import { useTranslation } from "next-i18next";

const { t } = useTranslation("countries");

<SelectItem value={country.code}>
  {t(country.code)} {/* Translates country name */}
</SelectItem>
```

## API Response Format

When sending to backend:

```json
{
  "location": "New York, USA",
  "currency": "USD",
  "price": 99.99
}
```

When receiving from backend:

```json
{
  "location": "New York, USA",
  "currency": "USD",
  "price": 99.99,
  "formattedPrice": "$99.99"
}
```

## Testing

```typescript
import { getCurrencyByCountry, getCurrencySymbol } from "@/lib/countries-currencies";

describe("Countries & Currencies", () => {
  it("should return correct currency for country", () => {
    expect(getCurrencyByCountry("US")).toBe("USD");
    expect(getCurrencyByCountry("GB")).toBe("GBP");
  });

  it("should return correct symbol for currency", () => {
    expect(getCurrencySymbol("USD")).toBe("$");
    expect(getCurrencySymbol("EUR")).toBe("€");
  });

  it("should default to USD for unknown country", () => {
    expect(getCurrencyByCountry("XX")).toBe("USD");
  });
});
```
