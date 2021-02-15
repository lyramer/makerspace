CREATE TYPE "tool_status" AS ENUM (
  'good',
  'partial',
  'broken',
  'missing'
);

CREATE TABLE "tools" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar(200) UNIQUE NOT NULL,
  "location" int,
  "in_use" bool,
  "timeout" int,
  "date_acquired" DATE NOT NULL DEFAULT CURRENT_DATE,
  "status" tool_status,
  "donor" varchar(100),
  "donorID" int,
  "max_book_length" int,
  "max_book_interval" int,
  "max_book_qty" int,
  "training_rqd" bool NOT NULL DEFAULT false 
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
  "notes" text,
  "parts" int
);

CREATE TABLE "report_log" (
  "id" SERIAL PRIMARY KEY,
  "toolID" int,
  "memberID" int,
  "date_reported" timestamp,
  "notes" text,
  "response" text,
  "closed" bool DEFAULT false,
  "closerID" int
);

CREATE TABLE "parts" (
  "id" SERIAL PRIMARY KEY,
  "type" parts_type,
  "cost" float,
  "name" varchar(200),
  "description" text,
  "link" text
);