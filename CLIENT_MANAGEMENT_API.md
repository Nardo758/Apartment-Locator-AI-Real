# Agent Client Management API Documentation

## Overview

Complete client management system for real estate agents with 7 RESTful API endpoints, full authentication, validation, and error handling. Agents can manage their client relationships, track interactions, and view comprehensive dashboard analytics.

## Database Schema

### Tables Added

#### `agent_clients`
Stores client information for real estate agents.

**Columns:**
- `id` (UUID, PK) - Unique identifier
- `agent_id` (UUID, FK → users) - Agent who owns this client
- `first_name` (VARCHAR) - Client's first name
- `last_name` (VARCHAR) - Client's last name
- `email` (VARCHAR) - Client email address
- `phone` (VARCHAR, optional) - Client phone number
- `status` (VARCHAR) - Client status: 'active', 'inactive', 'archived'
- `stage` (VARCHAR) - Pipeline stage: 'lead', 'viewing', 'negotiating', 'contract', 'closed'
- `source` (VARCHAR, optional) - How client was acquired (e.g., 'referral', 'website')
- `budget` (JSONB) - Budget range: `{ min?: number, max?: number }`
- `preferred_locations` (JSONB) - Array of preferred locations
- `bedrooms` (INT, optional) - Desired bedrooms
- `bathrooms` (DECIMAL, optional) - Desired bathrooms
- `move_in_date` (TIMESTAMP, optional) - Target move-in date
- `notes` (TEXT, optional) - Agent notes about client
- `tags` (JSONB) - Array of tags for categorization
- `priority` (VARCHAR) - Priority: 'low', 'medium', 'high'
- `assigned_properties` (JSONB) - Array of property IDs assigned to client
- `last_contact` (TIMESTAMP, optional) - Last interaction timestamp
- `next_follow_up` (TIMESTAMP, optional) - Scheduled follow-up date
- `is_archived` (BOOLEAN) - Soft delete flag
- `archived_at` (TIMESTAMP, optional) - Archive timestamp
- `metadata` (JSONB, optional) - Additional custom data
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

**Indexes:**
- `agent_id`, `status`, `stage`, `email`, `is_archived`, `next_follow_up`, `created_at`

#### `client_activity`
Tracks all activities and interactions with clients.

**Columns:**
- `id` (UUID, PK) - Unique identifier
- `client_id` (UUID, FK → agent_clients) - Associated client
- `agent_id` (UUID, FK → users) - Agent who performed the activity
- `activity_type` (VARCHAR) - Activity type: 'note', 'call', 'email', 'meeting', 'viewing', 'offer', 'contract'
- `title` (VARCHAR) - Activity title/summary
- `description` (TEXT, optional) - Detailed description
- `property_id` (UUID, FK → properties, optional) - Related property
- `metadata` (JSONB, optional) - Additional activity data
- `scheduled_for` (TIMESTAMP, optional) - Scheduled activity time
- `completed_at` (TIMESTAMP, optional) - Completion timestamp
- `created_at` (TIMESTAMP) - Creation timestamp

**Indexes:**
- `client_id`, `agent_id`, `activity_type`, `created_at`, `scheduled_for`

## API Endpoints

### Authentication

All endpoints require authentication via Bearer token:
```
Authorization: Bearer <token>
```

All endpoints require `userType` to be `'agent'` or `'admin'`. Returns `403 Forbidden` otherwise.

---

### 1. POST /api/agent/clients

