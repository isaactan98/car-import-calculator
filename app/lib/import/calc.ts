import type { ImportBreakdown, ImportCase } from './types'

function n(v: number | undefined | null): number {
    return typeof v === 'number' && Number.isFinite(v) ? v : 0
}

export function calcImport(caseInput: ImportCase): ImportBreakdown {
    const { source, customs, fees, pricing } = caseInput

    // CIF (foreign currency)
    const cifForeign =
        n(source.fob) +
        n(source.inlandJP) +
        n(source.shipping) +
        n(source.insurance) +
        n(source.auctionFeeJP) +
        n(source.agentCommissionJP)

    // Convert to MYR using customs FX
    const cifMYR = cifForeign * n(customs.customsFxRate)

    // Taxes
    const importDuty = cifMYR * n(customs.importRate)

    const depValue = cifMYR * (1 - n(customs.depreciationRate))
    const exciseBaseValue = customs.exciseBase === 'DEPRECIATED' ? depValue : cifMYR
    const exciseDuty = exciseBaseValue * n(customs.exciseRate)

    const sst = (cifMYR + importDuty + exciseDuty) * n(customs.sstRate)

    const govTotal = importDuty + exciseDuty + sst

    const feesTotal =
        n(fees.apFee) +
        n(fees.customsFee) +
        n(fees.portFee) +
        n(fees.inspectionFee) +
        n(fees.puspakomFee) +
        n(fees.jpjFee) +
        n(fees.runnerFee) +
        n(fees.transportMY) +
        n(fees.reconCost) +
        n(fees.dealerFee)

    const landedCost = cifMYR + govTotal + feesTotal

    // Optional pricing
    let sellLow: number | undefined
    let sellMid: number | undefined
    let sellHigh: number | undefined

    if (pricing?.targetMarginType && pricing?.targetMarginValue != null) {
        const margin =
            pricing.targetMarginType === 'percentage'
                ? landedCost * pricing.targetMarginValue
                : pricing.targetMarginValue

        const buffer = n(pricing.negotiationBuffer)
        sellMid = landedCost + margin
        sellHigh = sellMid + buffer
        sellLow = Math.max(0, sellMid - buffer)
    }

    return {
        cifForeign,
        cifMYR,
        importDuty,
        exciseDuty,
        sst,
        govTotal,
        feesTotal,
        landedCost,
        sellLow,
        sellMid,
        sellHigh,
    }
}
