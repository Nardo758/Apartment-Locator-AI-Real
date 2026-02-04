# Competition Sets Management UI

## Overview

This UI implementation provides a complete interface for landlords to create, manage, and monitor competition sets. A competition set allows landlords to track multiple competitor properties against their own portfolio properties and receive alerts about pricing changes, concessions, and market activity.

## Components

### 1. CompetitionSetManager (Main Component)

The primary component that displays all competition sets, handles CRUD operations, and manages the dialog state.

**Props:**
- `userId: string` - The authenticated user's ID
- `authToken: string` - JWT authentication token

**Features:**
- List all competition sets
- Create new competition sets
- Edit existing competition sets
- Delete competition sets
- View detailed competitor information
- Real-time loading states
- Error handling with toast notifications

**Usage:**
```tsx
import { CompetitionSetManager } from '@/components/landlord/CompetitionSetManager';

function LandlordDashboard() {
  const userId = useUser().id;
  const authToken = useAuth().token;

  return (
    <div className="container mx-auto p-6">
      <CompetitionSetManager userId={userId} authToken={authToken} />
    </div>
  );
}
```

### 2. CompetitionSetDialog (Multi-Step Wizard)

A comprehensive dialog with a 4-step wizard for creating or editing competition sets.

**Props:**
- `open: boolean` - Controls dialog visibility
- `onOpenChange: (open: boolean) => void` - Callback when dialog state changes
- `onSubmit: (data: CompetitionSetFormData) => Promise<void>` - Form submission handler
- `editData?: object` - Optional data for editing existing set
- `userProperties?: Property[]` - User's properties for selection
- `isLoading?: boolean` - Loading state

**Steps:**
1. **Name Set** - Set name and description
2. **Select Properties** - Choose which properties to track
3. **Add Competitors** - Search or manually add competitor addresses
4. **Configure Alerts** - Enable/disable pricing alerts

**Features:**
- Step-by-step validation
- Progress indicator
- Search for competitors (ready for API integration)
- Manual competitor entry
- Duplicate detection
- Real-time form validation
- Summary view before submission

**Usage:**
```tsx
import { CompetitionSetDialog } from '@/components/landlord/CompetitionSetDialog';

function MyComponent() {
  const [open, setOpen] = useState(false);
  const [properties, setProperties] = useState([]);

  const handleSubmit = async (data) => {
    const response = await fetch('/api/competition-sets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    // Handle response
  };

  return (
    <CompetitionSetDialog
      open={open}
      onOpenChange={setOpen}
      onSubmit={handleSubmit}
      userProperties={properties}
    />
  );
}
```

### 3. CompetitorSearchResult (Search Result Card)

A card component for displaying competitor properties in search results.

**Props:**
- `property: CompetitorProperty` - Property data to display
- `onAdd: (property: CompetitorProperty) => void` - Callback when adding competitor
- `isAdded?: boolean` - Whether the competitor is already added
- `isLoading?: boolean` - Loading state

**Features:**
- Clean, compact display
- Distance indicator (from search center)
- Property details (beds, baths, sqft, rent)
- Amenities badges
- Source indicator
- Add/Added state toggle

**Usage:**
```tsx
import { CompetitorSearchResult } from '@/components/landlord/CompetitorSearchResult';

function SearchResults({ results, onAdd }) {
  return (
    <div className="space-y-3">
      {results.map((property) => (
        <CompetitorSearchResult
          key={property.id}
          property={property}
          onAdd={onAdd}
          isAdded={false}
        />
      ))}
    </div>
  );
}
```

## API Integration

### Required Endpoints

The components are designed to work with the following API endpoints:

