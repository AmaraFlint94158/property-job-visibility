import { createServer } from "node:http";
import { jobRequest, failingJobs } from "./property_jobs.js";
import { infrai } from "./infrai_client.js";

const server = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/property-jobs/check") {
    response.writeHead(404).end();
    return;
  }
  let raw = "";
  for await (const chunk of request) raw += chunk;
  const parsed = jobRequest.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    response.writeHead(400, { "content-type": "application/json" }).end(JSON.stringify({ error: "invalid request" }));
    return;
  }
  const failures = failingJobs(parsed.data);
  if (failures.length > 0) {
    await infrai.errors.capture({
      title: "scheduled property job requires attention",
      message: failures.join(", "),
      level: "error",
      fingerprint: [parsed.data.propertyId, ...failures],
      exception: "scheduled property job reported overdue work",
      context: parsed.data
    });
  }
  response.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ propertyId: parsed.data.propertyId, failures }));
});

server.listen(Number(process.env.PORT ?? 3000), () => console.log("property job service listening"));
