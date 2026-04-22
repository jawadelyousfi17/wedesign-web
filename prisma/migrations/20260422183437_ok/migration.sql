-- CreateTable
CREATE TABLE "_EventInterest" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EventInterest_AB_unique" ON "_EventInterest"("A", "B");

-- CreateIndex
CREATE INDEX "_EventInterest_B_index" ON "_EventInterest"("B");

-- AddForeignKey
ALTER TABLE "_EventInterest" ADD CONSTRAINT "_EventInterest_A_fkey" FOREIGN KEY ("A") REFERENCES "CalendarEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventInterest" ADD CONSTRAINT "_EventInterest_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
