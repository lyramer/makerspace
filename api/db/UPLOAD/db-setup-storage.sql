DROP TABLE IF EXISTS waitlists;
DROP TABLE IF EXISTS storage_types;
DROP TABLE IF EXISTS storage_items;



--table that captures all the waitlists
CREATE TABLE waitlists (
  "id" SERIAL PRIMARY KEY,
  "memberID" int NOT NULL,              
  "storageID" int NOT NULL,                           --which storage type they're waiting on
  "active" boolean NOT NULL DEFAULT true,                                      --
  "start_date" date NOT NULL DEFAULT current_date   --this is how we establish order
);



-- lookup table for storage types 
CREATE TABLE storage_types (          
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,   --"office", "locker", etc
  "location" VARCHAR(100),        --"hallway", etc
  "cost" decimal(12,4) NOT NULL,  --per month
);


-- actual entries for each individual storage option
-- we can see who is renting each item in the 'subscriptions' table
CREATE TABLE storage_items (
  "id" SERIAL PRIMARY KEY,
  -- FK of the storage type lookup
  "storageID" int NOT NULL,  
  -- ("4", "236")   
  "name" varchar(100) NOT NULL, 
  "available" boolean
);


-- ADDING FK'S
ALTER TABLE "storage_items" ADD FOREIGN KEY ("storageID") REFERENCES "storage_types" ("id");
ALTER TABLE "waitlists" ADD FOREIGN KEY ("storageID") REFERENCES "storage_types" ("id");
ALTER TABLE "waitlists" ADD FOREIGN KEY ("memberID") REFERENCES "members" ("id");

-- ADDING INDEXES
CREATE INDEX idx_storage_waitlists ON waitlists(active, memberID, storageID);

-- STORED PROCEDURES & FUNCTIONS
CREATE OR REPLACE PROCEDURE add_to_waitlist(_memberID int, _storageID int)
LANGUAGE SQL
AS $$
  INSERT INTO waitlists(memberID, storageID)
              VALUES(_memberID, _storageID);
$$;


-- CREATE FUNCTION check_exists_waitlist(_memberID int) RETURNS TABLE(storageID, active, start_date)
--     AS 'select $1 + $2;'
--     LANGUAGE SQL
--     IMMUTABLE
--     RETURNS NULL ON NULL INPUT;


--CREATE FUNCTION check_position_waitlist
