# Deal Pipeline API Documentation

## Overview
Complete deal pipeline management system for real estate agents. Track leads through the entire sales funnel from initial contact to closed deal.

## Database Schema

### Deals Table
```typescript
{
  id: uuid (primary key)
  agentId: uuid (references users.id) - Agent managing the deal
  clientId: uuid (references users.id, optional) - Associated client account
  clientName: string (required) - Client name
  clientEmail: string (optional) - Client email
  clientPhone: string (optional) - Client phone
  propertyId: uuid (references properties.id, optional) - Associated property
  propertyAddress: string (optional) - Property address
  stage: enum - Current pipeline stage
    - 'lead' - Initial contact/inquiry
    - 'showing' - Scheduled or completed showing
    - 'offer' - Offer submitted
    - 'contract' - Under contract
    - 'closed' - Deal closed
  dealValue: decimal (optional) - Total deal value
  commissionRate: decimal (optional) - Commission percentage
  estimatedCommission: decimal (optional) - Expected commission amount
  expectedCloseDate: timestamp (optional) - Target close date
  actualCloseDate: timestamp (optional) - Actual close date
  status: enum - Deal status
    - 'active' - Currently active
    - 'archived' - Archived (soft delete)
    - 'won' - Successfully closed
    - 'lost' - Deal fell through
  priority: enum - Deal priority
    - 'low'
    - 'medium'
    - 'high'
  source: string (optional) - Lead source (referral, website, cold_call, etc.)
  tags: json array - Custom tags
  metadata: json object - Additional custom data
  createdAt: timestamp
  updatedAt: timestamp
  stageChangedAt: timestamp - Last stage change
}
```

### Deal Notes Table
```typescript
{
  id: uuid (primary key)
  dealId: uuid (references deals.id) - Associated deal
  userId: uuid (references users.id) - Note author
  note: text (required) - Note content
  noteType: enum - Note category
    - 'general' - General note
    - 'call' - Phone call log
    - 'email' - Email correspondence
    - 'meeting' - Meeting notes
    - 'showing' - Showing feedback
  metadata: json object - Additional data (duration, outcome, etc.)
  createdAt: timestamp
  updatedAt: timestamp
}
```

## API Endpoints

### 1. Create Deal
**POST /api/agent/deals**

Create a new deal in the pipeline.

**Authorization:** Agent or Admin account required

**Request Body:**
```json
{
  "clientName": "John Smith",
  "clientEmail": "john@example.com",
  "clientPhone": "+1-555-0123",
  "clientId": "uuid-optional",
  "propertyId": "uuid-optional",
  "propertyAddress": "123 Main St, Austin, TX",
  "stage": "lead",
  "dealValue": 450000,
  "commissionRate": 3.0,
  "estimatedCommission": 13500,
  "expectedCloseDate": "2026-03-15T00:00:00Z",
  "status": "active",
  "priority": "high",
  "source": "website",
  "tags": ["first-time-buyer", "pre-approved"],
  "metadata": {
    "budget": 500000,
    "preApprovalAmount": 475000
  }
}
```

**Response:** 201 Created
```json
{
  "id": "deal-uuid",
  "agentId": "agent-uuid",
  "clientName": "John Smith",
  "stage": "lead",
  "createdAt": "2026-02-04T20:00:00Z",
  ...
}
```

**Validation:**
- `clientName`: Required, 1-255 characters
- `stage`: Must be one of: lead, showing, offer, contract, closed
- `status`: Must be one of: active, archived, won, lost
- `priority`: Must be one of: low, medium, high

---

### 2. List Deals
**GET /api/agent/deals**

List all deals for the authenticated agent with optional filtering.

**Authorization:** Agent or Admin account required

**Query Parameters:**
- `status` (optional) - Filter by status: active, archived, won, lost
- `stage` (optional) - Filter by stage: lead, showing, offer, contract, closed
- `clientId` (optional) - Filter by client UUID
- `limit` (optional) - Results per page (default: 50)
- `offset` (optional) - Pagination offset (default: 0)

**Example Request:**
```
GET /api/agent/deals?status=active&stage=showing&limit=20&offset=0
```