**Description:** Add a new client to the agent's roster.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-0123",
  "status": "active",
  "stage": "lead",
  "source": "website",
  "budget": {
    "min": 1500,
    "max": 2500
  },
  "preferredLocations": ["Boston", "Cambridge", "Somerville"],
  "bedrooms": 2,
  "bathrooms": 1.5,
  "moveInDate": "2025-03-01T00:00:00.000Z",
  "notes": "Looking for pet-friendly apartments",
  "tags": ["first-time-renter", "pet-owner"],
  "priority": "high",
  "nextFollowUp": "2025-02-10T10:00:00.000Z",
  "metadata": {
    "referralSource": "Jane Smith",
    "preferredContactMethod": "email"
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "agentId": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-0123",
  "status": "active",
  "stage": "lead",
  "source": "website",
  "budget": { "min": 1500, "max": 2500 },
  "preferredLocations": ["Boston", "Cambridge", "Somerville"],
  "bedrooms": 2,
  "bathrooms": 1.5,
  "moveInDate": "2025-03-01T00:00:00.000Z",
  "notes": "Looking for pet-friendly apartments",
  "tags": ["first-time-renter", "pet-owner"],
  "priority": "high",
  "assignedProperties": [],
  "lastContact": null,
  "nextFollowUp": "2025-02-10T10:00:00.000Z",
  "isArchived": false,
  "archivedAt": null,
  "metadata": {
    "referralSource": "Jane Smith",
    "preferredContactMethod": "email"
  },
  "createdAt": "2025-02-05T10:00:00.000Z",
  "updatedAt": "2025-02-05T10:00:00.000Z"
}
```

**Validation:**
- `firstName`, `lastName`: Required, 1-100 characters
- `email`: Required, valid email, max 255 characters
- `phone`: Optional, max 50 characters
- `status`: Must be 'active', 'inactive', or 'archived'
- `stage`: Must be 'lead', 'viewing', 'negotiating', 'contract', or 'closed'
- `priority`: Must be 'low', 'medium', or 'high'
- Date fields must be ISO 8601 format

**Error Responses:**
- `400 Bad Request` - Invalid data or validation errors
- `403 Forbidden` - Not an agent account
- `500 Internal Server Error` - Server error

---

### 2. GET /api/agent/clients

**Description:** List all clients with filtering, searching, and sorting.

**Query Parameters:**
- `status` (optional) - Filter by status: 'active', 'inactive', 'archived'
- `stage` (optional) - Filter by stage: 'lead', 'viewing', 'negotiating', 'contract', 'closed'
- `search` (optional) - Search in firstName, lastName, email (case-insensitive)
- `sortBy` (optional) - Sort field: 'name', 'createdAt', 'lastContact', 'priority' (default: 'createdAt')
- `sortOrder` (optional) - Sort order: 'asc', 'desc' (default: 'desc')
- `limit` (optional) - Maximum results (default: no limit)
- `offset` (optional) - Pagination offset (default: 0)

**Example Request:**
```
GET /api/agent/clients?status=active&stage=lead&sortBy=priority&sortOrder=desc&limit=20&offset=0
```

**Response:** `200 OK`
```json
{
  "clients": [
    {
      "id": "uuid",
      "agentId": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "status": "active",
      "stage": "lead",
      "priority": "high",
      "lastContact": "2025-02-04T15:30:00.000Z",
      "nextFollowUp": "2025-02-10T10:00:00.000Z",
      "createdAt": "2025-02-01T10:00:00.000Z",
      "updatedAt": "2025-02-04T15:30:00.000Z"
    }
  ],
  "total": 42
}
```

**Error Responses:**
- `403 Forbidden` - Not an agent account
- `500 Internal Server Error` - Server error

---

### 3. GET /api/agent/clients/:id

**Description:** Get detailed information about a specific client.

**Path Parameters:**
- `id` (required) - Client UUID

**Example Request:**
```
GET /api/agent/clients/550e8400-e29b-41d4-a716-446655440000
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "agentId": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-0123",
  "status": "active",
  "stage": "viewing",
  "source": "website",
  "budget": { "min": 1500, "max": 2500 },
  "preferredLocations": ["Boston", "Cambridge"],
  "bedrooms": 2,
  "bathrooms": 1.5,
  "moveInDate": "2025-03-01T00:00:00.000Z",
  "notes": "Looking for pet-friendly apartments. Has a medium-sized dog.",
  "tags": ["first-time-renter", "pet-owner"],
  "priority": "high",
  "assignedProperties": ["prop-uuid-1", "prop-uuid-2"],
  "lastContact": "2025-02-04T15:30:00.000Z",
  "nextFollowUp": "2025-02-10T10:00:00.000Z",
  "isArchived": false,
  "archivedAt": null,
  "metadata": {
    "referralSource": "Jane Smith",
    "preferredContactMethod": "email"
  },
  "createdAt": "2025-02-01T10:00:00.000Z",
  "updatedAt": "2025-02-04T15:30:00.000Z"
}
```

**Error Responses:**
- `403 Forbidden` - Not an agent account
- `404 Not Found` - Client not found or doesn't belong to agent
- `500 Internal Server Error` - Server error

---

### 4. PATCH /api/agent/clients/:id

**Description:** Update client information. All fields are optional.

**Path Parameters:**
- `id` (required) - Client UUID

**Request Body:** (all fields optional)
```json
{
  "stage": "negotiating",
  "priority": "high",
  "notes": "Updated notes about the client",
  "nextFollowUp": "2025-02-15T14:00:00.000Z",
  "assignedProperties": ["prop-uuid-3", "prop-uuid-4"],
  "tags": ["first-time-renter", "pet-owner", "urgent"]
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "agentId": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "stage": "negotiating",
  "priority": "high",
  "notes": "Updated notes about the client",
  "nextFollowUp": "2025-02-15T14:00:00.000Z",
  "updatedAt": "2025-02-05T11:00:00.000Z",
  ...
}
```

**Error Responses:**
- `400 Bad Request` - Invalid data or validation errors
- `403 Forbidden` - Not an agent account
- `404 Not Found` - Client not found or doesn't belong to agent
- `500 Internal Server Error` - Server error

---

### 5. DELETE /api/agent/clients/:id

**Description:** Archive a client (soft delete). Sets `isArchived = true` and `status = 'archived'`.

**Path Parameters:**
- `id` (required) - Client UUID

**Example Request:**
```
DELETE /api/agent/clients/550e8400-e29b-41d4-a716-446655440000
```

**Response:** `204 No Content`

**Error Responses:**
- `403 Forbidden` - Not an agent account
- `404 Not Found` - Client not found or doesn't belong to agent
- `500 Internal Server Error` - Server error

**Note:** This is a soft delete. The client record is preserved with `isArchived = true` and can be retrieved by querying with `status=archived`.

---

### 6. GET /api/agent/clients/:id/activity

**Description:** Get activity history for a specific client.

**Path Parameters:**
- `id` (required) - Client UUID

**Query Parameters:**
- `limit` (optional) - Maximum results (default: no limit)
- `offset` (optional) - Pagination offset (default: 0)

**Example Request:**
```
GET /api/agent/clients/550e8400-e29b-41d4-a716-446655440000/activity?limit=20&offset=0
```

**Response:** `200 OK`
```json
{
  "activities": [
    {
      "id": "uuid",
      "clientId": "550e8400-e29b-41d4-a716-446655440000",
      "agentId": "uuid",
      "activityType": "call",
      "title": "Follow-up call about property viewing",
      "description": "Discussed budget constraints and schedule for upcoming viewings.",
      "propertyId": null,
      "metadata": {
        "duration": "15 minutes",
        "outcome": "positive"
      },
      "scheduledFor": null,
      "completedAt": "2025-02-04T15:30:00.000Z",
      "createdAt": "2025-02-04T15:30:00.000Z"
    },
    {
      "id": "uuid",
      "clientId": "550e8400-e29b-41d4-a716-446655440000",
      "agentId": "uuid",
      "activityType": "viewing",
      "title": "Property viewing scheduled",
      "description": "123 Main St, Boston - 2BR/1.5BA",
      "propertyId": "prop-uuid-1",
      "metadata": {},
      "scheduledFor": "2025-02-10T14:00:00.000Z",
      "completedAt": null,
      "createdAt": "2025-02-04T15:35:00.000Z"
    }
  ],
  "total": 12
}
```

**Error Responses:**
- `403 Forbidden` - Not an agent account
- `404 Not Found` - Client not found (returns empty activities array)
- `500 Internal Server Error` - Server error

---

### 7. GET /api/agent/dashboard/summary

**Description:** Get comprehensive dashboard overview statistics for the agent.

**Example Request:**
```
GET /api/agent/dashboard/summary
```

**Response:** `200 OK`
```json
{
  "totalClients": 42,
  "activeClients": 35,
  "clientsByStage": {
    "lead": 15,
    "viewing": 10,
    "negotiating": 5,
    "contract": 3,
    "closed": 2
  },
  "clientsByPriority": {
    "high": 12,
    "medium": 20,
    "low": 10
  },
  "recentActivities": [
    {
      "id": "uuid",
      "clientId": "uuid",
      "agentId": "uuid",
      "activityType": "call",
      "title": "Follow-up call",
      "createdAt": "2025-02-05T10:30:00.000Z"
    }
  ],
  "upcomingFollowUps": [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "nextFollowUp": "2025-02-06T10:00:00.000Z",
      "priority": "high",
      "stage": "viewing"
    }
  ]
}
```

**Dashboard Metrics:**
- `totalClients` - Total non-archived clients
- `activeClients` - Clients with status = 'active'
- `clientsByStage` - Breakdown by pipeline stage
- `clientsByPriority` - Breakdown by priority level
- `recentActivities` - Last 10 activities across all clients
- `upcomingFollowUps` - Clients with follow-ups due in next 7 days (max 10)

**Error Responses:**
- `403 Forbidden` - Not an agent account
- `500 Internal Server Error` - Server error

---

## Adding Client Activity

**Endpoint:** `POST /api/agent/clients/:id/activity`

**Description:** Log a new activity or interaction with a client.

**Path Parameters:**
- `id` (required) - Client UUID

**Request Body:**
```json
{
  "activityType": "viewing",
  "title": "Property viewing at 123 Main St",
  "description": "Showed 2BR/1.5BA apartment. Client loved the location and natural light.",
  "propertyId": "prop-uuid-1",
  "metadata": {
    "duration": "45 minutes",
    "clientFeedback": "very positive"
  },
  "completedAt": "2025-02-05T14:00:00.000Z"
}
```

**Activity Types:**
- `note` - General note or observation
- `call` - Phone call
- `email` - Email communication
- `meeting` - In-person meeting
- `viewing` - Property viewing
- `offer` - Offer submitted
- `contract` - Contract signed

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "clientId": "uuid",
  "agentId": "uuid",
  "activityType": "viewing",
  "title": "Property viewing at 123 Main St",
  "description": "Showed 2BR/1.5BA apartment. Client loved the location and natural light.",
  "propertyId": "prop-uuid-1",
  "metadata": {
    "duration": "45 minutes",
    "clientFeedback": "very positive"
  },
  "scheduledFor": null,
  "completedAt": "2025-02-05T14:00:00.000Z",
  "createdAt": "2025-02-05T14:05:00.000Z"
}
```

