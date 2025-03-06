/*
  Warnings:

  - You are about to drop the column `location` on the `Shipment` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Shipment` table. All the data in the column will be lost.
  - You are about to drop the column `shippingDate` on the `Shipment` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Shipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackingNumber" TEXT NOT NULL,
    "orderReferenceNumber" TEXT,
    "customerName" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "statusDetails" TEXT,
    "senderName" TEXT,
    "originStreetAddress" TEXT,
    "originCity" TEXT,
    "originState" TEXT,
    "originCountry" TEXT,
    "originPostalCode" TEXT,
    "origin" TEXT,
    "receiverName" TEXT,
    "destinationStreetAddress" TEXT,
    "destinationCity" TEXT,
    "destinationState" TEXT,
    "destinationCountry" TEXT,
    "destinationPostalCode" TEXT,
    "destination" TEXT,
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
    "description" TEXT,
    "estimatedDeliveryDate" DATETIME,
    "shipmentDate" DATETIME,
    "insuranceDetails" TEXT,
    "specialInstructions" TEXT,
    "returnInstructions" TEXT,
    "customerNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Shipment" ("createdAt", "destination", "email", "estimatedDeliveryDate", "id", "origin", "trackingNumber", "updatedAt") SELECT "createdAt", "destination", "email", "estimatedDeliveryDate", "id", "origin", "trackingNumber", "updatedAt" FROM "Shipment";
DROP TABLE "Shipment";
ALTER TABLE "new_Shipment" RENAME TO "Shipment";
CREATE UNIQUE INDEX "Shipment_trackingNumber_key" ON "Shipment"("trackingNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
