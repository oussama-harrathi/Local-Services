-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_provider_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "categories" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "photos" TEXT,
    "whatsapp" TEXT,
    "messenger" TEXT,
    "menuItems" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "verificationStatus" TEXT NOT NULL DEFAULT 'unverified',
    "verificationLevel" TEXT,
    "verificationRequestedAt" DATETIME,
    "verificationCompletedAt" DATETIME,
    "verificationDocuments" TEXT,
    "verificationNotes" TEXT,
    "verificationBadgeType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "provider_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_provider_profiles" ("avatarUrl", "bio", "categories", "city", "createdAt", "id", "isHidden", "isVerified", "lat", "lng", "menuItems", "messenger", "name", "photos", "userId", "whatsapp") SELECT "avatarUrl", "bio", "categories", "city", "createdAt", "id", "isHidden", "isVerified", "lat", "lng", "menuItems", "messenger", "name", "photos", "userId", "whatsapp" FROM "provider_profiles";
DROP TABLE "provider_profiles";
ALTER TABLE "new_provider_profiles" RENAME TO "provider_profiles";
CREATE UNIQUE INDEX "provider_profiles_userId_key" ON "provider_profiles"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