**Side Effects:**
- Automatically updates client's `lastContact` timestamp to current time

---

## Database Migration

To apply the schema changes, run the migration:

```bash
# Using psql
psql -U your_user -d your_database -f migrations/0003_add_agent_clients_tables.sql

# Or using your migration tool
npm run migrate
```

The migration creates:
- `agent_clients` table with all necessary columns and indexes
- `client_activity` table with all necessary columns and indexes
- Comments for documentation
- Foreign key constraints with CASCADE deletes

---

## Storage Layer

The `storage.ts` file includes the following new methods:

### Client Management
- `getClients(agentId, options)` - List clients with filtering/sorting
- `getClientById(id, agentId)` - Get single client
- `createClient(data)` - Create new client
- `updateClient(id, agentId, data)` - Update client
- `archiveClient(id, agentId)` - Archive client (soft delete)
- `deleteClient(id, agentId)` - Hard delete client

### Activity Tracking
- `getClientActivity(clientId, agentId, options)` - Get activity history
- `createClientActivity(data)` - Add new activity

### Dashboard
- `getAgentDashboardSummary(agentId)` - Get comprehensive dashboard stats

---

## Example Usage

### Create a new client
```bash
curl -X POST http://localhost:5000/api/agent/clients \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "phone": "+1-555-0199",
    "stage": "lead",
    "budget": { "min": 2000, "max": 3000 },
    "preferredLocations": ["Cambridge", "Somerville"],
    "bedrooms": 3,
    "priority": "high"
  }'
```

