-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Shipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "trackingNumber" TEXT NOT NULL,
    "orderReferenceNumber" TEXT,
    "customerName" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "statusDetails" TEXT,
    "statusColor" TEXT DEFAULT '#22c55e',
    "senderName" TEXT,
    "originStreetAddress" TEXT,
    "originCity" TEXT,
    "originState" TEXT,
    "originCountry" TEXT,
    "originPostalCode" TEXT,
    "origin" TEXT,
    "originLatitude" REAL,
    "originLongitude" REAL,
    "receiverName" TEXT,
    "destinationStreetAddress" TEXT,
    "destinationCity" TEXT,
    "destinationState" TEXT,
    "destinationCountry" TEXT,
    "destinationPostalCode" TEXT,
    "destination" TEXT,
    "destinationLatitude" REAL,
    "destinationLongitude" REAL,
    "weight" TEXT,
    "length" TEXT,
    "width" TEXT,
    "height" TEXT,
    "packageType" TEXT,
    "contentsDescription" TEXT,
    "declaredValue" TEXT,
    "shippingMethod" TEXT,
    "trackingProgress" TEXT,
    "shipmentStatus" TEXT,
    "currentLocation" TEXT,
    "currentLatitude" REAL,
    "currentLongitude" REAL,
    "description" TEXT,
    "estimatedDeliveryDate" DATETIME,
    "shipmentDate" DATETIME,
    "insuranceDetails" TEXT,
    "specialInstructions" TEXT,
    "returnInstructions" TEXT,
    "customerNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Shipment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Shipment" ("contentsDescription", "createdAt", "currentLatitude", "currentLocation", "currentLongitude", "customerName", "customerNotes", "declaredValue", "description", "destination", "destinationCity", "destinationCountry", "destinationLatitude", "destinationLongitude", "destinationPostalCode", "destinationState", "destinationStreetAddress", "email", "estimatedDeliveryDate", "height", "id", "insuranceDetails", "length", "orderReferenceNumber", "origin", "originCity", "originCountry", "originLatitude", "originLongitude", "originPostalCode", "originState", "originStreetAddress", "packageType", "phoneNumber", "receiverName", "returnInstructions", "senderName", "shipmentDate", "shipmentStatus", "shippingMethod", "specialInstructions", "statusColor", "statusDetails", "trackingNumber", "trackingProgress", "updatedAt", "weight", "width") SELECT "contentsDescription", "createdAt", "currentLatitude", "currentLocation", "currentLongitude", "customerName", "customerNotes", "declaredValue", "description", "destination", "destinationCity", "destinationCountry", "destinationLatitude", "destinationLongitude", "destinationPostalCode", "destinationState", "destinationStreetAddress", "email", "estimatedDeliveryDate", "height", "id", "insuranceDetails", "length", "orderReferenceNumber", "origin", "originCity", "originCountry", "originLatitude", "originLongitude", "originPostalCode", "originState", "originStreetAddress", "packageType", "phoneNumber", "receiverName", "returnInstructions", "senderName", "shipmentDate", "shipmentStatus", "shippingMethod", "specialInstructions", "statusColor", "statusDetails", "trackingNumber", "trackingProgress", "updatedAt", "weight", "width" FROM "Shipment";
DROP TABLE "Shipment";
ALTER TABLE "new_Shipment" RENAME TO "Shipment";
CREATE UNIQUE INDEX "Shipment_trackingNumber_key" ON "Shipment"("trackingNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
