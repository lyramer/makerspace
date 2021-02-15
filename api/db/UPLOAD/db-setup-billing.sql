DROP TABLE IF EXISTS invoice_items;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoice_payments;
DROP TABLE IF EXISTS membership_types;

CREATE TYPE "charge_type" AS ENUM (
  'vending',
  'event'
);

CREATE TYPE "subscription_type" AS ENUM (
  'membership',
  'storage',
);

CREATE TYPE "payment_method" AS ENUM (
  'credit',
  'debit',
  'cash',
  'gift'
);


-- LINE ITEMS FOR THE INVOICE
CREATE TABLE "invoice_items" (
  "id" SERIAL PRIMARY KEY,
  "memberID" int NOT NULL,      -- who 'benefits' from the item
  "type" charge_type,           --eg subscription, class fee, etc
  "amount" decimal(12,4) NOT NULL,
  "gst_taxable" boolean,
  "pst_taxable" boolean,
  "details" text,
  "qty" int,
  "bill_to_ID" int,             -- who actually pays for it
  "subscriptionID" int,         -- if it's for a subscription, which one
  "invoiceID" int
);

-- WHO IS SUBSCRIBED TO WHAT
CREATE TABLE "subscriptions" (
  "id" SERIAL PRIMARY KEY,
  "type" subscription_type,
  "start_date" date,
  "end_date" date,
  "cost" decimal(12,4),
  "cost_override" decimal(12,4) -- if we need to adjust the cost
  "bill_interval" int,
  "memberID" int,
  "membership_typeID" int,      -- all records should either have this
  "storage_itemID" int,         -- or this, but not both
  "active" boolean
);

-- LOOKUP TABLE FOR MEMBERSHIP TYPES
CREATE TABLE "membership_types" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar(100) NOT NULL,
  "amount_per_month" decimal(12,4),
)

-- USED TO GANG UP INVOICE ITEMS
CREATE TABLE "invoices" (
  "id" SERIAL PRIMARY KEY,
  "date_created" date,
  "date_paid" date,
  "total" decimal(12,4),
  "memberID" int
);

-- STORES PAYMENTS SEPARATE FROM INVOICE ITEMS AND INVOICES
-- SO PAYMENTS CAN BE SPLIT ACROSS MULTIPLE INVOICES
-- AND SO AN INVOICE CAN HAVE MULTIPLE PAYMENTS
CREATE TABLE "payments" (
  "id" SERIAL PRIMARY KEY,
  "payment_date" date,
  "amount" decimal(12,4),
  "method" payment_method,
  "payorID" int
);


-- LINK A PAYMENT TO AN INVOICE
CREATE TABLE "invoice_payments" (
  "id" SERIAL PRIMARY KEY,
  "invoiceID" int,
  "paymentID" int,
  "amount_applied" decimal(12,4) -- if a member overpays, store the credit in the 'balance' field of members
);

ALTER TABLE "invoices" ADD FOREIGN KEY ("memberID") REFERENCES "members" ("id");

ALTER TABLE "invoice_items" ADD FOREIGN KEY ("invoiceID") REFERENCES "invoices" ("id");
ALTER TABLE "invoice_items" ADD FOREIGN KEY ("memberID") REFERENCES "members" ("id");
ALTER TABLE "invoice_items" ADD FOREIGN KEY ("bill_to_ID") REFERENCES "members" ("id");
ALTER TABLE "invoice_items" ADD FOREIGN KEY ("subscriptionID") REFERENCES "subscriptions" ("id");


ALTER TABLE "subscriptions" ADD FOREIGN KEY ("memberID") REFERENCES "members" ("id");
ALTER TABLE "subscriptions" ADD FOREIGN KEY ("storage_itemID") REFERENCES "storage_items" ("id");
ALTER TABLE "subscriptions" ADD FOREIGN KEY ("membership_typeID") REFERENCES "membership_types" ("id");

ALTER TABLE "payments" ADD FOREIGN KEY ("payorID") REFERENCES "members" ("id");

ALTER TABLE "invoice_payments" ADD FOREIGN KEY ("invoiceID") REFERENCES "invoices" ("id");
ALTER TABLE "invoice_payments" ADD FOREIGN KEY ("paymentID") REFERENCES "payments" ("id");


