<template>
  <div class="tap-statement-sorting drag-and-drop-statement-sorting">
    <div class="drag-and-drop-content">
       <!-- <div class="drag-and-drop-info">
        <p><fa class="icon" icon="info-circle"/> {{ $t('sorting_g.drag.tip') }}</p>
      </div> -->
      <div class="tap-sorting-list ordered">
        <TapSortingStatementItem v-for="(item, index) in resultList"
                                 :itemOptions="{
                                  item: item,
                                  indexOfList: index,
                                  type: 'ordered',
                                  displayOption: options.displayOption,
                                  orderNumber: index + 1
                                 }"
                                 :key="index"
                                 @removeFromOrder="removeItemFromOrder"/>
      </div>
      <!-- <hr v-if="resultList.length > 0 && options.list.length !== 0"> -->
      <div class="tap-sorting-list raw">
        <TapSortingStatementItem v-for="(item, index) in options.list"
                                 :itemOptions="{
                                  item: item,
                                  indexOfList: index,
                                  type: 'raw',
                                  displayOption: options.displayOption,
                                 }"
                                 :key="index"
                                 @moveToOrder="moveItemToOrder"/>
      </div>
    </div>
    <button class="btn"
            @click="updateOrder"
            :class="{ 'btn-primary' : isConfirmDisabled, 'btn-success' : !isConfirmDisabled}"
            :disabled="isConfirmDisabled ">{{ $t('button_g.confirm_order') }}</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import TapSortingStatementItem from '@/components/common/sorting/TapSortingStatementItem.vue'
import { StatementSortingOptions } from '@/interfaces/SortingInterfaces'

@Component({
  name: 'TapSortingStatement',
  components: { TapSortingStatementItem }
})
export default class TapSortingStatement extends Vue {
  @Prop({
    default: {
      list: []
    }
  })
  options!: StatementSortingOptions

  totalStatementCount: number = 0
  resultList: object[] = []

  created () {
    this.totalStatementCount = this.options.list.length
    this.resultList = []
  }

  get isConfirmDisabled () : boolean {
    return this.resultList.length !== this.totalStatementCount
  }

  moveItemToOrder (rawItemIndex: number) {
    this.resultList.push(this.options.list[rawItemIndex])
    this.options.list.splice(rawItemIndex, 1)
  }

  removeItemFromOrder (orderedItemIndex: number) {
    this.options.list.push(this.resultList[orderedItemIndex])
    this.resultList.splice(orderedItemIndex, 1)
  }

  updateOrder () {
    if (this.isConfirmDisabled) {
      return
    }

    this.$emit('updateOrder', this.resultList)
    this.resultList = []
  }
}
</script>
