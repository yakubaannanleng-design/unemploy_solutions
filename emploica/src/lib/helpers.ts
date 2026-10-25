import { DEMO_EMPLOYERS } from "../data/mockData";
import type { EmployerProfile } from "../types";

export function employerById(id: string): EmployerProfile | undefined {
  return DEMO_EMPLOYERS.find((e) => e.userId === id);
}