**Response:** 200 OK
```json
{
  "deals": [
    {
      "id": "deal-uuid-1",
      "agentId": "agent-uuid",
      "clientName": "John Smith",
      "stage": "showing",
      "status": "active",
      "priority": "high",
      "dealValue": "450000",
      "estimatedCommission": "13500",
      "expectedCloseDate": "2026-03-15T00:00:00Z",
      "createdAt": "2026-02-01T10:00:00Z",
      "updatedAt": "2026-02-04T15:30:00Z",
      "stageChangedAt": "2026-02-03T09:00:00Z"
    },
    ...
  ],
  "total": 45
}
```

---

### 3. Get Deal Details
**GET /api/agent/deals/:id**

Get specific deal details including all notes.

**Authorization:** Agent or Admin account required

**Path Parameters:**
- `id` - Deal UUID

**Response:** 200 OK
```json
{
  "id": "deal-uuid",
  "agentId": "agent-uuid",
  "clientName": "John Smith",
  "clientEmail": "john@example.com",
  "clientPhone": "+1-555-0123",
  "propertyId": "property-uuid",
  "propertyAddress": "123 Main St, Austin, TX",
  "stage": "showing",
  "dealValue": "450000",
  "commissionRate": "3.00",
  "estimatedCommission": "13500",
  "expectedCloseDate": "2026-03-15T00:00:00Z",
  "status": "active",
  "priority": "high",
  "source": "website",
  "tags": ["first-time-buyer", "pre-approved"],
  "metadata": {
    "budget": 500000,
    "preApprovalAmount": 475000
  },
  "createdAt": "2026-02-01T10:00:00Z",
  "updatedAt": "2026-02-04T15:30:00Z",
  "stageChangedAt": "2026-02-03T09:00:00Z",
  "notes": [
    {
      "id": "note-uuid-1",
      "dealId": "deal-uuid",
      "userId": "agent-uuid",
      "note": "Had a great showing today. Client loved the kitchen.",
      "noteType": "showing",
      "metadata": {},
      "createdAt": "2026-02-03T14:30:00Z",
      "updatedAt": "2026-02-03T14:30:00Z"
    },
    ...
  ]
}
```

**Error Responses:**
- 404 Not Found - Deal doesn't exist or access denied
- 403 Forbidden - Not an agent account

---

### 4. Update Deal
**PATCH /api/agent/deals/:id**

Update deal details or move to different stage.

**Authorization:** Agent or Admin account required

**Path Parameters:**
- `id` - Deal UUID

**Request Body:** (all fields optional)
```json
{
  "stage": "offer",
  "dealValue": 445000,
  "estimatedCommission": 13350,
  "expectedCloseDate": "2026-03-10T00:00:00Z",
  "priority": "high",
  "tags": ["first-time-buyer", "pre-approved", "offer-submitted"],
  "metadata": {
    "offerAmount": 445000,
    "contingencies": ["inspection", "financing"],
    "offerSubmittedDate": "2026-02-04T20:00:00Z"
  }
}
```

**Response:** 200 OK
```json
{
  "id": "deal-uuid",
  "stage": "offer",
  "dealValue": "445000",
  "updatedAt": "2026-02-04T20:15:00Z",
  "stageChangedAt": "2026-02-04T20:15:00Z",
  ...
}
```

**Notes:**
- When `stage` is updated, `stageChangedAt` is automatically set to current timestamp
- `updatedAt` is always set to current timestamp
- Stage changes are tracked for pipeline analytics

**Error Responses:**
- 404 Not Found - Deal doesn't exist or access denied
- 400 Bad Request - Invalid data
- 403 Forbidden - Not an agent account

---

### 5. Archive/Delete Deal
**DELETE /api/agent/deals/:id**

Archive or permanently delete a deal.

**Authorization:** Agent or Admin account required

**Path Parameters:**
- `id` - Deal UUID

**Query Parameters:**
- `permanent` (optional) - If "true", permanently deletes the deal. Otherwise archives it.

**Example Requests:**
```
DELETE /api/agent/deals/deal-uuid          // Archive (soft delete)
DELETE /api/agent/deals/deal-uuid?permanent=true  // Permanent delete
```

