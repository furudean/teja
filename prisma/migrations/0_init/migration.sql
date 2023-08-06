-- CreateTable
CREATE TABLE "Ban" (
    "uuid" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "instated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified" TIMESTAMP(3) NOT NULL,
    "revoked" TIMESTAMP(3),
    "note" TEXT,
    "return_objects" BOOLEAN NOT NULL,

    CONSTRAINT "Ban_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Client" (
    "object_key" UUID NOT NULL,
    "object_name" TEXT NOT NULL,
    "owner_key" TEXT NOT NULL,
    "owner_name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "last_ping" TIMESTAMP(3) NOT NULL,
    "position" TEXT NOT NULL DEFAULT '',
    "first_ping" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("object_key")
);

