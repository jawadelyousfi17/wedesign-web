-- AlterTable
ALTER TABLE "CalendarEvent" ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "focus" TEXT,
ADD COLUMN     "login1337" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "year" TEXT;