**Response (Archive):** 200 OK
```json
{
  "id": "deal-uuid",
  "status": "archived",
  "updatedAt": "2026-02-04T20:30:00Z",
  ...
}
```

**Response (Permanent Delete):** 204 No Content

**Error Responses:**
- 404 Not Found - Deal doesn't exist or access denied
- 403 Forbidden - Not an agent account

---

### 6. Add Note to Deal
**POST /api/agent/deals/:id/notes**

Add a note to a deal (call log, meeting notes, etc.).

**Authorization:** Agent or Admin account required

**Path Parameters:**
- `id` - Deal UUID

**Request Body:**
```json
{
  "note": "Client is very interested. Scheduling second showing for Saturday.",
  "noteType": "call",
  "metadata": {
    "duration": "15 minutes",
    "outcome": "positive",
    "nextSteps": "Schedule second showing"
  }
}
```

**Response:** 201 Created
```json
{
  "id": "note-uuid",
  "dealId": "deal-uuid",
  "userId": "agent-uuid",
  "note": "Client is very interested. Scheduling second showing for Saturday.",
  "noteType": "call",
  "metadata": {
    "duration": "15 minutes",
    "outcome": "positive",
    "nextSteps": "Schedule second showing"
  },
  "createdAt": "2026-02-04T16:45:00Z",
  "updatedAt": "2026-02-04T16:45:00Z"
}
```

**Validation:**
- `note`: Required, minimum 1 character
- `noteType`: Must be one of: general, call, email, meeting, showing

**Error Responses:**
- 404 Not Found - Deal doesn't exist or access denied
- 400 Bad Request - Invalid note data
- 403 Forbidden - Not an agent account

---

### 7. Get Deal Notes
**GET /api/agent/deals/:id/notes**

Get all notes for a specific deal.

**Authorization:** Agent or Admin account required

**Path Parameters:**
- `id` - Deal UUID

**Response:** 200 OK
```json
[
  {
    "id": "note-uuid-1",
    "dealId": "deal-uuid",
    "userId": "agent-uuid",
    "note": "Initial contact via website form.",
    "noteType": "email",
    "metadata": {},
    "createdAt": "2026-02-01T10:00:00Z",
    "updatedAt": "2026-02-01T10:00:00Z"
  },
  {
    "id": "note-uuid-2",
    "dealId": "deal-uuid",
    "userId": "agent-uuid",
    "note": "Scheduled showing for 2pm on Friday.",
    "noteType": "call",
    "metadata": {
      "showingDate": "2026-02-03T14:00:00Z"
    },
    "createdAt": "2026-02-02T11:30:00Z",
    "updatedAt": "2026-02-02T11:30:00Z"
  }
]
```

**Notes:**
- Notes are returned in reverse chronological order (newest first)
- Notes include the userId of the author (useful for team scenarios)

**Error Responses:**
- 404 Not Found - Deal doesn't exist or access denied
- 403 Forbidden - Not an agent account

---

## Deal Stage Workflow

### Typical Pipeline Flow

1. **Lead** - Initial contact/inquiry
   - Contact captured from website, referral, cold call, etc.
   - Client information collected
   - Initial qualification

2. **Showing** - Scheduled or completed property showing
   - Property viewings scheduled
   - Client feedback captured via notes
   - Follow-up planned

3. **Offer** - Offer submitted
   - Purchase offer prepared and submitted
   - Deal value and commission calculated
   - Negotiations tracked in notes

4. **Contract** - Under contract
   - Offer accepted
   - Contingencies managed
   - Closing timeline established

5. **Closed** - Deal successfully closed
   - Final closing completed
   - Actual commission recorded
   - Status marked as "won"

### Status vs Stage

**Stage** (lead → showing → offer → contract → closed):
- Represents progress through sales funnel
- Linear progression (generally)
- Automatically tracked with `stageChangedAt` timestamp

**Status** (active, archived, won, lost):
- Represents current deal state
- Can change independently of stage
- Used for filtering and reporting

**Examples:**
- Active showing: `stage: "showing", status: "active"`
- Lost lead: `stage: "lead", status: "lost"`
- Won deal: `stage: "closed", status: "won"`
- Archived offer: `stage: "offer", status: "archived"`

