<template>
  <div>
    <UContainer>
      <UCard>
        <!-- FOB (SPECIAL CASE: Dynamic Currency) -->
        <UFormField label="FOB Vehicle Price">
          <div class="flex gap-2 items-center">
            <UInput v-model.number="form.fob" />
            <USelect v-model="form.fobCurrency" :items="['USD', 'JPY', 'MYR']" />
          </div>

          <span v-if="form.fobCurrency === 'USD' || form.fobCurrency === 'JPY'" class="text-sm text-gray-500">
            1 {{ form.fobCurrency }} ≈ RM
            {{ exchangeRates[form.fobCurrency] }}
          </span>
        </UFormField>

        <!-- Other Fields -->
        <div v-for="field in fields" :key="field.key" class="mt-3">
          <UFormField :label="field.label">
            <UInput v-model.number="form[field.key]" :placeholder="field.currency" />
          </UFormField>

          <span v-if="field.currency === 'USD' || field.currency === 'JPY'" class="text-sm text-gray-500">
            1 {{ field.currency }} ≈ RM
            {{ exchangeRates[field.currency] }}
          </span>
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

type FXCurrency = 'USD' | 'JPY'
type FieldCurrency = FXCurrency | 'MYR' | '%'

interface ImportCostInput {
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

/* =========================
   Calculator
========================= */

const { calculate } = useCalculator()

/* =========================
   Form State (RAW INPUT)
========================= */

const form = reactive<ImportCostInput>({
  fob: 52000,
  fobCurrency: 'USD',

  inlandJP: 800,
  shipping: 2200,
  insurance: 500,

  importRate: 35,
  exciseRate: 85,

  apFee: 10000,
  customsFee: 2500,
  portFee: 1500,
  inspectionFee: 700,
  dealerFee: 5000,
})

/* =========================
   UI Field Metadata
   (FOB EXCLUDED ON PURPOSE)
========================= */

const fields: {
  key: Exclude<keyof ImportCostInput, 'fob' | 'fobCurrency'>
  label: string
  currency: FieldCurrency
}[] = [
    { key: 'inlandJP', label: 'Japan Inland Transport', currency: 'JPY' },
    { key: 'shipping', label: 'Shipping Cost (RORO)', currency: 'USD' },
    { key: 'insurance', label: 'Marine Insurance', currency: 'USD' },
    { key: 'importRate', label: 'Import Duty Rate', currency: '%' },
    { key: 'exciseRate', label: 'Excise Duty Rate', currency: '%' },
    { key: 'apFee', label: 'AP Fee', currency: 'MYR' },
    { key: 'customsFee', label: 'Customs Clearance Fee', currency: 'MYR' },
    { key: 'portFee', label: 'Port Handling Fee', currency: 'MYR' },
    { key: 'inspectionFee', label: 'PUSPAKOM Inspection Fee', currency: 'MYR' },
    { key: 'dealerFee', label: 'Dealer / Runner Fee', currency: 'MYR' },
  ]

/* =========================
   Exchange Rates
========================= */

const exchangeRates: Record<FXCurrency, number> = {
  USD: 4.7,
  JPY: 0.032,
}

/* =========================
   Normalize → MYR
========================= */

const formMYR = computed<ImportCostInput>(() => {
  const converted = { ...form }

  // FOB (dynamic currency)
  if (form.fobCurrency === 'USD' || form.fobCurrency === 'JPY') {
    converted.fob = form.fob * exchangeRates[form.fobCurrency]
  }

  // Other FX fields
  fields.forEach(field => {
    if (field.currency === 'USD' || field.currency === 'JPY') {
      converted[field.key] =
        form[field.key] * exchangeRates[field.currency]
    }
  })

  return converted
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
</script>
