-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN "destination" TEXT;
ALTER TABLE "Shipment" ADD COLUMN "estimatedDeliveryDate" DATETIME;
ALTER TABLE "Shipment" ADD COLUMN "location" TEXT;
ALTER TABLE "Shipment" ADD COLUMN "origin" TEXT;
ALTER TABLE "Shipment" ADD COLUMN "shippingDate" DATETIME;

-- CreateTable
CREATE TABLE "EditHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shipmentId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EditHistory_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
