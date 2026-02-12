export type Currency = 'MYR' | 'USD' | 'JPY' | '%'

export type ExciseBase = 'CIF' | 'DEPRECIATED'

export interface ImportCostInput {
    // Base costs (already normalized to MYR before passing in)
    fob: number
    inlandJP: number
    shipping: number
    insurance: number

    // Tax rates (%)
    importRate: number
    exciseRate: number

    // Recon logic
    exciseBase?: ExciseBase           // default: 'CIF'
    depreciationRate?: number         // % (0-90). default: 0
    sstRate?: number                  // % default: 10

    // Fees
    apFee: number
    customsFee: number
    portFee: number
    inspectionFee: number
    dealerFee: number

    // Optional extra fees (safe defaults)
    puspakomFee?: number
    jpjFee?: number
    runnerFee?: number
    transportMY?: number
    reconCost?: number
}

export function useCalculator() {
    const DEFAULT_SST_RATE = 10

    const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0)

    const calculate = (input: ImportCostInput) => {
        /**
         * CIF (Cost, Insurance, Freight)
         * NOTE: input here is assumed already in MYR.
         */
        const cif = n(input.fob) + n(input.inlandJP) + n(input.shipping) + n(input.insurance)

        /**
         * Import Duty
         */
        const importDuty = cif * (n(input.importRate) / 100)

        /**
         * Recon key: Excise base can be CIF or Depreciated Value
         */
        const depreciationRate = n(input.depreciationRate) / 100
        const depValue = cif * (1 - depreciationRate)

        const exciseBase: ExciseBase = input.exciseBase ?? 'CIF'
        const exciseBaseValue = exciseBase === 'DEPRECIATED' ? depValue : cif

        const exciseDuty = exciseBaseValue * (n(input.exciseRate) / 100)

        /**
         * SST (configurable, default 10%)
         */
        const sstRate = (input.sstRate ?? DEFAULT_SST_RATE) / 100
        const sst = (cif + importDuty + exciseDuty) * sstRate

        const totalTax = importDuty + exciseDuty + sst

        /**
         * Local & Dealer Fees
         */
        const totalLocalFees =
            n(input.apFee) +
            n(input.customsFee) +
            n(input.portFee) +
            n(input.inspectionFee) +
            n(input.dealerFee) +
            n(input.puspakomFee) +
            n(input.jpjFee) +
            n(input.runnerFee) +
            n(input.transportMY) +
            n(input.reconCost)

        /**
         * Final On-the-Road Price
         */
        const finalPrice = cif + totalTax + totalLocalFees

        return {
            // Core
            cif,
            importDuty,
            exciseDuty,
            sst,
            totalTax,
            totalLocalFees,
            finalPrice,

            // Recon transparency
            depreciationRate: n(input.depreciationRate), // % number
            depValue,
            exciseBase,
            exciseBaseValue,

            // Fee transparency (optional but nice)
            feeBreakdown: {
                apFee: n(input.apFee),
                customsFee: n(input.customsFee),
                portFee: n(input.portFee),
                inspectionFee: n(input.inspectionFee),
                dealerFee: n(input.dealerFee),
                puspakomFee: n(input.puspakomFee),
                jpjFee: n(input.jpjFee),
                runnerFee: n(input.runnerFee),
                transportMY: n(input.transportMY),
                reconCost: n(input.reconCost),
            },
        }
    }

    return { calculate }
}
