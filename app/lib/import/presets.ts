import type { ImportCase } from './types'

export const PRESET_GR86_RECON_JP: ImportCase = {
    vehicle: {
        engineCC: 2387,
        vehicleYear: 2022,
        vehicleMonth: 1,
    },
    source: {
        fob: 2_800_000, // JPY example
        fobCurrency: 'JPY',
        inlandJP: 80_000,
        shipping: 220_000,
        insurance: 20_000,
        auctionFeeJP: 0,
        agentCommissionJP: 0,
    },
    customs: {
        customsFxRate: 0.031, // JPY->MYR example
        importRate: 0.30,
        exciseRate: 0.90, // placeholder (you tweak)
        sstRate: 0.10,
        exciseBase: 'DEPRECIATED',
        depreciationRate: 0.40,
    },
    fees: {
        apFee: 20_000,
        customsFee: 2_500,
        portFee: 2_000,
        inspectionFee: 1_200,
        puspakomFee: 400,
        jpjFee: 1_500,
        runnerFee: 800,
        transportMY: 600,
        reconCost: 3_000,
        dealerFee: 0, // since you are “self use”, keep 0
    },
    pricing: {
        targetMarginType: 'fixed',
        targetMarginValue: 0,
        negotiationBuffer: 0,
    },
}
