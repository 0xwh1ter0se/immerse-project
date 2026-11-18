-- AlterTable
ALTER TABLE "User"
ADD COLUMN "phoneCountryCode" TEXT,
ADD COLUMN "phoneNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneCountryCode_phoneNumber_key"
ON "User"("phoneCountryCode", "phoneNumber");
