
CREATE TYPE "policy_type" AS ENUM (
  'strict',
  'middling',
  'lax'
);

CREATE TYPE "attendance" AS ENUM (
  'registered',
  'attended',
  'noshow'
);



CREATE TABLE "event_log" (
  "id" SERIAL PRIMARY KEY,
  "eventID" int,
  "memberID" int,
  "status" attendance
);


CREATE TABLE "events" (
  "id" SERIAL PRIMARY KEY,
  "start_time" timestamp,
  "end_time" timestamp,
  "title" varchar(100),
  "description" text,
  "location" text,
  "cost_public" float,
  "cost_member" float,
  "max_attendees" int,
  "min_attendees" int,
  "organizer" int,
  "materials_list" text,
  "remote_link" text,
  "members_only" bool,
  "cancellation_type" policy_type
);
