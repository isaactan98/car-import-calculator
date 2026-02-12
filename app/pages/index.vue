<template>
  <div>
    <UContainer>
      <UCard>
        <!-- FOB (SPECIAL CASE: Dynamic Currency) -->
        <UFormField label="FOB Vehicle Price">
          <div class="flex gap-2 items-center">
            <UInput v-model.number="form.fob" size="xl" />
            <USelect v-model="form.fobCurrency" :items="['MYR', 'USD', 'JPY']" size="xl" />
          </div>

          <span v-if="form.fobCurrency === 'USD' || form.fobCurrency === 'JPY'" class="text-sm text-gray-500">
            1 {{ form.fobCurrency }} ≈ RM
            {{ exchangeRates[form.fobCurrency] }}
          </span>
        </UFormField>

        <!-- Other Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
          <div v-for="field in fields" :key="field.key" class="mt-3">
            <UFormField :label="field.label">
              <template v-if="field.key === 'exciseBase'">
                <USelect size="xl" v-model="form.exciseBase" :items="field.items || ['DEPRECIATED', 'CIF']" />
              </template>

              <template v-else>
                <UInputNumber :increment="false" :decrement="false" size="xl" v-model="form[field.key]"
                  :step="getStep(field)" :format-options="getFormatOptions(field)" :placeholder="field.currency" />
              </template>
            </UFormField>

            <span v-if="field.currency === 'USD' || field.currency === 'JPY'" class="text-sm text-gray-500">
              1 {{ field.currency }} ≈ RM
              {{ field.currency === 'USD' ? form.customsFxUSD : form.customsFxJPY }}
            </span>
          </div>
        </div>
      </UCard>

      <!-- Results -->
      <h2 class="mt-6">Cost Breakdown (MYR)</h2>
      <ul class="mt-2 space-y-1">
        <li class="grid grid-cols-2">
          <span class="font-medium">Vehicle + Shipping (CIF)</span>
          <span class="text-right">RM {{ formatMYR(result.cif) }}</span>
        </li>

        <li class="grid grid-cols-2">
          <span class="font-medium">Fees (AP + JPJ + etc)</span>
          <span class="text-right">RM {{ formatMYR(result.totalLocalFees) }}</span>
        </li>

        <li class="grid grid-cols-2">
          <span class="font-medium">Import Duty</span>
          <span class="text-right">RM {{ formatMYR(result.importDuty) }}</span>
        </li>

        <li class="grid grid-cols-2">
          <span class="font-medium">Excise Duty</span>
          <span class="text-right">RM {{ formatMYR(result.exciseDuty) }}</span>
        </li>

        <li class="grid grid-cols-2">
          <span class="font-medium">SST</span>
          <span class="text-right">RM {{ formatMYR(result.sst) }}</span>
        </li>

        <li class="grid grid-cols-2 font-semibold border-t pt-2">
          <span>Total Landed Cost</span>
          <span class="text-right">RM {{ formatMYR(result.finalPrice) }}</span>
        </li>
      </ul>


      <!-- Verdict -->
      <h3 class="mt-4">Verdict</h3>
      <UAlert v-if="result.finalPrice <= 160000" description="✅ Very good deal — buy without hesitation" />
      <UAlert v-else-if="result.finalPrice <= 170000" color="warning" description="🟡 Acceptable — negotiate harder" />
      <UAlert v-else color="error" description="❌ Overpriced — walk away" />
    </UContainer>
  </div>
</template>

<script setup lang="ts">
/* =========================
   Types
========================= */
type FormKey = keyof typeof form
type NumberFieldKey = Exclude<FormKey, 'exciseBase' | 'fobCurrency'> // add any non-number keys here

type FXCurrency = 'USD' | 'JPY'
type FieldCurrency = FXCurrency | 'MYR' | '%' | 'TEXT'
type ExciseBase = 'CIF' | 'DEPRECIATED'

interface ImportCostInput {
  // Vehicle meta (for your own tracking / future presets)
  engineCC: number
  vehicleYear: number
  vehicleMonth: number // 1-12

  // FX used by Customs (IMPORTANT)
  customsFxUSD: number // 1 USD -> MYR
  customsFxJPY: number // 1 JPY -> MYR

  // FOB
  fob: number
  fobCurrency: FXCurrency | 'MYR'

  // Japan/Logistics
  inlandJP: number
  shipping: number
  insurance: number

  // Tax rates
  importRate: number     // %
  exciseRate: number     // %
  sstRate: number        // % (normally 10)

  // Recon key params
  exciseBase: ExciseBase
  depreciationRate: number // % (e.g. 40 means 40%)

  // Fees
  apFee: number
  customsFee: number
  portFee: number
  inspectionFee: number
  puspakomFee: number
  jpjFee: number
  runnerFee: number
  transportMY: number
  reconCost: number
  dealerFee: number
}

/* =========================
   Calculator
========================= */

const { calculate } = useCalculator()

/* =========================
   Form State (RAW INPUT)
========================= */

const form = reactive<ImportCostInput>({
  engineCC: 2387,
  vehicleYear: 2022,
  vehicleMonth: 6,

  customsFxUSD: 4.70,
  customsFxJPY: 0.031,

  fob: 2_800_000,
  fobCurrency: 'JPY',

  inlandJP: 80_000,   // JPY
  shipping: 900,      // USD
  insurance: 80,      // USD

  importRate: 30,
  exciseRate: 90,
  sstRate: 10,

  exciseBase: 'DEPRECIATED',
  depreciationRate: 40,

  apFee: 20000,
  customsFee: 2500,
  portFee: 1500,
  inspectionFee: 700,
  puspakomFee: 400,
  jpjFee: 1500,
  runnerFee: 800,
  transportMY: 600,
  reconCost: 3000,
  dealerFee: 0, // you self-use, set 0. if dealer quote, put their fee/margin here
})

