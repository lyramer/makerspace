CREATE TYPE "committee_role" AS ENUM (
  'lead',
  'member'
);

CREATE TABLE "committees" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar(100),
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