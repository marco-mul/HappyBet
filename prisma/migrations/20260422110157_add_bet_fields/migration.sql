/*
  Warnings:

  - Added the required column `amount` to the `Bet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Bet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventAt` to the `Bet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bet" ADD COLUMN     "amount" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "eventAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "BetPlayer" (
    "id" TEXT NOT NULL,
    "betId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "answer" BOOLEAN NOT NULL,

    CONSTRAINT "BetPlayer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BetPlayer" ADD CONSTRAINT "BetPlayer_betId_fkey" FOREIGN KEY ("betId") REFERENCES "Bet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