### List active clients sorted by priority
```bash
curl -X GET "http://localhost:5000/api/agent/clients?status=active&sortBy=priority&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update client stage
```bash
curl -X PATCH http://localhost:5000/api/agent/clients/CLIENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stage": "contract",
    "notes": "Offer accepted! Moving to contract stage."
  }'
```

### Log a viewing activity
```bash
curl -X POST http://localhost:5000/api/agent/clients/CLIENT_ID/activity \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "activityType": "viewing",
    "title": "Showed 456 Oak Ave",
    "description": "Client very interested, wants to submit offer",
    "propertyId": "PROPERTY_ID",
    "completedAt": "2025-02-05T15:00:00.000Z"
  }'
```

### Get dashboard summary
```bash
curl -X GET http://localhost:5000/api/agent/dashboard/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": "Error message description",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` - Successful GET/PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation errors or invalid data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not authorized (not an agent account)
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Security

### Authentication
- All endpoints require valid JWT Bearer token
- Token must be included in `Authorization` header
- User must be authenticated via `authMiddleware`

### Authorization
- User type must be 'agent' or 'admin'
- Agents can only access their own clients
- All queries filtered by `agentId`
- Prevents cross-agent data access

### Data Validation
- All inputs validated with Zod schemas
- SQL injection prevented via parameterized queries (Drizzle ORM)
- XSS prevention through proper encoding