/* =========================
   UI Field Metadata
   (FOB EXCLUDED ON PURPOSE)
========================= */

const fields: Array<
  | { key: 'exciseBase'; label: string; currency: 'TEXT'; items: string[] }
  | { key: NumberFieldKey; label: string; currency: Exclude<FieldCurrency, 'TEXT'> }
> = [
    { key: 'engineCC', label: 'Engine CC', currency: 'MYR' }, // just numeric
    { key: 'vehicleYear', label: 'Vehicle Year', currency: 'MYR' },
    { key: 'vehicleMonth', label: 'Vehicle Month (1-12)', currency: 'MYR' },

    { key: 'customsFxUSD', label: 'Customs FX: 1 USD → MYR', currency: 'MYR' },
    { key: 'customsFxJPY', label: 'Customs FX: 1 JPY → MYR', currency: 'MYR' },

    { key: 'inlandJP', label: 'Japan Inland Transport', currency: 'JPY' },
    { key: 'shipping', label: 'Shipping Cost (RORO)', currency: 'USD' },
    { key: 'insurance', label: 'Marine Insurance', currency: 'USD' },

    { key: 'importRate', label: 'Import Duty Rate', currency: '%' },
    { key: 'exciseRate', label: 'Excise Duty Rate', currency: '%' },
    { key: 'sstRate', label: 'SST Rate', currency: '%' },

    // Recon key params
    { key: 'depreciationRate', label: 'Depreciation Rate', currency: '%' },
    { key: 'exciseBase', label: 'Excise Base', currency: 'TEXT', items: ['DEPRECIATED', 'CIF'] },

    // Fees
    { key: 'apFee', label: 'Open AP Fee', currency: 'MYR' },
    { key: 'customsFee', label: 'Customs Clearance Fee', currency: 'MYR' },
    { key: 'portFee', label: 'Port Handling Fee', currency: 'MYR' },
    { key: 'inspectionFee', label: 'Inspection Fee', currency: 'MYR' },
    { key: 'puspakomFee', label: 'PUSPAKOM Fee', currency: 'MYR' },
    { key: 'jpjFee', label: 'JPJ Registration Fee', currency: 'MYR' },
    { key: 'runnerFee', label: 'Runner Fee', currency: 'MYR' },
    { key: 'transportMY', label: 'MY Transport (Port → Dealer/Home)', currency: 'MYR' },
    { key: 'reconCost', label: 'Recon / Service Cost', currency: 'MYR' },
    { key: 'dealerFee', label: 'Dealer / Margin / Handling', currency: 'MYR' },
  ]

/* =========================
   Exchange Rates
========================= */

const exchangeRates: Record<FXCurrency, number> = {
  USD: 3.93,
  JPY: 0.025,
}

/* =========================
   Normalize → MYR
========================= */
type FobCurrency = FXCurrency | 'MYR'

const fx = {
  USD: form.customsFxUSD ?? exchangeRates.USD,
  JPY: form.customsFxJPY ?? exchangeRates.JPY,
}

const toMYR = (amount: number, currency: FobCurrency) => {
  if (currency === 'MYR') return amount
  return amount * fx[currency]
}

const formMYR = computed(() => {
  // Convert FOB according to its selected currency
  const fobMYR = toMYR(form.fob, form.fobCurrency)

  // Convert known FX fields
  const inlandMYR = form.inlandJP * fx.JPY
  const shippingMYR = form.shipping * fx.USD
  const insuranceMYR = form.insurance * fx.USD

  return {
    // costs in MYR
    fob: fobMYR,
    inlandJP: inlandMYR,
    shipping: shippingMYR,
    insurance: insuranceMYR,

    // rates (%)
    importRate: form.importRate,
    exciseRate: form.exciseRate,
    sstRate: form.sstRate,

    // recon params
    exciseBase: form.exciseBase,
    depreciationRate: form.depreciationRate,

    // fees (MYR)
    apFee: form.apFee,
    customsFee: form.customsFee,
    portFee: form.portFee,
    inspectionFee: form.inspectionFee,
    dealerFee: form.dealerFee,

    // optional extras (MYR)
    puspakomFee: form.puspakomFee,
    jpjFee: form.jpjFee,
    runnerFee: form.runnerFee,
    transportMY: form.transportMY,
    reconCost: form.reconCost,
  }
})

/* =========================
   Final Result (MYR only)
========================= */

const result = computed(() => calculate(formMYR.value))

const formatMYR = (value: number) => {
  return value.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

type NumberFormatOptions = Intl.NumberFormatOptions

const getFormatOptions = (field: { key: string; currency: FieldCurrency }): NumberFormatOptions | undefined => {
  if (field.currency === 'TEXT') return undefined

  // FX rates need more precision
  if (field.key === 'customsFxUSD') {
    return { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 4 }
  }
  if (field.key === 'customsFxJPY') {
    return { style: 'decimal', minimumFractionDigits: 3, maximumFractionDigits: 6 }
  }

  // Percent fields
  if (field.currency === '%') {
    return { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 }
  }

  // Money fields
  return { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 }
}

const getStep = (field: { key: string; currency: FieldCurrency }) => {
  if (field.currency === 'TEXT') return undefined

  // FX rates
  if (field.key === 'customsFxUSD') return 0.0001
  if (field.key === 'customsFxJPY') return 0.000001

  // Percent
  if (field.currency === '%') return 0.01

  // Money
  return 1
}

</script>
