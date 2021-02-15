CREATE TYPE "privilege" AS ENUM (
  'board',
  'reg_member',
  'new_member',
  'child',
  'guest'
);

CREATE TYPE "parts_type" AS ENUM (
  'purchased',
  'modified',
  'manufactured'
);

CREATE TYPE "shop" AS ENUM (
  'wood',
  'metal',
  'forge',
  'electronics',
  'cnc',
  'laser'
);

CREATE TYPE "policy_type" AS ENUM (
  'strict',
  'middling',
  'lax'
);

CREATE TYPE "access_type" AS ENUM (
  'general',
  'repair',
  'always'
);

CREATE TYPE "tool_status" AS ENUM (
  'broken',
  'good'
);

CREATE TYPE "committee_role" AS ENUM (
  'lead',
  'member'
);

CREATE TYPE "entity" AS ENUM (
  'business',
  'individual'
);

CREATE TYPE "storage_loc" AS ENUM (
  'lockers',
  'office',
  'flat'
);

CREATE TYPE "charge_type" AS ENUM (
  'vending',
  'event'
);

CREATE TYPE "subscription_type" AS ENUM (
  'membership',
  'storage'
);

CREATE TYPE "payment_method" AS ENUM (
  'credit',
  'debit',
  'cash',
  'gift'
);

CREATE TYPE "event_status" AS ENUM (
  'registered',
  'attended',
  'noshow'
);

CREATE TABLE "contact_info" (
  "id" SERIAL PRIMARY KEY,
  "phone_home" int,
  "phone_cell" int,
  "address" varchar,
  "city" varchar,
  "country" varchar,
  "postal" varchar,
  "email" varchar UNIQUE,
  "student_conf" date,
  "student" bool,
  "liability" date,
  "antibullying" date,
  "liab_link" varchar,
  "antibully_link" varchar,
  "stripe_info" varchar
);

CREATE TABLE "members" (
  "id" SERIAL PRIMARY KEY,
  "contactID" int,
  "membership" int,
  "fname" varchar,
  "lname" varchar,
  "created_at" date ,
  "entity_type" entity,
  "access_privilege" privilege,
  "emergency_name" varchar,
  "emergency_phone" int,
  "emergency_rel" varchar,
  "active" bool
);

CREATE TABLE "member_sponsors" (
  "id" SERIAL PRIMARY KEY,
  "memberID" int,
  "sponsorID" int,
  "consumables" bool,
  "storage" bool,
  "classes" bool,
  "membership" bool
);

CREATE TABLE "invoice_items" (
  "id" SERIAL PRIMARY KEY,
  "memberID" int,
  "type" charge_type,
  "amount" float,
  "gst_taxable" bool,
  "pst_taxable" bool,
  "details" varchar,
  "bill_to_ID" int,
  "subscriptionID" int,
  "invoiceID" int
);

CREATE TABLE "subscriptions" (
  "id" SERIAL PRIMARY KEY,
  "type" subscription_type,
  "bill_interval" int,
  "amount" float,
  "memberID" int,
  "storageID" int,
  "start_date" date,
  "end_date" date,
  "active" bool
);

CREATE TABLE "invoices" (
  "id" SERIAL PRIMARY KEY,
  "date_created" date,
  "date_paid" date,
  "total" float,
  "memberID" int
);

CREATE TABLE "payments" (
  "id" SERIAL PRIMARY KEY,
  "payment_date" date,
  "amount" float,
  "method" payment_method,
  "payorID" int
);

CREATE TABLE "invoice_payments" (
  "id" SERIAL PRIMARY KEY,
  "invoiceID" int,
  "paymentID" int,
  "amount_applied" float
);

CREATE TABLE "tools" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar UNIQUE,
  "location" int,
  "in_use" bool,
  "timeout" int,
  "date_acquired" varchar,
  "status" tool_status,
  "donor" varchar,
  "donorID" int,
  "max_book_length" int,
  "max_book_interval" int,
  "max_book_qty" int,
  "training_rqd" bool
);

CREATE TABLE "usage_log" (
  "id" SERIAL PRIMARY KEY,
  "toolID" int,
  "memberID" int,
  "start_time" timestamp,
  "end_time" timestamp,
  "access_success" bool,
  "condition_cleanliness" int,
  "condition_working" int
);

CREATE TABLE "tools_members" (
  "id" SERIAL,
  "toolID" int,
  "memberID" int,
  "access" bool,
  "repair" bool,
  "checkout" bool,
  PRIMARY KEY ("memberID", "toolID")
);

