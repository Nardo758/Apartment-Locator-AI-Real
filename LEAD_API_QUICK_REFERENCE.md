# Agent Lead Management API - Quick Reference

## Base URL
All endpoints are prefixed with `/api/agent/leads`

## Authentication
All requests require Bearer token authentication:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Endpoints

### 1. Create Lead
```http
POST /api/agent/leads
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "leadSource": "website",
  "budgetMin": 1500,
  "budgetMax": 2000,
  "bedrooms": 2,
  "timeline": "immediate",
  "preferredLocations": ["Downtown"],
  "tags": ["first-time-renter"]
}
```

**Response:** `201 Created`
```json
{
  "lead": {
    "id": "uuid",
    "leadScore": 65,
    ...
  },
  "message": "Lead captured successfully"
}
```

---

### 2. List Leads (with Filters)
```http
GET /api/agent/leads?status=new&minScore=50&sortBy=leadScore&sortOrder=desc&limit=20
```

**Query Parameters:**
- `status` - new | contacted | qualified | nurturing | converted | lost
- `leadSource` - website | referral | zillow | etc.
- `search` - Search by name/email
- `minScore`, `maxScore` - Filter by score (0-100)
- `tags` - Filter by tags (comma-separated)
- `sortBy` - leadScore | createdAt | lastContactedAt | nextFollowUpAt
- `sortOrder` - asc | desc
- `limit`, `offset` - Pagination

**Response:** `200 OK`
```json
{
  "leads": [...],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

---

### 3. Get Single Lead
```http
GET /api/agent/leads/:id
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "leadScore": 75,
  "status": "qualified",
  "nextFollowUpAt": "2025-02-05T10:00:00Z",
  ...
}
```

---

### 4. Update Lead
```http
PATCH /api/agent/leads/:id
Content-Type: application/json

{
  "status": "contacted",
  "lastContactedAt": "2025-02-04T14:30:00Z",
  "nextFollowUpAt": "2025-02-06T10:00:00Z",
  "followUpCount": 1,
  "emailsSent": 1,
  "notes": "Discussed 2BR options downtown"
}
```

**Response:** `200 OK` - Updated lead with recalculated score

---

### 5. Convert Lead to Client
```http
POST /api/agent/leads/:id/convert
```

**Response:** `200 OK`
```json
{
  "message": "Lead successfully converted to client",
  "lead": {
    "id": "uuid",
    "status": "converted",
    "convertedToClientAt": "2025-02-04T15:00:00Z",
    "convertedClientId": "client-uuid"
  },
  "client": {
    "id": "client-uuid",
    "firstName": "John",
    "lastName": "Doe",
    "stage": "viewing",
    ...
  }
}
```

---

### 6. Delete Lead
```http
DELETE /api/agent/leads/:id
```

**Response:** `204 No Content`

---

### 7. Lead Source Analytics
```http
GET /api/agent/leads/sources
```

**Response:** `200 OK`
```json
{
  "sources": [
    {
      "source": "website",
      "count": 45,
      "avgScore": 67,
      "conversionRate": 22
    },
    {
      "source": "referral",
      "count": 30,
      "avgScore": 78,
      "conversionRate": 40
    }
  ],
  "summary": {
    "totalLeads": 150,
    "totalConverted": 35,
    "overallConversionRate": 23,
    "topSource": {
      "source": "website",
      "count": 45
    },
    "highestConversionSource": {
      "source": "referral",
      "conversionRate": 40
    }
  }
}
```

---

## Lead Status Flow

```
new → contacted → qualified → nurturing → converted
  ↓                                           ↓
 lost ←──────────────────────────────────────┘
```

**Status Definitions:**
- `new` - Just captured, not yet contacted
- `contacted` - Initial contact made
- `qualified` - Budget and timeline verified
- `nurturing` - Active communication, not yet ready
- `converted` - Became a client
- `lost` - No longer pursuing

---

## Lead Scoring

**Automatic scoring (0-100):**
- Budget: 0-25 pts
- Timeline: 0-20 pts
- Engagement: 0-20 pts
- Motivation: 0-20 pts
- Response Rate: 0-15 pts

**Score Ranges:**
- 70-100: Hot lead (contact immediately)
- 40-69: Warm lead (contact within 24h)
- 0-39: Cold lead (nurture campaign)

---

## Common Use Cases

### Track Email Interaction
```http
PATCH /api/agent/leads/:id
Content-Type: application/json

{
  "emailsSent": 3,
  "emailsOpened": 2,
  "lastContactedAt": "2025-02-04T14:30:00Z"
}
```

### Schedule Tour
```http
PATCH /api/agent/leads/:id
Content-Type: application/json

{
  "tourScheduled": true,
  "tourDate": "2025-02-10T14:00:00Z",
  "nextFollowUpAt": "2025-02-09T10:00:00Z"
}
```

### Mark as Lost
```http
PATCH /api/agent/leads/:id
Content-Type: application/json

{
  "status": "lost",
  "lostReason": "Found apartment elsewhere"
}
```

### Get Today's Follow-ups
```http
GET /api/agent/leads?sortBy=nextFollowUpAt&sortOrder=asc
```

Then filter client-side where `nextFollowUpAt <= today`

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid lead data",
  "details": [
    {
      "path": ["email"],
      "message": "Invalid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied. Agent account required."
}
```

### 404 Not Found
```json
{
  "error": "Lead not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create lead"
}
```

---

## Best Practices

1. **Always set leadSource** for attribution tracking
2. **Update interaction counters** (emailsSent, emailsOpened, propertiesViewed) for accurate scoring
3. **Schedule follow-ups** using nextFollowUpAt
4. **Use tags** for segmentation (e.g., "urgent", "first-time-renter", "high-budget")
5. **Add notes** for context preservation
6. **Track timeline** to prioritize hot leads
7. **Convert promptly** when lead becomes client
8. **Mark lost with reason** for future analysis

---

## Rate Limits

None currently - but plan for:
- 100 requests per minute per agent
- Burst allowance of 200 requests

---

## Pagination

Default: 50 leads per page
Maximum: 100 leads per page

```http
GET /api/agent/leads?limit=50&offset=0
GET /api/agent/leads?limit=50&offset=50
GET /api/agent/leads?limit=50&offset=100
```

---

## Webhooks (Future)

Coming soon:
- Lead created
- Lead converted
- Lead score threshold reached
- Follow-up due