#### 1. GET /api/competition-sets
Fetch all competition sets for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "sets": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "Downtown Competitors",
      "description": "...",
      "ownPropertyIds": ["uuid1", "uuid2"],
      "competitorCount": 12,
      "alertsEnabled": true,
      "createdAt": "2026-02-04T10:00:00Z",
      "updatedAt": "2026-02-04T10:00:00Z"
    }
  ],
  "total": 5,
  "limit": 50,
  "offset": 0
}
```

#### 2. POST /api/competition-sets
Create a new competition set.

**Request:**
```json
{
  "name": "Downtown Premium Competitors",
  "description": "Track luxury apartments",
  "ownPropertyIds": ["uuid1", "uuid2"],
  "alertsEnabled": true
}
```

**Response:** `201 Created`

#### 3. GET /api/competition-sets/:id
Get detailed competition set with competitors.

**Response:**
```json
{
  "id": "uuid",
  "name": "...",
  "competitors": [
    {
      "id": "uuid",
      "address": "123 Main St",
      "bedrooms": 2,
      "bathrooms": 2.0,
      "currentRent": 2200,
      "amenities": ["pool", "gym"]
    }
  ]
}
```

#### 4. PATCH /api/competition-sets/:id
Update an existing competition set.

**Request:**
```json
{
  "name": "Updated Name",
  "alertsEnabled": false
}
```

#### 5. DELETE /api/competition-sets/:id
Delete a competition set (cascades to competitors).

**Response:** `204 No Content`

#### 6. POST /api/competition-sets/:id/competitors
Add a competitor to a set.

**Request:**
```json
{
  "address": "123 Main St, Austin, TX",
  "latitude": 30.2672,
  "longitude": -97.7431,
  "bedrooms": 2,
  "bathrooms": 2.0,
  "squareFeet": 1100,
  "currentRent": 2200,
  "amenities": ["pool", "gym"],
  "source": "manual"
}
```

#### 7. GET /api/landlord/properties
Fetch user's properties for selection in dialog.

**Query Params:**
- `userId: string`

**Response:**
```json
{
  "properties": [
    {
      "id": "uuid",
      "address": "456 Oak St",
      "bedrooms": 2,
      "bathrooms": 2.0,
      "currentRent": 2000
    }
  ]
}
```

### Error Handling

All components include comprehensive error handling:
- Network errors display toast notifications
- Validation errors show inline
- Loading states prevent duplicate submissions
- Confirmation dialogs for destructive actions

## Styling

Components use the application's design system:
- **Dark theme** with glassmorphism effects
- **Purple/Blue gradient** accent colors
- **Responsive** layout (mobile-friendly)
- **Smooth animations** and transitions
- **Accessible** with proper ARIA labels

## Validation

### Competition Set Name
- Required field
- Maximum 255 characters
- Cannot be empty string

### Property Selection
- At least one property must be selected
- Multiple selection supported

### Competitors
- Address is required
- Duplicate addresses prevented within same set
- Optional: coordinates, rent, amenities

## State Management

The components manage their own state internally:
- Form data (name, description, properties, competitors, alerts)
- Loading states
- Error states
- Dialog open/close
- Expanded/collapsed views

No external state management library required.

## Testing

### Manual Testing Checklist

1. **Create Competition Set**
   - [ ] Open dialog
   - [ ] Enter set name
   - [ ] Select properties
   - [ ] Add competitors (search and manual)
   - [ ] Configure alerts
   - [ ] Submit and verify creation

2. **Edit Competition Set**
   - [ ] Click edit button
   - [ ] Modify fields
   - [ ] Save changes
   - [ ] Verify updates

3. **Delete Competition Set**
   - [ ] Click delete button
   - [ ] Confirm deletion
   - [ ] Verify removal

4. **View Details**
   - [ ] Expand competition set
   - [ ] View competitor list
   - [ ] Check data accuracy

5. **Error Handling**
   - [ ] Test with invalid data
   - [ ] Test network failures
   - [ ] Verify error messages

### API Testing

Use the provided test script:
```bash
cd apartment-locator-ai
./test-competition-sets.sh
```

Or manually test with curl:
```bash
# Get auth token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"landlord@example.com","password":"password123"}' \
  | jq -r '.token')

# Create competition set
curl -X POST http://localhost:5000/api/competition-sets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Competitors",
    "description": "Tracking premium apartments",
    "ownPropertyIds": [],
    "alertsEnabled": true
  }'
```

## Future Enhancements

### Planned Features
1. **Map View** - Visual display of competitors on map
2. **Bulk Import** - CSV upload for multiple competitors
3. **Price History** - Historical rent tracking charts
4. **Comparison Matrix** - Side-by-side property comparison
5. **Alert Management** - Configure alert preferences per set
6. **Export Data** - Download competitor data as CSV/Excel
7. **Property Photos** - Display competitor property images
8. **Notes & Tags** - Add custom notes and tags to competitors

### API Enhancements Needed
- Competitor search by location/radius
- Geocoding for addresses
- Property data scraping integration
- Price change tracking
- Alert generation and delivery

## Troubleshooting

### Common Issues

**"Failed to load competition sets"**
- Check authentication token is valid
- Verify API endpoint is accessible
- Check network connection

**"Failed to save competition set"**
- Ensure all required fields are filled
- Check for validation errors
- Verify user has permission

**Properties not loading in dialog**
- Confirm landlord properties endpoint exists
- Check user has properties in database
- Verify property data format matches expected schema

**Competitors not appearing**
- Check if competitors were added successfully
- Verify competition set details endpoint
- Confirm competitor data structure

## File Structure

```
src/components/landlord/
├── CompetitionSetManager.tsx          # Main manager component
├── CompetitionSetDialog.tsx           # Multi-step wizard dialog
├── CompetitorSearchResult.tsx         # Search result card
└── COMPETITION_SETS_UI_README.md      # This file
```

## Dependencies

Required packages (already in project):
- `react` - UI framework
- `@radix-ui/react-dialog` - Dialog component
- `@radix-ui/react-switch` - Switch component
- `@radix-ui/react-label` - Label component
- `lucide-react` - Icons
- `class-variance-authority` - Variant styles
- `@tanstack/react-query` - Data fetching (optional)

## Support

For issues or questions:
1. Check this documentation
2. Review API implementation docs
3. Test with provided scripts
4. Check browser console for errors

---

**Implementation Status:** ✅ Complete

All three components are fully implemented, styled, and ready for integration with the backend API endpoints.
