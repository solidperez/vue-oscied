<template>
  <div class="icoach-skill-page">
    <div class="icoach-header" v-if="error">
      <h1 class="icoach-title">
        <span>{{ icoachTitle }}</span>
      </h1>
      <h2>{{ error }}</h2>
    </div>
    <template v-else>
      <div class="icoach-skill-page__header">
        <div class="breadcrumbs hide-mobile">
          <router-link :to="{ name: 'icoach.welcome', params: { accessCode: icoachUserData.icoachAccessCode } }" class="breadcrumbs__item">
            <span>{{ icoachUserData.icoachCourseTitle }}</span>
          </router-link>
          <img src="@/assets/icons/arrow-down-xs.svg" class="breadcrumbs__arrow-right">
          <router-link :to="{ name: 'icoach.dashboard', params: { icoachUserId: icoachUserId } }" class="breadcrumbs__item">
            <span>{{ $t(`icoach.categories.${icoachUserData.icoachSkillCategoryId}`) }}</span>
          </router-link>
          <img src="@/assets/icons/arrow-down-xs.svg" class="breadcrumbs__arrow-right">
          <span class="breadcrumbs__item breadcrumbs__item--last">{{ icoachSkill ? icoachSkill.name : '' }}</span>
        </div>
        <div class="breadcrumbs show-mobile">
          <router-link :to="{ name: 'icoach.dashboard', params: { icoachUserId: icoachUserId } }" class="breadcrumbs__item">
            <img src="@/assets/icons/icon-arrow-down-blue.svg" class="breadcrumbs__arrow-left">
            <span>{{ $t(`icoach.categories.${icoachUserData.icoachSkillCategoryId}`) }}</span>
          </router-link>
        </div>
      </div>

      <div v-if="displaySkill" class="icoach-skill-page__content">
        <icoach-skill-list
          :icoach-user-data="icoachUserData"
          :step-id="icoachSkillStep"
          @change-step="pushToAnotherStep"
        />
        <icoach-skill-section
          :icoach-skill="icoachSkill"
          :icoach-user-data="icoachUserData"
          :step-id="icoachSkillStep"
          @change-step="pushToAnotherStep"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import IcoachLocalStorageHelper from '@/utils/IcoachLocalStorageHelper'
import { IcoachData, IcoachGeneralInfo, IcoachCategorySkill, IcoachSkill, MainLogosTypes } from '@/interfaces'
import IcoachService from '@/services/IcoachService'
import IcoachSkillSection from '@/components/icoach/IcoachSkillSection.vue'
import IcoachSkillList from '@/components/icoach/IcoachSkillList.vue'
import Breadcrumb from '@/components/common/breadcrumbs/Breadcrumb.vue'
import { BreadcrumbElement } from '@/interfaces/BreadcrumbsInterfaces'
import IcoachHelper from '@/utils/IcoachHelper'

@Component({
  name: 'IcoachSkillPage',
  components: { IcoachSkillSection, IcoachSkillList, Breadcrumb }
})
export default class IcoachSkillPage extends Vue {
  @Prop({ required: true })
  icoachUserId!: number
  @Prop({ required: true })
  skillId!: number
  @Prop({ required: true })
  stepId!: number

  @Getter('icoach/getIcoachInfo')
  icoachInfo!: IcoachGeneralInfo | null

  @Watch('skillId')
  onIcoachUserIdChanged () {
    this.loadData()
  }

  icoachUserData: IcoachData | null = null
  icoachSkill: IcoachSkill | null = null
  displaySkill: boolean = false
  icoachSkillStep: number = 0
  icoachSkillCategoryInfo: IcoachCategorySkill | null = null
  error: string | null = null
  icoachTitle: string = ''

  async created () {
    if (!IcoachLocalStorageHelper.hasIcoachUser(this.icoachUserId) ||
      !(this.icoachUserData = IcoachLocalStorageHelper.getIcoachUser(this.icoachUserId))
    ) {
      this.$router.push({ name: 'notFound' })

      return
    }

    this.icoachTitle = this.icoachUserData.icoachCourseTitle

    if (this.icoachInfo === null && this.icoachUserData.icoachAccessCode) {
      const response = await IcoachService.getIcoachCourseInfo(this.icoachUserData.icoachAccessCode)

      this.$store.commit('mainLogo/setLogos', response.logos)
      this.$store.commit('mainLogo/setType', MainLogosTypes.ICOACH_LOGOS)
      this.$store.commit('icoach/setIcoachInfo', {
        'userId': this.icoachUserId,
        'icoachCourse': response
      })
    }

    if (this.icoachInfo === null) {
      return
    }

    try {
      IcoachHelper.checkIcoachCourse(this.icoachInfo.icoachCourse)
    } catch (error) {
      this.error = error.message
      return
    }

    this.loadData()
  }

  async loadData (): Promise<void> {
    await this.uploadIcoachSkillInfo()

    this.icoachSkillStep = this.stepId
    this.displaySkill = true
  }