CREATE TABLE "access_change_log" (
  "id" SERIAL PRIMARY KEY,
  "toolID" int,
  "memberID" int
);

CREATE TABLE "maintenance_log" (
  "id" SERIAL PRIMARY KEY,
  "toolID" int,
  "memberID" int,
  "date_maintained" timestamp,
  "notes" varchar,
  "parts" int
);

CREATE TABLE "report_log" (
  "id" SERIAL PRIMARY KEY,
  "toolID" int,
  "memberID" int,
  "date_reported" timestamp,
  "notes" varchar,
  "response" varchar,
  "closed" bool DEFAULT false,
  "closerID" int
);

CREATE TABLE "parts" (
  "id" SERIAL PRIMARY KEY,
  "type" parts_type,
  "cost" float,
  "name" varchar,
  "description" varchar,
  "link" varchar
);

CREATE TABLE "events" (
  "id" SERIAL PRIMARY KEY,
  "start_time" varchar,
  "end_time" varchar,
  "title" varchar,
  "description" varchar,
  "location" varchar,
  "cost_public" float,
  "cost_member" float,
  "max_attendees" int,
  "min_attendees" int,
  "organizer" int,
  "materials_list" varchar,
  "remote_link" varchar,
  "members_only" bool,
  "cancellation_type" policy_type
);

CREATE TABLE "event_log" (
  "id" SERIAL PRIMARY KEY,
  "eventID" int,
  "memberID" int,
  "status" event_status
);

CREATE TABLE "committees" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar,
  "location" location,
  "checkout_privileges" int
);

CREATE TABLE "committees_members" (
  "id" SERIAL,
  "memberID" int,
  "committeeID" int,
  "role" committee_role,
  PRIMARY KEY ("memberID", "committeeID")
);

CREATE TABLE "areas" (
  "id" SERIAL PRIMARY KEY,
  "committeeID" int,
  "max_capacity" int,
  "max_book_length" int,
  "max_book_interval" int,
  "name" varchar,
  "max_book_qty" int
);

CREATE TABLE "bookings_tools" (
  "id" SERIAL PRIMARY KEY,
  "toolID" int,
  "memberID" int,
  "noshow" bool,
  "start_time" timestamp,
  "end_time" timestamp,
  "duration" int
);

CREATE TABLE "bookings_areas" (
  "id" SERIAL PRIMARY KEY,
  "areaID" int,
  "memberID" int,
  "noshow" bool,
  "start_time" timestamp,
  "end_time" timestamp,
  "duration" int
);

CREATE TABLE "storage" (
  "id" SERIAL PRIMARY KEY,
  "location" varchar,
  "cost" float,
  "waitlistID" int
);

CREATE TABLE "storage_item" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar,
  "memberID" int,
  "location" int,
  "available" bool,
  "cost_override" float
);

CREATE TABLE "waitlists" (
  "id" SERIAL,
  "memberID" int,
  "storage_type" storage_loc,
  "active" bool,
  "start_date" date,
  PRIMARY KEY ("memberID", "storage_type")
);

ALTER TABLE "members" ADD FOREIGN KEY ("contactID") REFERENCES "contact_info" ("id");

ALTER TABLE "members" ADD FOREIGN KEY ("membership") REFERENCES "subscriptions" ("id");

ALTER TABLE "member_sponsors" ADD FOREIGN KEY ("memberID") REFERENCES "members" ("id");

ALTER TABLE "member_sponsors" ADD FOREIGN KEY ("sponsorID") REFERENCES "members" ("id");

ALTER TABLE "invoice_items" ADD FOREIGN KEY ("memberID") REFERENCES "members" ("id");

ALTER TABLE "invoice_items" ADD FOREIGN KEY ("bill_to_ID") REFERENCES "member_sponsors" ("id");

ALTER TABLE "invoice_items" ADD FOREIGN KEY ("subscriptionID") REFERENCES "subscriptions" ("id");

ALTER TABLE "invoices" ADD FOREIGN KEY ("id") REFERENCES "invoice_items" ("invoiceID");

ALTER TABLE "subscriptions" ADD FOREIGN KEY ("memberID") REFERENCES "members" ("id");

ALTER TABLE "subscriptions" ADD FOREIGN KEY ("storageID") REFERENCES "storage" ("id");

ALTER TABLE "invoices" ADD FOREIGN KEY ("memberID") REFERENCES "members" ("id");

ALTER TABLE "payments" ADD FOREIGN KEY ("payorID") REFERENCES "members" ("id");

ALTER TABLE "invoice_payments" ADD FOREIGN KEY ("invoiceID") REFERENCES "invoices" ("id");

