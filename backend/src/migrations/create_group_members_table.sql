-- Create Groups table
CREATE TABLE IF NOT EXISTS "Groups" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "category" VARCHAR(255) DEFAULT 'Other' CHECK ("category" IN ('Home', 'Trip', 'Other')),
  "created_by" UUID REFERENCES "Users"(id),
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create GroupMembers table
CREATE TABLE IF NOT EXISTS "GroupMembers" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "group_id" UUID REFERENCES "Groups"(id) ON DELETE CASCADE,
  "user_id" UUID REFERENCES "Users"(id) ON DELETE CASCADE,
  "role" VARCHAR(10) NOT NULL DEFAULT 'MEMBER' CHECK ("role" IN ('ADMIN', 'MEMBER')),
  "joined_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add unique constraint to prevent duplicate memberships
CREATE UNIQUE INDEX IF NOT EXISTS "unique_group_member" ON "GroupMembers"("group_id", "user_id");