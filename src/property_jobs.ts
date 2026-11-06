import { z } from "zod";

export const jobRequest = z.object({
  propertyId: z.string().min(1),
  maintenanceOpen: z.boolean(),
  tenantDocumentDue: z.boolean(),
  inspectionDue: z.boolean()
});
export type JobRequest = z.infer<typeof jobRequest>;

export function failingJobs(input: JobRequest): string[] {
  const failures: string[] = [];
  if (input.maintenanceOpen) failures.push("maintenance");
  if (input.tenantDocumentDue) failures.push("tenant-document");
  if (input.inspectionDue) failures.push("inspection");
  return failures;
}
