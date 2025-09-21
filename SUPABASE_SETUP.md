# Supabase Setup Guide

## Overview
This guide covers the complete Supabase setup for the Apartment Locator AI application, including database schema, Row Level Security (RLS), and environment configuration.

## Environment Variables

### Required Environment Variables
Create a `.env` file in your project root with these variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xtaqdaamzqzqvhqeijjh.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Service Role Key (for server-side operations only)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Vercel Deployment
In your Vercel dashboard, add these environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Database Schema

### Core Tables

#### 1. `user_profiles`
Stores comprehensive user preferences and AI configuration.

**Key Fields:**
- `user_id` (UUID, references auth.users)
- `email` (text)
- `bedrooms`, `amenities`, `deal_breakers`
- Transportation preferences (public_transit_access, walkability_score_requirement, etc.)
- Neighborhood preferences (crime_rate_preference, noise_level_tolerance, etc.)
- Safety preferences (security_system_required, fire_safety_features, etc.)
- `ai_preferences` (JSONB) - AI-specific configuration
- `search_criteria` (JSONB) - Search parameters

#### 2. `rental_offers`
User-generated rental offers and applications.

**Key Fields:**
- `user_id` (UUID, references auth.users)
- `property_id` (text)
- `monthly_budget` (numeric)
- `lease_term` (integer)
- `move_in_date` (date)
- `property_details` (JSONB)
- `ai_suggestions` (JSONB)
- `status` (text)

#### 3. `subscriptions`
User subscription management.

**Key Fields:**
- `user_id` (UUID, references auth.users)
- `plan_type` (text)
- `status` (text)
- `stripe_customer_id` (text)
- `current_period_start/end` (timestamptz)

#### 4. `orders`
Payment and billing records.

**Key Fields:**
- `user_id` (UUID, references auth.users)
- `amount` (numeric)
- `plan_type` (text)
- `status` (text)
- `stripe_payment_intent_id` (text)

#### 5. `access_tokens`
Subscription access token management.

**Key Fields:**
- `token` (text, unique)
- `email` (text)
- `plan_type` (text)
- `expires_at` (timestamptz)
- `used` (boolean)

## Row Level Security (RLS)

### Security Policies Applied

1. **User Profiles**: Users can only access their own profiles
2. **Rental Offers**: Users can only view/modify their own offers
3. **Subscriptions**: Users can only view their own subscription data
4. **Orders**: Users can only view their own order history
5. **Access Tokens**: Read-only access for token validation

### Migration Script
Run the migration script to apply RLS policies:

```sql
-- See supabase/migrations/001_initial_schema.sql
```

## Database Utilities

### Available Utility Functions

#### User Profile Operations
```typescript
import { userProfileUtils } from '@/lib/supabase-utils';

// Get user profile
const profile = await userProfileUtils.getProfile(userId);

// Create/update profile
const updatedProfile = await userProfileUtils.upsertProfile(profileData);

// Update specific preferences
const success = await userProfileUtils.updatePreferences(userId, preferences);
```

#### Rental Offer Operations
```typescript
import { rentalOfferUtils } from '@/lib/supabase-utils';

// Get user's offers
const offers = await rentalOfferUtils.getUserOffers(userId);

// Create new offer
const offer = await rentalOfferUtils.createOffer(offerData);

// Update offer status
const success = await rentalOfferUtils.updateOfferStatus(offerId, 'accepted');
```

#### Authentication Operations
```typescript
import { authUtils } from '@/lib/supabase-utils';

// Get current user
const user = await authUtils.getCurrentUser();

// Get current session
const session = await authUtils.getCurrentSession();

// Sign out
const success = await authUtils.signOut();
```

#### Subscription Operations
```typescript
import { subscriptionUtils } from '@/lib/supabase-utils';

// Get user subscription
const subscription = await subscriptionUtils.getUserSubscription(userId);

// Validate access token
const isValid = await subscriptionUtils.validateAccessToken(token);
```

## Performance Optimizations

### Indexes Created
- `idx_user_profiles_user_id`
- `idx_rental_offers_user_id`
- `idx_rental_offers_created_at`
- `idx_subscriptions_user_id`
- `idx_subscriptions_status`
- `idx_orders_user_id`
- `idx_access_tokens_token`

### Automatic Triggers
- `updated_at` timestamps are automatically updated on all tables

## Error Handling

### Centralized Error Handling
```typescript
import { handleSupabaseError } from '@/lib/supabase-utils';

try {
  // Supabase operation
} catch (error) {
  const errorInfo = handleSupabaseError(error, 'operation_context');
  console.error('Operation failed:', errorInfo);
  toast.error(errorInfo.message);
}
```

### Common Error Codes
- `PGRST116`: No data found
- `23505`: Duplicate record
- `42501`: Permission denied
- `08P01`: Connection error

## Health Monitoring

### Database Health Check
```typescript
import { healthCheck } from '@/lib/supabase-utils';

// Test connection
const isConnected = await healthCheck.testConnection();

// Get table statistics
const counts = await healthCheck.getTableCounts();
```

## Security Best Practices

1. **Environment Variables**: Never commit API keys to version control
2. **RLS Policies**: All tables have Row Level Security enabled
3. **Client Configuration**: Uses PKCE flow for enhanced security
4. **Token Validation**: Access tokens are properly validated and marked as used
5. **Error Handling**: Sensitive error details are not exposed to users

## Local Development

### Setup Steps
1. Copy `.env.example` to `.env`
2. Update with your Supabase credentials
3. Run migrations: `supabase db push`
4. Start development server: `npm run dev`

### Testing Database Operations
```typescript
// Test all utilities
import { healthCheck } from '@/lib/supabase-utils';

const testDatabase = async () => {
  const isConnected = await healthCheck.testConnection();
  console.log('Database connected:', isConnected);
  
  const counts = await healthCheck.getTableCounts();
  console.log('Table counts:', counts);
};
```

## Deployment Checklist

- [ ] Environment variables set in Vercel
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Indexes created
- [ ] Health checks passing
- [ ] Error handling implemented
- [ ] Performance monitoring in place

## Support

For issues with Supabase setup:
1. Check the error logs in Vercel/console
2. Verify environment variables are set correctly
3. Ensure RLS policies allow the operation
4. Test database connection using health check utilities

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)