---

## Implementation Details

### Database Tables
- **deals** - Main deal records with stage tracking
- **deal_notes** - Activity log and notes for each deal

### Storage Methods (server/storage.ts)
```typescript
// Deal methods
getDeals(agentId, options) - List deals with filtering
getDealById(id, agentId) - Get single deal
createDeal(data) - Create new deal
updateDeal(id, agentId, data) - Update deal
archiveDeal(id, agentId) - Archive deal (soft delete)
deleteDeal(id, agentId) - Permanently delete deal

// Deal note methods
getDealNotes(dealId, agentId) - Get all notes for a deal
createDealNote(data) - Create new note
updateDealNote(id, userId, note) - Update note
deleteDealNote(id, userId) - Delete note
```

### Schema Files
- **shared/schema.ts** - Database schema definitions
  - `deals` table
  - `dealNotes` table
  - Type exports: Deal, DealNote, InsertDeal, InsertDealNote
  - Relations: deals ↔ users (agent/client), deals ↔ properties, deals ↔ dealNotes

### API Routes (server/routes.ts)
All routes require authentication and agent/admin role check.

### Security
- All endpoints protected by `authMiddleware`
- Agent can only access their own deals
- Role-based access control (agent or admin required)
- Deal ownership verified on all operations

---

## Usage Examples

### Create a New Lead
```bash
curl -X POST http://localhost:5000/api/agent/deals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Sarah Johnson",
    "clientEmail": "sarah@example.com",
    "clientPhone": "+1-555-0199",
    "stage": "lead",
    "priority": "high",
    "source": "referral",
    "tags": ["investor", "cash-buyer"],
    "metadata": {
      "budget": 750000,
      "timeline": "3-6 months",
      "referredBy": "Mike Thompson"
    }
  }'
```

### Move Deal to Showing Stage
```bash
curl -X PATCH http://localhost:5000/api/agent/deals/DEAL_UUID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stage": "showing",
    "propertyId": "PROPERTY_UUID",
    "propertyAddress": "456 Oak Ave, Austin, TX"
  }'
```

### Add Showing Feedback Note
```bash
curl -X POST http://localhost:5000/api/agent/deals/DEAL_UUID/notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note": "Client loved the property. Particularly impressed with the renovated kitchen and large backyard. Ready to make an offer.",
    "noteType": "showing",
    "metadata": {
      "rating": 9,
      "concerns": ["HOA fees slightly higher than expected"],
      "nextSteps": "Prepare offer for $730k"
    }
  }'
```

### List Active Deals
```bash
curl -X GET "http://localhost:5000/api/agent/deals?status=active&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Deal Pipeline by Stage
```bash
# Get all leads
curl -X GET "http://localhost:5000/api/agent/deals?stage=lead" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get all showings
curl -X GET "http://localhost:5000/api/agent/deals?stage=showing" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get all offers
curl -X GET "http://localhost:5000/api/agent/deals?stage=offer" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mark Deal as Won
```bash
curl -X PATCH http://localhost:5000/api/agent/deals/DEAL_UUID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stage": "closed",
    "status": "won",
    "actualCloseDate": "2026-02-15T10:00:00Z",
    "dealValue": 725000,
    "estimatedCommission": 21750
  }'
```

---

## Frontend Integration

### Example React Hook
```typescript
import { useState, useEffect } from 'react';

export function useDeals(filters = {}) {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchDeals() {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/agent/deals?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setDeals(data.deals);
      setLoading(false);
    }
    
    fetchDeals();
  }, [filters]);
  
  return { deals, loading };
}

// Usage in component
function DealPipeline() {
  const { deals, loading } = useDeals({ status: 'active' });
  
  if (loading) return <Spinner />;
  
  return (
    <div>
      {deals.map(deal => (
        <DealCard key={deal.id} deal={deal} />
      ))}
    </div>
  );
}
```

---

## Analytics & Reporting Opportunities

The deal pipeline data enables powerful analytics:

1. **Conversion Rate Tracking**
   - Lead → Showing conversion rate
   - Offer → Contract conversion rate
   - Overall close rate

2. **Stage Duration Analysis**
   - Average time in each stage
   - Identify bottlenecks
   - Optimize process

