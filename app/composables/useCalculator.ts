export function useCalculator() {
    const SST_RATE = 0.1

    const calculate = (input: ImportCostInput) => {
        /** 
         * CIF (Cost, Insurance, Freight)
         */
        const cif =
            input.fob +
            input.inlandJP +
            input.shipping +
            input.insurance

        /**
         * Import Taxes
         */
        const importDuty = cif * (input.importRate / 100)
        const exciseDuty = cif * (input.exciseRate / 100)
        const sst = (cif + importDuty + exciseDuty) * SST_RATE

        const totalTax = importDuty + exciseDuty + sst

        /**
         * Local & Dealer Fees
         */
        const totalLocalFees =
            input.apFee +
            input.customsFee +
            input.portFee +
            input.inspectionFee +
            input.dealerFee

        /**
         * Final On-the-Road Price
         */
        const finalPrice = cif + totalTax + totalLocalFees

        return {
            cif,
            importDuty,
            exciseDuty,
            sst,
            totalTax,
            totalLocalFees,
            finalPrice,
        }
    }

    return { calculate }
}


export interface ImportCostInput {
    fob: number
    fobCurrency: FXCurrency | 'MYR'
    inlandJP: number
    shipping: number
    insurance: number
    importRate: number
    exciseRate: number
    apFee: number
    customsFee: number
    portFee: number
    inspectionFee: number
    dealerFee: number
}


export type Currency = 'MYR' | 'USD' | 'JPY' | '%'

type FXCurrency = "USD" | "JPY";