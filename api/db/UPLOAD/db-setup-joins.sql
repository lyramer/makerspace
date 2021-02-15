
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