---

## Performance Considerations

### Indexes
The migration creates indexes on frequently queried columns:
- `agent_id` - For filtering clients by agent
- `status`, `stage` - For filtering by status/stage
- `email` - For email lookups
- `is_archived` - For filtering archived clients
- `next_follow_up` - For upcoming follow-up queries
- `created_at` - For sorting by creation date

### Pagination
Use `limit` and `offset` parameters for large result sets:
```
GET /api/agent/clients?limit=50&offset=0
```

### Soft Deletes
Archived clients are preserved in the database for reporting and compliance.

---

## Future Enhancements

Potential improvements:
- Email/SMS notifications for follow-ups
- Automated lead scoring
- Client notes with rich text formatting
- Document attachments
- Calendar integration for viewings
- Client portal for self-service
- Bulk operations (import/export)
- Advanced reporting and analytics

---

## Testing

To test the endpoints, you'll need:
1. Valid authentication token for an agent user
2. PostgreSQL database with migrations applied
3. Proper user record with `userType = 'agent'`

Example test sequence:
1. Create a client → POST /api/agent/clients
2. List clients → GET /api/agent/clients
3. Get client details → GET /api/agent/clients/:id
4. Add activity → POST /api/agent/clients/:id/activity
5. View activity → GET /api/agent/clients/:id/activity
6. Update client → PATCH /api/agent/clients/:id
7. View dashboard → GET /api/agent/dashboard/summary
8. Archive client → DELETE /api/agent/clients/:id

---

## Summary

The Agent Client Management API provides a complete CRM solution for real estate agents with:

✅ **7 RESTful endpoints** - Full CRUD + activity tracking + dashboard
✅ **Comprehensive validation** - Zod schemas with detailed error messages
✅ **Proper authentication & authorization** - JWT-based with role checks
✅ **Filtering, sorting, pagination** - Advanced query capabilities
✅ **Activity tracking** - Complete interaction history
✅ **Dashboard analytics** - Pipeline insights and follow-up reminders
✅ **Database migration** - Clean schema with proper indexes
✅ **Type safety** - Full TypeScript support
✅ **Security** - SQL injection prevention, data isolation

The system is production-ready and follows best practices for API design, security, and performance.
