export type FXCurrency = 'JPY' | 'USD' | 'MYR'

export type ExciseBase = 'CIF' | 'DEPRECIATED'

export type ImportCase = {
    // Vehicle (Japan import, MY)
    vehicle: {
        engineCC: number
        vehicleYear: number
        vehicleMonth?: number // 1-12
    }

    // Source cost (Japan side)
    source: {
        fob: number
        fobCurrency: FXCurrency

        inlandJP: number
        shipping: number
        insurance: number

        auctionFeeJP?: number
        agentCommissionJP?: number
    }

    // Customs & tax
    customs: {
        customsFxRate: number // convert fobCurrency -> MYR

        importRate: number // e.g. 0.30
        exciseRate: number // e.g. 0.90 (example only)
        sstRate: number // 0.10

        exciseBase: ExciseBase // recon: DEPRECIATED
        depreciationRate: number // 0.00 - 0.90 (can be computed)
    }

    // Fees (MY side)
    fees: {
        apFee: number
        customsFee: number
        portFee: number
        inspectionFee: number

        puspakomFee?: number
        jpjFee?: number
        runnerFee?: number
        transportMY?: number

        reconCost?: number
        dealerFee: number
    }

    pricing?: {
        targetMarginType?: 'fixed' | 'percentage'
        targetMarginValue?: number
        negotiationBuffer?: number
    }
}

export type ImportBreakdown = {
    cifForeign: number
    cifMYR: number

    importDuty: number
    exciseDuty: number
    sst: number

    govTotal: number
    feesTotal: number

    landedCost: number

    // Optional selling range
    sellLow?: number
    sellMid?: number
    sellHigh?: number
}
