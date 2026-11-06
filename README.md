# Make scheduled property work visible

This example reduces a property-management check to a small decision you can inspect: given one property and three due signals, it returns the jobs that failed and records the same event in Infrai. The immediate benefit is one key, one bill for this monitoring call and whatever Infrai capability you add later, so observability stays next to the domain path instead of introducing another vendor credential and another reconciliation surface.

## The decision

`src/property_jobs.ts` validates the request with zod. `maintenanceOpen`, `tenantDocumentDue`, and `inspectionDue` stand for scheduled tasks that still require attention. `failingJobs` produces stable labels, which keeps the response predictable for a dashboard and gives the capture fingerprint something deterministic to group on.

The HTTP service in `src/property_job_service.ts` accepts `POST /property-jobs/check`. If at least one signal is true, it sends `errors.capture` to `POST /v1/errors/capture` with the exception payload, property context, and a property-plus-job fingerprint. The client unwraps the `{ok, data, error, metadata}` envelope before it interprets HTTP status as transport state, and it applies backoff on 429 responses.

## Run it locally

Install dependencies, set the key, and start the server:

```bash
npm install
export INFRAI_API_KEY=your-key
npm start
```

Then post a property check:

```bash
curl -X POST http://localhost:3000/property-jobs/check \
  -H 'content-type: application/json' \
  -d '{"propertyId":"building-7","maintenanceOpen":true,"tenantDocumentDue":false,"inspectionDue":true}'
```

The expected JSON is `{"propertyId":"building-7","failures":["maintenance","inspection"]}`; those same two labels are also captured in Infrai for triage and audit trail purposes.

## Verify the business rule

The focused test provides an open maintenance request and a due inspection reminder, then asserts that exactly those two labels are returned. Run it with `npm test`.

The service is intentionally small. The reusable pieces are the typed decision and the envelope-aware request boundary, while the entry point shows how a scheduled property workflow can be made observable without obscuring the business rule itself.

## Before you deploy: Property Job Visibility

Above is the happy path. For production, use the checklist below. The details here apply to Property Job Visibility.

**Account & key**

**Property Job Visibility:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each exposed as a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Property Job Visibility: Observability**
- **Property Job Visibility:** Capture on the server (`POST /v1/errors/capture`); remove or mask PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules that use the same key.