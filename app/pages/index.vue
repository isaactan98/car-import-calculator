<template>
  <div>
    <UContainer>
      <UCard>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <!-- Bid Price -->
          <UFormField label="Bid Price (JPY)">
            <UInputNumber
              v-model="form.bidPriceJPY"
              :increment="false"
              :decrement="false"
              size="xl"
              :format-options="{ style: 'decimal', minimumFractionDigits: 0 }"
            />
            <span class="text-sm text-gray-500 mt-1 block">
              = RM {{ formatMYR(result.bidMYR) }}
            </span>
          </UFormField>

          <!-- Japan Fees -->
          <UFormField label="Japan Fees (JPY)">
            <UInputNumber
              v-model="form.japanFeesJPY"
              :increment="false"
              :decrement="false"
              size="xl"
              :format-options="{ style: 'decimal', minimumFractionDigits: 0 }"
            />
            <span class="text-sm text-gray-500 mt-1 block">
              = RM {{ formatMYR(result.japanFeesMYR) }}
            </span>
          </UFormField>

          <!-- FX Rate -->
          <UFormField label="FX Rate (1 JPY → MYR)">
            <UInputNumber
              v-model="form.customsFxJPY"
              :increment="false"
              :decrement="false"
              size="xl"
              :step="0.0001"
              :format-options="{ style: 'decimal', minimumFractionDigits: 4, maximumFractionDigits: 6 }"
            />
          </UFormField>

          <!-- AP Fee -->
          <UFormField label="Open AP Fee (MYR)">
            <UInputNumber
              v-model="form.apFee"
              :increment="false"
              :decrement="false"
              size="xl"
              :format-options="{ style: 'decimal', minimumFractionDigits: 0 }"
            />
          </UFormField>

          <!-- Tax -->
          <UFormField label="Tax (MYR)">
            <UInputNumber
              v-model="form.taxAmount"
              :increment="false"
              :decrement="false"
              size="xl"
              :format-options="{ style: 'decimal', minimumFractionDigits: 0 }"
            />
          </UFormField>

          <!-- SST Rate -->
          <UFormField label="SST Rate (%)">
            <UInputNumber
              v-model="form.sstRate"
              :increment="false"
              :decrement="false"
              size="xl"
              :format-options="{ style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 }"
            />
          </UFormField>

          <!-- Handling Fee -->
          <UFormField label="Handling Fee (MYR)">
            <UInputNumber
              v-model="form.handlingFee"
              :increment="false"
              :decrement="false"
              size="xl"
              :format-options="{ style: 'decimal', minimumFractionDigits: 0 }"
            />
          </UFormField>
        </div>
      </UCard>

      <!-- Results -->
      <h2 class="mt-6">
        Cost Breakdown (MYR)
      </h2>
      <ul class="mt-2 space-y-1">
        <li class="grid grid-cols-2 text-gray-500 text-sm">
          <span>Bid Price ({{ form.bidPriceJPY.toLocaleString() }} JPY)</span>
          <span class="text-right">RM {{ formatMYR(result.bidMYR) }}</span>
        </li>

        <li class="grid grid-cols-2 text-gray-500 text-sm">
          <span>Japan Fees ({{ form.japanFeesJPY.toLocaleString() }} JPY)</span>
          <span class="text-right">RM {{ formatMYR(result.japanFeesMYR) }}</span>
        </li>

        <li class="grid grid-cols-2 font-medium">
          <span>FOB Total ({{ result.totalJPY.toLocaleString() }} JPY)</span>
          <span class="text-right">RM {{ formatMYR(result.fobMYR) }}</span>
        </li>

        <li class="grid grid-cols-2">
          <span>AP Fee</span>
          <span class="text-right">RM {{ formatMYR(result.apFee) }}</span>
        </li>

        <li class="grid grid-cols-2">
          <span>Tax</span>
          <span class="text-right">RM {{ formatMYR(result.taxAmount) }}</span>
        </li>

        <li class="grid grid-cols-2 font-semibold border-t pt-2">
          <span>Base Cost (本钱)</span>
          <span class="text-right">RM {{ formatMYR(result.baseCost) }}</span>
        </li>

        <li class="grid grid-cols-2">
          <span>SST ({{ form.sstRate }}%)</span>
          <span class="text-right">RM {{ formatMYR(result.sstAmount) }}</span>
        </li>

        <li class="grid grid-cols-2 font-medium">
          <span>After SST</span>
          <span class="text-right">RM {{ formatMYR(result.afterSST) }}</span>
        </li>

        <li class="grid grid-cols-2">
          <span>Handling Fee (手续费)</span>
          <span class="text-right">RM {{ formatMYR(result.handlingFee) }}</span>
        </li>

        <li class="grid grid-cols-2 font-semibold border-t pt-2 text-lg">
          <span>Total (excl. insurance & road tax)</span>
          <span class="text-right">RM {{ formatMYR(result.total) }}</span>
        </li>
      </ul>

      <!-- Verdict -->
      <h3 class="mt-4">
        Verdict
      </h3>
      <UAlert
        v-if="result.total <= 160000"
        description="Very good deal — buy without hesitation"
      />
      <UAlert
        v-else-if="result.total <= 170000"
        color="warning"
        description="Acceptable — negotiate harder"
      />
      <UAlert
        v-else
        color="error"
        description="Overpriced — walk away"
      />
    </UContainer>
  </div>
</template>

<script setup lang="ts">
const { calculate } = useCalculator()

const form = reactive({
  bidPriceJPY: 2_700_000,
  japanFeesJPY: 300_000,
  customsFxJPY: 0.0255,
  apFee: 25_000,
  taxAmount: 35_000,
  sstRate: 6,
  handlingFee: 2_200
})

const result = computed(() => calculate(form))

const formatMYR = (value: number) =>
  value.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>