ALTER TABLE "invoice_payments" ADD FOREIGN KEY ("paymentID") REFERENCES "payments" ("id");

ALTER TABLE "tools" ADD FOREIGN KEY ("location") REFERENCES "areas" ("id");

ALTER TABLE "tools" ADD FOREIGN KEY ("donorID") REFERENCES "members" ("id");

ALTER TABLE "usage_log" ADD FOREIGN KEY ("toolID") REFERENCES "tools" ("id");

ALTER TABLE "usage_log" ADD FOREIGN KEY ("memberID") REFERENCES "members" ("id");

ALTER TABLE "tools_members" ADD FOREIGN KEY ("toolID") REFERENCES "tools" ("id");

ALTER TABLE "tools_members" ADD FOREIGN KEY ("memberID") REFERENCES "members" ("id");

ALTER TABLE "access_change_log" ADD FOREIGN KEY ("toolID") REFERENCES "tools" ("id");

ALTER TABLE "access_change_log" ADD FOREIGN KEY ("memberID") REFERENCES "members" ("id");

ALTER TABLE "maintenance_log" ADD FOREIGN KEY ("toolID") REFERENCES "tools" ("id");

ALTER TABLE "maintenance_log" ADD FOREIGN KEY ("memberID") REFERENCES "members" ("id");

ALTER TABLE "parts" ADD FOREIGN KEY ("id") REFERENCES "maintenance_log" ("parts");

ALTER TABLE "report_log" ADD FOREIGN KEY ("toolID") REFERENCES "tools" ("id");

ALTER TABLE "report_log" ADD FOREIGN KEY ("memberID") REFERENCES "members" ("id");

ALTER TABLE "report_log" ADD FOREIGN KEY ("closerID") REFERENCES "members" ("id");

ALTER TABLE "events" ADD FOREIGN KEY ("organizer") REFERENCES "members" ("id");

ALTER TABLE "event_log" ADD FOREIGN KEY ("eventID") REFERENCES "events" ("id");

ALTER TABLE "event_log" ADD FOREIGN KEY ("memberID") REFERENCES "members" ("id");

ALTER TABLE "committees_members" ADD FOREIGN KEY ("memberID") REFERENCES "members" ("id");

ALTER TABLE "committees_members" ADD FOREIGN KEY ("committeeID") REFERENCES "committees" ("id");

ALTER TABLE "areas" ADD FOREIGN KEY ("committeeID") REFERENCES "committees" ("id");

ALTER TABLE "bookings_tools" ADD FOREIGN KEY ("toolID") REFERENCES "tools" ("id");

ALTER TABLE "bookings_tools" ADD FOREIGN KEY ("memberID") REFERENCES "members" ("id");

ALTER TABLE "bookings_areas" ADD FOREIGN KEY ("areaID") REFERENCES "areas" ("id");

ALTER TABLE "bookings_areas" ADD FOREIGN KEY ("memberID") REFERENCES "members" ("id");

ALTER TABLE "waitlists" ADD FOREIGN KEY ("id") REFERENCES "storage" ("waitlistID");

ALTER TABLE "storage_item" ADD FOREIGN KEY ("memberID") REFERENCES "members" ("id");

ALTER TABLE "storage_item" ADD FOREIGN KEY ("location") REFERENCES "storage" ("id");

ALTER TABLE "waitlists" ADD FOREIGN KEY ("memberID") REFERENCES "members" ("id");

CREATE INDEX "member" ON "usage_log" ("memberID");

CREATE INDEX "tool" ON "usage_log" ("toolID");

CREATE INDEX "member" ON "tools_members" ("memberID");

CREATE INDEX "tool" ON "tools_members" ("toolID");

CREATE INDEX "tool" ON "maintenance_log" ("toolID");

CREATE INDEX "tool" ON "report_log" ("toolID");

CREATE INDEX "member" ON "event_log" ("memberID");

CREATE INDEX "event" ON "event_log" ("eventID");

CREATE INDEX "member" ON "committees_members" ("memberID");

CREATE INDEX "committee" ON "committees_members" ("committeeID");

CREATE INDEX "member" ON "bookings_tools" ("memberID");

CREATE INDEX "tool" ON "bookings_tools" ("toolID");

CREATE INDEX "member" ON "bookings_areas" ("memberID");

CREATE INDEX "area" ON "bookings_areas" ("areaID");

COMMENT ON COLUMN "usage_log"."start_time" IS 'When started';

COMMENT ON COLUMN "usage_log"."end_time" IS 'When ended';
