<template>
  <div class="ccr-confirm">
    <h2 class="ccr-modal__title">{{ title }}</h2>
    <p class="error" v-if="modalError">{{ modalError }}</p>
    <slot name="content"></slot>
    <div>{{ message }}</div>
    <div class="ccr-modal__actions ccr-modal__actions-right">
      <button class="btn btn-primary" @click="$emit('cancel')">{{ $t('button_g.cancel') }}</button>
      <button class="btn btn-primary btn-primary-active" @click="$emit('confirm')">{{ submitButton }}</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({ name: 'SimpleConfirmModal' })
export default class SimpleConfirmModal extends Vue {
  @Prop({ required: true })
  title!: string

  @Prop({ default: '' })
  submitButton!: string

  @Prop({ default: '' })
  message!: string

  @Prop({ required: true })
  modalError!: string
}
</script>
