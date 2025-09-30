# Email Notification System

This document describes the email notification system implemented for LocalSpark.

## Overview

The notification system sends automated emails for booking events using Resend as the email provider. It supports:

- **Booking Confirmation**: Sent immediately when a booking is created
- **24-Hour Reminder**: Sent 24 hours before the appointment
- **2-Hour Reminder**: Sent 2 hours before the appointment  
- **Review Request**: Sent after the appointment is completed
- **Status Updates**: Sent when bookings are confirmed, cancelled, etc.

## Setup

### 1. Environment Variables

Add the following to your `.env.local` file:

```env
RESEND_API_KEY="re_your_resend_api_key_here"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Database Migration

The notification system requires two new database tables:

```bash
npx prisma migrate dev --name add_notification_system
```

### 3. Resend Account

1. Sign up for a free Resend account at https://resend.com
2. Get your API key from the dashboard
3. Add it to your environment variables

## API Endpoints

### POST /api/notifications/enqueue

Schedules notifications to be sent later.

**Request Body:**
```json
{
  "userId": "user_id",
  "type": "booking_confirmation",
  "title": "Booking Confirmed",
  "content": "Your booking has been confirmed.",
  "scheduledAt": "2024-01-01T10:00:00Z", // optional
  "metadata": {
    "bookingId": "booking_id"
  }
}
```

### POST /api/notifications/dispatch

Processes and sends all pending notifications.

**Response:**
```json
{
  "processed": 5,
  "sent": 4,
  "failed": 1,
  "errors": ["Error details..."]
}
```

### GET /api/notifications/dispatch

Returns notification queue statistics.

## Notification Types

- `booking_confirmation`: Sent when booking is created
- `booking_reminder_24h`: Sent 24 hours before appointment
- `booking_reminder_2h`: Sent 2 hours before appointment
- `booking_update`: Sent when booking status changes
- `review_request`: Sent after appointment completion

## User Preferences

Users can control which notifications they receive through the `NotificationPreference` model:

- `emailBookingConfirm`: Receive booking confirmations
- `emailBookingReminder`: Receive appointment reminders
- `emailReviewRequest`: Receive review requests

## Automatic Triggers

Notifications are automatically triggered by:

1. **Booking Creation** (`/api/bookings` POST)
   - Sends confirmation to customer and provider
   - Schedules 24h and 2h reminders
   - Schedules review request for after appointment

2. **Booking Status Updates** (`/api/bookings/[id]` PATCH)
   - Sends update notifications to relevant parties
   - Handles cancellations, confirmations, etc.

## Scheduling & Dispatch

For production use, set up a cron job to regularly dispatch notifications:

```bash
# Every 5 minutes
*/5 * * * * curl -X POST http://your-domain.com/api/notifications/dispatch
```

For development, you can use the included scheduler:

```typescript
import { startNotificationScheduler } from '@/lib/cron';

// Start the scheduler (checks every 5 minutes)
const interval = startNotificationScheduler();

// Stop when needed
clearInterval(interval);
```

## Email Templates

The system includes responsive HTML email templates for all notification types. Templates are generated dynamically with booking details and user information.

## Error Handling

- Notification failures don't affect booking operations
- Failed notifications are logged but don't block the main flow
- Retry logic can be implemented in the dispatch endpoint
- User preferences are respected for all notifications

## Testing

To test the notification system:

1. Create a booking through the UI
2. Check the `Notification` table for scheduled notifications
3. Call `/api/notifications/dispatch` to process pending notifications
4. Verify emails are sent (check Resend dashboard)

## Production Considerations

- Set up proper cron jobs for notification dispatch
- Monitor Resend usage and limits
- Implement retry logic for failed notifications
- Add notification analytics and tracking
- Consider rate limiting for notification endpoints