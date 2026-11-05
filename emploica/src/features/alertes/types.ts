import type { ContractType } from "@/types";

export type JobAlertFrequency = "immediate" | "daily";

export interface JobAlert {
  id: string;
  userId: string;
  category: string;
  city: string;
  contract: ContractType | "";
  frequency: JobAlertFrequency;
  active: boolean;
  createdAt: string;
}

export type NewJobAlert = Pick<JobAlert, "category" | "city" | "contract" | "frequency">;
