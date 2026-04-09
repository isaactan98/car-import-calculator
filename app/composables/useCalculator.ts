export function useCalculator() {
  const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0)

  const calculate = (input: {
    bidPriceJPY: number
    japanFeesJPY: number
    customsFxJPY: number
    apFee: number
    taxAmount: number
    sstRate: number
    handlingFee: number
  }) => {
    const totalJPY = n(input.bidPriceJPY) + n(input.japanFeesJPY)
    const fobMYR = totalJPY * n(input.customsFxJPY)
    const bidMYR = n(input.bidPriceJPY) * n(input.customsFxJPY)
    const japanFeesMYR = n(input.japanFeesJPY) * n(input.customsFxJPY)

    const baseCost = fobMYR + n(input.apFee) + n(input.taxAmount)
    const sstAmount = baseCost * (n(input.sstRate) / 100)
    const afterSST = baseCost + sstAmount
    const total = afterSST + n(input.handlingFee)

    return {
      totalJPY,
      bidMYR,
      japanFeesMYR,
      fobMYR,
      apFee: n(input.apFee),
      taxAmount: n(input.taxAmount),
      baseCost,
      sstRate: n(input.sstRate),
      sstAmount,
      afterSST,
      handlingFee: n(input.handlingFee),
      total
    }
  }

  return { calculate }
}
