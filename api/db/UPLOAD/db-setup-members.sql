DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS contact_info;
DROP TABLE IF EXISTS member_sponsors;


-- to be used for tool access privileges
CREATE TYPE "privilege" AS ENUM (
  'board',
  'reg_member',
  'new_member',
  'child',
  'guest'
);

-- so that we can bill businesses for sponsored individuals
CREATE TYPE "entity" AS ENUM (
  'business',
  'individual'
);


CREATE TABLE "members" (
  "id" SERIAL PRIMARY KEY,
  "contactID" int,
  "membership" int,
  "fname" varchar(100),
  "lname" varchar(100),
  "created_at" date NOT NULL DEFAULT current_date,
  "member_since" date DEFAULT current_date,
  "entity_type" entity,
  "access_privilege" privilege,
  "emergency_name" varchar(100),
  "emergency_phone" int,
  "emergency_rel" varchar(100),
  "balance" decimal(12,4),
  "active" boolean
);

CREATE TABLE "contact_info" (
  "id" SERIAL PRIMARY KEY,
  "forum_name" varchar(100),
  "about_myself" varchar(100),
  "age_of_majority" boolean,
  "phone" int,
  "address" varchar(100),
  "city" varchar(100),
  "country" varchar(100),
  "postal" varchar(10),
  "email" varchar(100) UNIQUE,
  "student_conf" date,
  "student" boolean,
  "school_program" varchar(200),
  "grad_date" date,
  "auto_make_model" varchar(100),
  "auto_plate" varchar(100),
  "liability" date,
  "antibullying" date,
  "liab_link" varchar(100),
  "antibully_link" varchar(100),
  "total_donated" decimal(12,4),
  "stripe_info" varchar(100)
);



CREATE TABLE "member_sponsors" (
  "id" SERIAL PRIMARY KEY,
  "memberID" int,
  "sponsorID" int,
  "consumables" boolean NOT NULL DEFAULT false,
  "storage" boolean NOT NULL DEFAULT false,
  "classes" boolean NOT NULL DEFAULT false,
  "membership" boolean NOT NULL DEFAULT true
);

ALTER TABLE "contacts" ADD FOREIGN KEY ("id") REFERENCES "members" ("id");
ALTER TABLE "member_sponsors" ADD FOREIGN KEY ("memberID") REFERENCES "members" ("id");
ALTER TABLE "member_sponsors" ADD FOREIGN KEY ("sponsorID") REFERENCES "members" ("id");
