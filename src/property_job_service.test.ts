import assert from "node:assert/strict";
import { failingJobs } from "./property_jobs.js";

const result = failingJobs({ propertyId: "building-7", maintenanceOpen: true, tenantDocumentDue: false, inspectionDue: true });
assert.deepEqual(result, ["maintenance", "inspection"]);
console.log("overdue maintenance and inspection jobs are surfaced");
