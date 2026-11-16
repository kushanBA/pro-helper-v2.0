/*
  Warnings:

  - You are about to drop the column `service_areas` on the `provider_profiles` table. All the data in the column will be lost.
  - Added the required column `service_coverage` to the `provider_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ServiceCoverage" AS ENUM ('ISLAND_WIDE', 'NEARBY');

-- AlterTable
ALTER TABLE "provider_profiles" DROP COLUMN "service_areas",
ADD COLUMN     "service_coverage" "ServiceCoverage" NOT NULL;
