/**
 * Working Calendar Service Port (ASM-004).
 * Evaluates academic working hours and holiday schedules to support SLA and reopen window calculations.
 */
export interface IWorkingCalendarPort {
  isWorkingDay(date: Date): Promise<boolean>;
  addWorkingDays(startDate: Date, businessDays: number): Promise<Date>;
}
