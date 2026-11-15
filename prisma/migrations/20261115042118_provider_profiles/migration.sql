-- CreateEnum
CREATE TYPE "ActiveMode" AS ENUM ('CUSTOMER', 'PROVIDER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "active_mode" "ActiveMode" NOT NULL DEFAULT 'CUSTOMER';

-- CreateTable
CREATE TABLE "service_categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "business_name" TEXT,
    "bio" TEXT NOT NULL,
    "years_of_experience" INTEGER NOT NULL,
    "service_areas" TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "provider_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_profile_categories" (
    "provider_profile_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_profile_categories_pkey" PRIMARY KEY ("provider_profile_id","category_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_categories_name_key" ON "service_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "service_categories_slug_key" ON "service_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "provider_profiles_user_id_key" ON "provider_profiles"("user_id");

-- CreateIndex
CREATE INDEX "provider_profile_categories_category_id_idx" ON "provider_profile_categories"("category_id");

-- AddForeignKey
ALTER TABLE "provider_profiles" ADD CONSTRAINT "provider_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_profile_categories" ADD CONSTRAINT "provider_profile_categories_provider_profile_id_fkey" FOREIGN KEY ("provider_profile_id") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_profile_categories" ADD CONSTRAINT "provider_profile_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed: starter service categories (admins can extend this list later)
INSERT INTO "service_categories" ("id", "name", "slug", "description", "updated_at") VALUES
    (gen_random_uuid(), 'Plumbing', 'plumbing', 'Pipes, leaks, taps, drainage and water fittings', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Electrical', 'electrical', 'Wiring, sockets, lighting and electrical faults', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Appliance Repair', 'appliance-repair', 'Repair of household appliances', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Air Conditioning', 'air-conditioning', 'AC installation, servicing and repair', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Carpentry', 'carpentry', 'Furniture, doors, windows and woodwork', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Painting', 'painting', 'Interior and exterior painting', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Masonry', 'masonry', 'Brickwork, tiling and concrete work', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Cleaning', 'cleaning', 'Home and office cleaning', CURRENT_TIMESTAMP);