3. **Commission Forecasting**
   - Sum of estimated commissions by stage
   - Win probability weighting
   - Monthly/quarterly projections

4. **Lead Source ROI**
   - Track which sources convert best
   - Calculate cost per closed deal
   - Optimize marketing spend

5. **Pipeline Health Metrics**
   - Total deals by stage
   - Stagnant deals (no stage change >30 days)
   - Lost deal reasons (from notes)

---

## Next Steps

Potential enhancements:

1. **Team Features**
   - Shared deals between agents
   - Team pipeline views
   - Lead assignment/routing

2. **Automated Workflows**
   - Automatic follow-up reminders
   - Stage change notifications
   - Stale deal alerts

3. **Client Portal Integration**
   - Client-facing deal status
   - Document sharing
   - Communication history

4. **Advanced Analytics**
   - Predictive close probability
   - Deal health scoring
   - Market trend correlation

5. **Integrations**
   - Email sync (Gmail, Outlook)
   - Calendar integration
   - MLS data sync
   - CRM platforms

---

## Database Migration

To apply the new schema, run:

```bash
# Using Drizzle Kit
npm run db:push

# Or manually apply migration
psql -d your_database -f migration.sql
```

**Migration SQL:**
```sql
-- Create deals table
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES users(id),
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  property_id UUID REFERENCES properties(id),
  property_address VARCHAR(500),
  stage VARCHAR(50) NOT NULL DEFAULT 'lead',
  deal_value DECIMAL(12,2),
  commission_rate DECIMAL(5,2),
  estimated_commission DECIMAL(12,2),
  expected_close_date TIMESTAMP,
  actual_close_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active',
  priority VARCHAR(20) DEFAULT 'medium',
  source VARCHAR(100),
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  stage_changed_at TIMESTAMP DEFAULT NOW()
);

-- Create deal_notes table
CREATE TABLE deal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  note TEXT NOT NULL,
  note_type VARCHAR(50) DEFAULT 'general',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_deals_agent_id ON deals(agent_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_client_id ON deals(client_id);
CREATE INDEX idx_deal_notes_deal_id ON deal_notes(deal_id);
CREATE INDEX idx_deal_notes_user_id ON deal_notes(user_id);
```

---

## Testing

### Manual Testing Checklist

- [ ] Create deal with all fields
- [ ] Create deal with minimal fields (only required)
- [ ] List deals without filters
- [ ] List deals with status filter
- [ ] List deals with stage filter
- [ ] List deals with multiple filters
- [ ] Get specific deal by ID
- [ ] Update deal stage
- [ ] Update deal fields
- [ ] Add note to deal
- [ ] List notes for deal
- [ ] Archive deal
- [ ] Permanently delete deal
- [ ] Verify agent isolation (can't access other agent's deals)
- [ ] Verify admin can access all deals
- [ ] Test pagination (limit/offset)
- [ ] Test invalid deal IDs (404 errors)
- [ ] Test unauthorized access (403 errors)
- [ ] Test invalid data (400 errors)

### Example Test Data

```json
{
  "clientName": "Test Client",
  "stage": "lead",
  "priority": "medium",
  "source": "test",
  "tags": ["test"],
  "metadata": { "test": true }
}
```

---

## Support & Troubleshooting

### Common Issues

**403 Forbidden Error:**
- Ensure user has agent or admin role
- Check authentication token is valid

**404 Not Found Error:**
- Verify deal ID is correct
- Ensure deal belongs to authenticated agent
- Check deal hasn't been permanently deleted

**400 Bad Request Error:**
- Validate all required fields are present
- Check enum values (stage, status, priority, noteType)
- Verify data types match schema

### Debug Mode

Enable detailed logging:
```typescript
// In routes.ts, add before try/catch:
console.log('Request user:', req.user);
console.log('Request body:', req.body);
console.log('Request params:', req.params);
```

---

## Version History

- **v1.0** (2026-02-04) - Initial implementation
  - Basic CRUD operations
  - Stage tracking
  - Deal notes
  - Agent authentication & authorization

---

**Built for Apartment Locator AI - Agent Dashboard**
**Last Updated:** February 4, 2026
