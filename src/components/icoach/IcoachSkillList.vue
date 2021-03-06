<template>
  <div class="icoach-skills-list" :class="{ 'icoach-sidebar-open': !isCollapsed }">
    <div class="icoach-skills-expand">
      <img v-if="isCollapsed" @click="collapse" :src="require('@/assets/icons/sidebar-expand.svg')">
      <img v-else @click="collapse" :src="require('@/assets/icons/sidebar-collapse.svg')">
    </div>
    <div class="icoach-skills icoach-category-list">
      <router-link
        class="icoach-skill"
        v-for="skill in icoachCategoryInfo"
        :class="{ 'active': icoachSkillInfo.id === skill.id }"
        :key="skill.id"
        :to="{ name: 'icoach.skill', params: { icoachUserId: icoachUserData.icoachUserId, skillId: skill.id, stepId: 1 } }"
      >
        <span class="icoach-skill-name">{{ skill.name }}</span>
        <Progress
          :show-title="false"
          :show-percent-inside="false"
          :processed-props-items-count="skill.completed"
          :total-props-progress-items-count="skill.total"
          percentage="true"
        />
      </router-link>
    </div>
    <ul class="icoach-skills-category-list">
      <li
        v-for="(content, key) in icoachSkillInfo.icoachSkillContents"
        :class="{ 'active': stepId - 1 === parseInt(key), 'completed': content.isCompleted }"
        @click="changeStep(key + 1)"
        :key="key"
      >
        {{ content.icoachSkillArea.title }}
        <img class="hide-mobile" src="@/assets/icons/arrow-down-xs.svg">
        <!-- completed: {{ content.isCompleted }} -->
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator'
import { IcoachCategorySkill, IcoachSkill } from '@/interfaces/IcoachInterfaces'
import { IcoachData } from '@/interfaces/LocalStorageInterfaces'
import Progress from '@/components/common/progressBar/Progress.vue'
import { Getter } from 'vuex-class'

@Component({
  name: 'IcoachSkillList',
  components: {
    Progress
  }
})
export default class IcoachSkillList extends Vue {
  @Getter('icoach/getIcoachSkillMenu')
  icoachCategoryInfo!: IcoachCategorySkill[]
  @Getter('icoach/getIcoachSkill')
  icoachSkillInfo!: IcoachSkill

  @Prop({ required: true })
  icoachUserData!: IcoachData
  @Prop({ required: true })
  stepId!: number

  isCollapsed: boolean = true

  @Emit()
  changeStep (index: number) {
    this.$store.commit('icoach/setIcoachSkillStepId', index)

    this.$router.push({
      name: 'icoach.skill',
      params: {
        icoachUserId: this.icoachUserData.icoachUserId.toString(),
        skillId: this.icoachSkillInfo.id.toString(),
        stepId: index.toString()
      }
    })

    return index
  }

  collapse () {
    this.isCollapsed = !this.isCollapsed
  }
}
</script>

<style lang="scss">
 .icoach-skills-expand {
    z-index: 1;
    position: absolute;
    top: 24px;
    right: -14px;
    cursor: pointer;
    width: 28px;
    height: 28px;
    border-radius: 16px;
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.08);
    border: solid 1px #d6efff;
    background-color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    @media screen and (max-width: 600px) {
      right: 12px;
      top: auto;
      bottom: -12px;
    }
  }

  .icoach-sidebar-open .icoach-skills-expand {
    @media screen and (max-width: 600px) {
      transform: rotate(90deg);
    }
  }

  .icoach-skills-category-list {
    padding-left: 24px;
    @media screen and (max-width: 600px) {
      padding-left: 18px;
    }
    li {
      cursor: pointer;
      font-weight: 100;
      padding: 12px 25px 10px 0;
      border-bottom: 1px solid #e6f3fa;
      position: relative;
      right: -8px;
      top: calc(50% - 11px);
      @media screen and (max-width: 700px) {
        font-size: 14px;
      }

      @media screen and (max-width: 600px) {
        font-size: 16px;
        border-bottom: none;
      }
      img {
        position: absolute;
        right: 0;
        top: calc(50% - 10px);
      }
      &:after {
        content: '';
        position: absolute;
        width: 14px;
        height: 14px;
        border-radius: 8px;
        box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.1);
        border: solid 1px #e1e6e9;
        background: #ffffff;
        left: -33px;
        top: calc(50% - 8px);
        @media only screen and (max-width: 600px) {
          left: -26px;
        }
      }
      &.completed {
        &:after {
          background: url('../../assets/icons/icon-check.svg') no-repeat;
          background-size: 100%;
          box-shadow: none;
          border-color: #00cdbf;
        }
      }
      &.active {
        font-weight: 500;
        color: #3d5a80;
      }
    }
  }

  .hide {
    display: none;
  }
</style>
