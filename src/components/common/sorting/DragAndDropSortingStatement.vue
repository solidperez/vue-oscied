<template>
  <div class="drag-and-drop-statement-sorting row" :class="surveyProduct">
    <!-- <div class="drag-and-drop-info">
      <p><fa class="icon" icon="info-circle"/> {{ $t('sorting_g.drag.tip') }}</p>
    </div> -->
    <div class="drag-and-drop-content">
      <div class="drag-and-drop">
        <draggable class="dd-sorting-list"
                   :list="options.list"
                   :handle="'.handle'"
                   :animation="250"
                   :forceFallback="true"
                   ghostClass="ghost-placeholder"
                   chosenClass="chosen-item"
                   dragClass="dragged-item"
                   @change="isListChanged = true">
          <div class="dd-sorting-item handle" v-for="(item, index) in options.list" :key="index">
            <span class="item-phrase">{{ item[options.displayOption] }}</span> <span class="arrow"><fa icon="arrows-alt-v"/></span>
          </div>
        </draggable>
      </div>
    </div>
    <button class="btn btn-primary btn-primary-active confirm-survey" @click="updateOrder">{{ $t('button_g.confirm_order') }}</button>
    <modal :classes="['ccr-modal']" name="confirm-modal" :height="'auto'">
      <SurveyConfirmModal :surveyProduct="surveyProduct" @cancel="handleCancelModal" @confirm="handleConfirmModal" />
    </modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import draggable from 'vuedraggable'
import { StatementSortingOptions } from '@/interfaces/SortingInterfaces'
import SurveyConfirmModal from '@/components/modals/SurveyConfirmModal.vue'

@Component({
  name: 'DragAndDropSortingStatement',
  components: { draggable, SurveyConfirmModal }
})
export default class DragAndDropSortingStatement extends Vue {
  @Prop({})
  surveyProduct!: string

  @Prop({
    default: {
      list: [],
      displayOption: 'title'
    }
  })
  options!: StatementSortingOptions
  isListChanged: boolean = false

  updateOrder () {
    if (!this.isListChanged) {
      this.$modal.show('confirm-modal')
    } else {
      this.$emit('updateOrder', this.options.list)
    }
  }

  handleCancelModal () {
    this.$modal.hide('confirm-modal')
  }

  handleConfirmModal () {
    this.$modal.hide('confirm-modal')
    this.$emit('updateOrder', this.options.list)
  }
}
</script>

<style lang="scss">
  .drag-and-drop-content {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 40px;
  }

  .drag-and-drop {
    flex: 1;
  }

  .confirm-survey {
    float: right
  }
</style>
