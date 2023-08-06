-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "permissions_mask" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "script_version" TEXT NOT NULL DEFAULT '';
