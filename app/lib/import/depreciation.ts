/**
 * Very simple editable schedule (months -> depreciation).
 * NOTE: This is a user-configurable assumption, not a legal guarantee.
 */
export const DEFAULT_DEPRECIATION_SCHEDULE: Array<{ maxMonths: number; rate: number }> = [
    { maxMonths: 12, rate: 0.10 },
    { maxMonths: 24, rate: 0.20 },
    { maxMonths: 36, rate: 0.30 },
    { maxMonths: 48, rate: 0.40 },
    { maxMonths: 60, rate: 0.50 },
    { maxMonths: 72, rate: 0.60 },
    { maxMonths: 84, rate: 0.70 },
    { maxMonths: 96, rate: 0.80 },
    { maxMonths: 9999, rate: 0.90 },
]

export function calcVehicleAgeMonths(
    vehicleYear: number,
    vehicleMonth: number | undefined,
    importYear: number,
    importMonth: number
): number {
    const vMonth = vehicleMonth ?? 1
    const months = (importYear - vehicleYear) * 12 + (importMonth - vMonth)
    return Math.max(0, months)
}

export function depreciationFromSchedule(
    ageMonths: number,
    schedule = DEFAULT_DEPRECIATION_SCHEDULE
): number {
    const hit = schedule.find((x) => ageMonths <= x.maxMonths)
    return hit ? hit.rate : schedule[schedule.length - 1]?.rate ?? 0
}