  get breadcrumbsData (): BreadcrumbElement[] {
    return [
      {
        name: this.icoachUserData!.icoachCourseTitle,
        link: { name: 'icoach.welcome', params: { accessCode: this.icoachUserData && this.icoachUserData.icoachAccessCode ? this.icoachUserData.icoachAccessCode : '' } }
      },
      {
        name: this.$t(`icoach.categories.${this.icoachUserData!.icoachSkillCategoryId}`),
        link: { name: 'icoach.dashboard', params: { icoachUserId: this.icoachUserId.toString() } }
      },
      {
        name: this.icoachSkill ? this.icoachSkill.name : ''
      }
    ]
  }

  async uploadIcoachSkillInfo (): Promise<void> {
    if (!this.icoachUserData || !this.icoachUserData.icoachAccessCode) {
      throw new Error()
    }

    try {
      this.icoachSkill = await IcoachService.getIcoachSkillInfo(this.icoachUserData.icoachAccessCode, this.skillId)

      const icoachSkillCategoryInfo = await IcoachService.getIcoachSkillCategory(
        this.icoachUserData.icoachCourseId,
        this.icoachUserData.icoachUserId,
        this.icoachSkill.category
      )

      this.$store.commit('icoach/setIcoachSkill', this.icoachSkill)
      this.$store.commit('icoach/setIcoachSkillMenu', icoachSkillCategoryInfo)
    } catch (e) {
      this.$router.push({ name: 'notFound' })
    }

    this.$store.commit('icoach/setIcoachSkillStepId', 1)
  }

  pushToAnotherStep (stepId: number) : void {
    this.icoachSkillStep = stepId
  }
}
</script>

<style lang="scss">
  .icoach-skill-page {
    position: relative;
    z-index: 1;
    background: #fff;
    height: 100%;

    &__header {
      border: 1px solid #deeeff;
    }

    &__content {
      display: flex;
      max-width: 1160px;
      padding-right: 20px;
      height: 100%;
      @media screen and (max-width: 600px) {
        flex-wrap: wrap;
        padding: 0;
        height: auto;
      }
      .icoach-skills-list {
        max-width: initial;
        padding: 55px 16px 24px;
        flex: 0 0 31.2%;
        margin-right: 0.5%;
        background-color: #fafdff;
        border-right: 1px solid #deeeff;
        position: relative;
        @media screen and (max-width: 600px) {
          flex: 0 0 100%;
          padding: 0 5.5%;
          max-width: 100%;
          border-bottom: 1px solid #e6f3fa;
          .icoach-skills-category-list {
            li:not(.active) {
              display: none;
            }
          }
        }
        .icoach-category-list {
          display: none;
        }
        .icoach-skill {
          width: 100%;
          @media only screen and (max-width: 600px) {
            display: inline-block;
            max-width: 190px;
            border-radius: 4px;
            padding: 8px 9px;
            margin-right: 12px !important;
            &:after {
              display: none;
            }
            .icoach-skill-name {
              font-size: 16px;
              white-space: break-spaces;
            }
          }
        }
        &.icoach-sidebar-open {
          position: absolute;
          height: 100%;
          width: 38.7%;
          min-width: 693px;
          display: flex;
          align-items: flex-start;
          box-shadow: 2px 7px 14px 0 rgba(0, 0, 0, 0.16);
          @media screen and (max-width: 600px) {
            .icoach-skills-category-list {
              width: 100% !important;
              margin: 0;
              max-width: 100% !important;
              li {
                border-bottom: 1px solid #e6f3fa;
                display: block !important;
                &:last-child {
                  border: none;
                }
              }
            }
          }
          @media only screen and (max-width: 800px) {
            min-width: 500px;
          }
          @media only screen and (max-width: 600px) {
            width: 100%;
            min-width: 100%;
            display: block;
            white-space: nowrap;
            position: fixed;
            top: 0;
            padding: 17px 20px;
            height: auto;
          }
          &+.icoach-content {
            padding-left: 36%;
            @media screen and (max-width: 600px) {
              padding-left: 0;
            }
          }
          .icoach-skills-category-list {
            width: calc(55% - 26px);
            max-width: 320px;
          }
          .icoach-category-list {
            width: 45%;
            padding-left: 7px;
            padding-top: 5px;
            margin-right: 26px;
            display: inline-block;
            @media screen and (max-width: 600px) {
              width: 100%;
              padding: 5px 0 0;
            }
            .active {
              border: solid 1px #0085cd;
              background-color: #0085cd;
              color: #fff;
              position: relative;
              &:after {
                content: '';
                position: absolute;
                right: -9px;
                top: calc(50% - 8px);
                width: 0;
                height: 0;
                border-style: solid;
                border-width: 8px 0 8px 8px;
                border-color: transparent transparent transparent #0085cd;
              }
              .icoach-skill-name {
                color: #fff
              }
            }
          }
        }
      }
    }
  }
  .breadcrumbs {
    color: #0085cd;
    display: flex;
    padding: 10px 20px;

    @media only screen and (max-width: 600px) {
      padding: 6px 12px;
    }

    .breadcrumbs__arrow-left {
      transform: rotate(90deg);
      margin: 0px 10px 0px 0px;
      width: 8px;
      height: 8px;
    }

    img {
      width: 12px;
      margin: 0 8px;
    }
    &__item {
      color: #0085cd;
      font-size: 12px;
      padding: 0 3px;

      &--last {
        color: #3d5a80;
      }
    }

    a {
      color: #0085cd;
      text-decoration: none;

      &:visited {
        color: #0085cd;
      }
    }
  }
</style>
