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



CREATE TABLE "areas" (
  "id" SERIAL PRIMARY KEY,
  "committeeID" int,
  "max_capacity" int,
  "max_book_length" int,
  "max_book_interval" int,
  "name" varchar(100),
  "max_book_qty" int
);