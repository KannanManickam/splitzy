-- Update GroupMember table
ALTER TABLE "GroupMembers"
RENAME COLUMN "createdAt" TO "created_at";

ALTER TABLE "GroupMembers"
RENAME COLUMN "updatedAt" TO "updated_at";

ALTER TABLE "GroupMembers"
RENAME COLUMN "joinedAt" TO "joined_at";

-- Update Expense table
ALTER TABLE "Expenses"
RENAME COLUMN "createdAt" TO "created_at";

ALTER TABLE "Expenses"
RENAME COLUMN "updatedAt" TO "updated_at";

ALTER TABLE "Expenses"
RENAME COLUMN "createdBy" TO "created_by";

ALTER TABLE "Expenses"
RENAME COLUMN "groupId" TO "group_id";

ALTER TABLE "Expenses"
RENAME COLUMN "splitType" TO "split_type";

-- Update ExpenseShare table
ALTER TABLE "ExpenseShares"
RENAME COLUMN "expenseId" TO "expense_id";

ALTER TABLE "ExpenseShares"
RENAME COLUMN "userId" TO "user_id";

ALTER TABLE "ExpenseShares"
RENAME COLUMN "isPaid" TO "is_paid";

ALTER TABLE "ExpenseShares"
RENAME COLUMN "paidAt" TO "paid_at";

-- Update Group table
ALTER TABLE "Groups"
RENAME COLUMN "createdBy" TO "created_by";

-- Update GroupMember table
ALTER TABLE "GroupMembers"
RENAME COLUMN "groupId" TO "group_id";

ALTER TABLE "GroupMembers"
RENAME COLUMN "userId" TO "user_id";

-- Update Friend table
ALTER TABLE "friends"
RENAME COLUMN "userId" TO "user_id";

ALTER TABLE "friends"
RENAME COLUMN "friendId" TO "friend_id";