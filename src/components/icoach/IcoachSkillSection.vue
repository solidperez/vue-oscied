<template>
  <div class="icoach-content icoach-skill-content">
    <div class="icoach-content-wrapper">
      <h4>Step {{ currentStep }} of {{ stepsCount }}</h4>
      <h2>{{ icoachSkill.icoachSkillContents[currentStep - 1].icoachSkillArea.title }}</h2>
      <div v-html="content"></div>

      <div v-if="icoachSkill.icoachSkillContents[currentStep - 1].icoachSkillArea.isTest">
        <icoach-skill-form
          :icoach-skill="icoachSkill"
          :icoach-user-data="icoachUserData"
          :step-id="currentStep"
          @change-step="changeStep"
        />
      </div>

      <div v-else>
        <div class="icoach-skill-buttons">
          <button
            v-if="!isFirstStep"
            class="btn btn-primary"
            style="border-color: transparent"
            @click="changeStep('prev')"
          >
            {{ $t('icoach.back')}}
          </button>
          <button
            v-if="!isLastStep"
            class="btn btn-primary btn-primary-active"
            @click="changeStep('next')"
          >
            {{ $t('icoach.next') }}
          </button>
        </div>
        <hr class="separator">
        <icoach-skill-comment
          :icoach-skill="icoachSkill"
          :icoach-user-data="icoachUserData"
          :step-id="currentStep"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator'
import { IcoachSkill, IcoachSkillDirections } from '@/interfaces/IcoachInterfaces'
import { IcoachData } from '@/interfaces/LocalStorageInterfaces'
import IcoachHelper from '@/utils/IcoachHelper'
import IcoachSkillComment from '@/components/icoach/IcoachSkillComment.vue'
import IcoachSkillForm from '@/components/icoach/IcoachSkillForm.vue'

  @Component({
    name: 'IcoachSkillSection',
    components: { IcoachSkillComment, IcoachSkillForm }
  })
export default class IcoachSkillSection extends Vue {
    @Prop({ required: true })
    icoachSkill!: IcoachSkill
    @Prop({ required: true })
    icoachUserData!: IcoachData
    @Prop({ required: true })
    stepId!: number

    stepsCount: number = 0
    currentStep: number = 0
    isLastStep: boolean = false
    isFirstStep: boolean = false

    @Watch('stepId')
    onStepIdChange () {
      this.currentStep = this.stepId
      this.updateCurrentStep()
    }

    created () {
      this.stepsCount = this.icoachSkill.icoachSkillContents.length
      this.currentStep = this.stepId
      this.updateCurrentStep()
    }

    get content (): string {
      return this.icoachSkill ? this.icoachSkill.icoachSkillContents[this.currentStep - 1].content : ''
    }

    updateCurrentStep () {
      this.isFirstStep = false
      this.isLastStep = false

      if (this.currentStep === this.stepsCount) {
        this.isLastStep = true
      }

      if (+this.currentStep === 1) {
        this.isFirstStep = true
      }
    }

    @Emit()
    changeStep (direction: IcoachSkillDirections) {
      switch (direction) {
        case IcoachSkillDirections.PREV:
          this.currentStep--
          break
        case IcoachSkillDirections.NEXT:
          this.currentStep++
      }

      this.updateCurrentStep()

      this.$store.commit('icoach/setIcoachSkillStepId', this.currentStep)
      if (this.currentStep > this.stepsCount) {
        IcoachHelper.completeIcoachSkill(this.icoachUserData.icoachCourseId, this.icoachUserData.icoachUserId)
        return this.$router.push({ name: 'icoach.skill.complete' })
      }

      this.$router.push({
        name: 'icoach.skill',
        params: {
          icoachUserId: this.icoachUserData.icoachUserId.toString(),
          skillId: this.icoachSkill.id.toString(),
          stepId: this.currentStep.toString()
        }
      })

      return this.currentStep
    }
}
</script>

<style lang="scss">
  .separator {
    margin-top: 35px;
    height: 1px;
    color: #d8efff;
    background-color: #d8efff;
    border: none;
  }

  .icoach-content.icoach-skill-content {
    padding-top: 30px;
    padding-right: 0;
    @media screen and (max-width: 600px) {
      padding-top: 0;
    }

    .icoach-content-wrapper {
      p {
        margin-bottom: 15px;
      }
      h4 {
        margin-top: 0;
        font-size: 14px;
        color: #0085cd;
        font-weight: 600;
        margin-bottom: 3px;

        @media screen and (max-width: 600px) {
          font-size: 12px;
        }
      }
    }

    h2 {
      font-size: 32px;
      font-weight: 600;
      color: #3d5a80;
      margin-top: 0px;

      @media screen and (max-width: 600px) {
        font-size: 24px;
      }
    }
  }

  .icoach-content-wrapper {
    @media only screen and (max-width: 600px) {
      padding: 20px 5.5% 0 5.5%;
    }
  }

  .icoach-skill-buttons {
    text-align: right;
    margin-top: 24px;

    button {
      font-size: 16px;
      font-weight: 500;
      margin-left: 6%;
    }

    @media only screen and (max-width: 600px) {
      display: flex;
      button {
        margin: 0;
        width: 100%;

        &:nth-child(2) {
          margin-left: 15px;
        }
      }
    }
  }
</style>
