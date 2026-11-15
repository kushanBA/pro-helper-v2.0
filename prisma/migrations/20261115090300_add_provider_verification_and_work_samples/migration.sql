/*
  Warnings:

  - Added the required column `hourly_rate` to the `provider_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `provider_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "provider_profiles" ADD COLUMN     "hourly_rate" INTEGER NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "skills" TEXT[],
ADD COLUMN     "specialization" TEXT,
ADD COLUMN     "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "provider_verifications" (
    "id" UUID NOT NULL,
    "provider_profile_id" UUID NOT NULL,
    "nic_number" TEXT NOT NULL,
    "nic_front_image_path" TEXT NOT NULL,
    "nic_back_image_path" TEXT NOT NULL,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "provider_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_work_samples" (
    "id" UUID NOT NULL,
    "provider_profile_id" UUID NOT NULL,
    "image_path" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_work_samples_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provider_verifications_provider_profile_id_key" ON "provider_verifications"("provider_profile_id");

-- CreateIndex
CREATE INDEX "provider_work_samples_provider_profile_id_idx" ON "provider_work_samples"("provider_profile_id");

-- AddForeignKey
ALTER TABLE "provider_verifications" ADD CONSTRAINT "provider_verifications_provider_profile_id_fkey" FOREIGN KEY ("provider_profile_id") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_work_samples" ADD CONSTRAINT "provider_work_samples_provider_profile_id_fkey" FOREIGN KEY ("provider_profile_id") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
