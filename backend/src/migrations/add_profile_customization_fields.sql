ALTER TABLE users
ADD COLUMN currency_preference VARCHAR(10) DEFAULT 'USD',
ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN notification_preferences JSONB DEFAULT '{"email_notifications": true, "expense_reminders": true, "settlement_notifications": true, "weekly_summary": false}',
ADD COLUMN profile_picture VARCHAR(255);