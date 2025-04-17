<template>
  <div>
    <label class="block text-sm text-gray-400 mb-1">{{ label }}</label>
    <Listbox v-model="selectedValue" v-slot="{ open }" :disabled="!options.length">
      <div class="relative" ref="buttonRef">
        <ListboxButton
          :disabled="!options.length"
          :class="[
            'w-full px-4 py-2 text-left rounded-md border',
            'text-white',
            !options.length
              ? 'bg-white/5 border-white/10 opacity-40 cursor-not-allowed'
              : 'bg-white/10 border-white/20 hover:bg-white/20',
          ]"
        >
          {{ selectedLabel ?? (options.length ? placeholder : noOptionsText) }}
        </ListboxButton>

        <Teleport to="body">
          <div :style="dropdownStyles" class="fixed z-[1000]">
            <Transition
              @enter="updateDropdownPosition"
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <div ref="dropdownRef">
                <ListboxOptions
                  v-if="open && options.length"
                  class="max-h-60 w-full overflow-auto bg-white/10 text-white border border-white/20 rounded-md shadow-lg backdrop-blur-md"
                >
                  <ListboxOption
                    v-for="option in options"
                    :key="option.value"
                    :value="option.value"
                    v-slot="{ selected, active }"
                  >
                    <div
                      :class="[
                        'relative px-4 py-2 cursor-pointer flex items-center',
                        active ? 'bg-white/20' : '',
                      ]"
                    >
                      <span
                        :class="[
                          selected ? 'font-semibold text-white' : 'text-gray-300',
                          'truncate',
                        ]"
                      >
                        {{ option.label }}
                      </span>
                      <span v-if="selected" class="absolute right-4 text-white"> ✔ </span>
                    </div>
                  </ListboxOption>
                </ListboxOptions>
              </div>
            </Transition>
          </div>
        </Teleport>
      </div>
    </Listbox>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onBeforeUnmount, useTemplateRef } from 'vue'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'

const props = defineProps<{
  options: { value: string; label: string }[]
  label: string
  placeholder?: string
  noOptionsText?: string
}>()

const buttonRef = useTemplateRef<HTMLElement | null>('buttonRef')
const dropdownRef = useTemplateRef<HTMLElement | null>('dropdownRef')
const dropdownStyles = ref<Record<string, string>>({})

const selectedValue = defineModel<string>('selectedValue')

const selectedLabel = computed(() => {
  return props.options.find((o) => o.value === selectedValue.value)?.label
})

watch(selectedValue, () => {
  updateDropdownPosition()
})

function updateDropdownPosition() {
  nextTick(() => {
    if (!buttonRef.value || !dropdownRef.value) return

    const rect = buttonRef.value.getBoundingClientRect()
    const dropdownHeight = dropdownRef.value.offsetHeight
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    let top = 0
    let transformOrigin = 'top'

    if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
      top = rect.bottom + window.scrollY
      transformOrigin = 'top'
    } else {
      top = rect.top + window.scrollY - dropdownHeight
      transformOrigin = 'bottom'
    }

    dropdownStyles.value = {
      top: `${top}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${rect.width}px`,
      'transform-origin': transformOrigin,
    }
  })
}

onMounted(() => {
  updateDropdownPosition()
  window.addEventListener('scroll', updateDropdownPosition, true)
  window.addEventListener('resize', updateDropdownPosition)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateDropdownPosition, true)
  window.removeEventListener('resize', updateDropdownPosition)
})
</script>
