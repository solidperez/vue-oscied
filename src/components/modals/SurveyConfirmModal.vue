<template>
  <div class="ccr-confirm">
    <h2 class="ccr-modal__title">{{ $t(`${surveyProduct}.confirmation_window`) }}</h2>
    <div v-html="$t(`${surveyProduct}.confirm_to_next_section`)">
    </div>
    <div class="ccr-modal__actions ccr-modal__actions-right">
      <button class="btn btn-primary" @click="$emit('cancel')">{{ $t('button_g.cancel') }}</button>
      <button class="btn btn-primary btn-primary-active" @click="$emit('confirm')">{{ $t('button_g.confirm') }}</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({ name: 'SurveyConfirmModal' })
export default class SurveyConfirmModal extends Vue {
  @Prop({})
  surveyProduct!: string
}
</script>
