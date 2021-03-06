<template>
  <div class="survey ts-rater-ratee-results-page">
    <div class="survey-header">
      <h1 class="survey-title">{{ $t('welcome_to_survey', { surveyName: (surveyInfo) ? surveyInfo.title : '' }) }}</h1>
    </div>
    <div class="survey-content">
      <button class="btn btn-primary btn-primary-active" @click="goToList">
        {{ $t('button_g.back') }}
      </button>

      <div class="rater-ratee-wrapper">
        <div class="ratees-block user-ratees" v-if="ratee">
          <div class="ratee-items">
            <users-ratee-card :key="ratee.id"
                              :userRatee="ratee"
                              :has-view-my-score="false"
            />
          </div>
        </div>
        <div class="ratees-block results-block" >
          <div class="charts">
            <div class="left-result-side">
              <h2>{{ $t('ts.results.results') }}</h2>
              <p>{{ $t('ts.results.everyday_results') }}</p>
              <dial-chart :chart-data="formattedAverage" :options="dialChartOptions" />
              <p v-if="lastTen">{{ $t('ts.results.last_days', { count: lastTen.length }) }}</p>
              <bar-chart :chart-data="formattedLastTen" :options="barChartOptions"/>
            </div>
            <div class="right-result-side">
              <section v-if="rateeRatingResults">
                <p class="score-item">
                  <span class="title">{{ $t('ts.results.average_score') }}</span>
                  <span class="score">{{ ratingFormat(rateeRatingResults.performanceReviewScore) }}</span>
                </p>
                <p class="score-item">
                  <span class="title">{{ $t('ts.results.leadership_score') }}</span>
                  <span class="score">{{ ratingFormat(rateeRatingResults.leadershipSurveyScore) }}</span>
                </p>
              </section>
            </div>
          </div>
          <div class="ratees-block reports-download">
            <table v-if="rateeReviewsPeriods.length">
              <thead>
              <tr>
                <td>{{ $t('ts.results.from') }}</td>
                <td>{{ $t('ts.results.to') }}</td>
                <td>{{ $t('ts.results.average_score') }}</td>
                <td></td>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(review, id) in rateeReviewsPeriods" :key="id" @click="setActiveReview(review)">
                <td>{{ review.timeCreated | formatDate('D/M/YYYY h:mm a') }}</td>
                <td>{{ review.timeExpiry | formatDate('D/M/YYYY h:mm a') }}</td>
                <td>{{ scoreFormat(review.score) }}</td>
                <td>
                  <button @click="prepareReport(review.id)">{{ $t('ts.results.download_report') }}</button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import {
  SurveyInfo,
  TsManagerRating,
  TsManagerRatingAvarageScore,
  TsManagerRatingTypeEnum,
  TsRateeRatingResults,
  TsRateeReview,
  TsRateeUser,
  TsUserDto,
  User
} from '@/interfaces'
import { Getter } from 'vuex-class'
import TsService from '@/services/TsService'
import UsersRateeCard from '@/components/360/UsersRateeCard.vue'
import BarChart from '@/components/360/BarChart.vue'
import DialChart from '@/components/360/DialChart.vue'
import dayjs from 'dayjs'
import download from 'downloadjs'

@Component({
  name: 'RaterRateeResultsPage',
  components: {
    UsersRateeCard,
    BarChart,
    DialChart
  }
})
export default class RaterRateeResultsPage extends Vue {
  @Prop({ required: true })
  tsSurveyId !: number

  @Prop({ required: true })
  tsRaterRateeId !: number

  @Getter('user/currentUser')
  user!: User

  @Getter('ts/getUsers')
  tsUserInfo!: TsUserDto

  @Getter('user/isAuthenticated')
  isAuthenticated!: boolean

  @Getter('survey/getDisplayedBaseSurveyInfo')
  surveyInfo!: SurveyInfo

  @Watch('activeRateeReview')
  async onActiveRateeReviewChanged () {
    await this.prepareRatingReviews()
  }

  ratee: TsRateeUser | null = null
  rateeReviewsPeriods: TsRateeReview[] = []
  averageEverydayScore: TsManagerRatingAvarageScore | null = null
  lastTen: TsManagerRating[] | null = null
  ratingReviews: object | null = null
  activeRateeReview: TsRateeReview | null = null
  rateeRatingResults: TsRateeRatingResults | null = null

  async created () {
    this.ratee = await TsService.getRateeInfoById(this.tsRaterRateeId)
    this.averageEverydayScore = await TsService.getManagerRatingAvarageScore(this.tsRaterRateeId, TsManagerRatingTypeEnum.EVERYDAY)
    this.rateeReviewsPeriods = await TsService.getRateeReviewsPeriods(this.tsRaterRateeId)
    this.lastTen = await TsService.getManagerRatingLastTen(this.tsRaterRateeId, TsManagerRatingTypeEnum.EVERYDAY)
    this.rateeRatingResults = await TsService.getRateeRatingResults(this.tsRaterRateeId)
  }

  async prepareReport (rateeReviewId: number): Promise<void> {
    const blobPdfFile = await TsService.downloadRateeReviewsReport(this.tsRaterRateeId, rateeReviewId)
    const fileName = this.ratee
      ? `Report ${this.ratee.fullName} ${dayjs().format('DD//MM//YYYY HH:mm')}`
      : `Report ratee - ${this.tsRaterRateeId}, review - ${rateeReviewId} ${dayjs().format('DD//MM//YYYY HH:mm')}`

    download(blobPdfFile, fileName, 'application/pdf')
  }

  setActiveReview (review: TsRateeReview): void {
    this.activeRateeReview = review
  }

  scoreFormat (score: string): string {
    return `${(parseFloat(score) * 10).toFixed(1)}%`
  }

  ratingFormat (rating: number): string {
    const integerPart = Math.trunc(rating)
    const decimalPart = rating - integerPart

    const numberFractionDigits = decimalPart > 0 ? 1 : 0

    return `${rating.toFixed(numberFractionDigits)}%`
  }

  get formattedLastTen () : Chart.ChartData | null {
    const { lastTen } = this
    if (!lastTen) {
      return null
    }

    const labels = lastTen.map(item => {
      return item.timeCreated ? dayjs(item.timeCreated).format('ddd Do') : ''
    })

    const values = lastTen.map(item => {
      return parseInt(this.prepareScoreNumberToFloat(parseInt(item.score)))
    })

    return {
      labels: labels,
      datasets: [
        {
          backgroundColor: '#0085cd',
          data: values
        }
      ]
    }
  }

  get preparedAvarageScore () : string | null {
    if (!this.averageEverydayScore) {
      return null
    }

    return this.prepareScoreNumberToFloat(this.averageEverydayScore.score)
  }

  get formattedAverage () : Chart.ChartData | null {
    if (!this.preparedAvarageScore) {
      return null
    }

    const restScore = 10 - parseInt(this.preparedAvarageScore)

    return {
      datasets: [
        {
          backgroundColor: ['#0085cd', '#d6efff'],
          data: [parseInt(this.preparedAvarageScore), restScore]
        }
      ]
    }
  }

  get barChartOptions () : Chart.ChartOptions | null {
    return {
      legend: {
        display: false
      },
      scales: {
        yAxes: [
          {
            ticks: {
              min: 0,
              max: 10
            },
            gridLines: {
              borderDash: [4, 4]
            }
          }
        ],
        xAxes: [
          {
            gridLines: {
              display: false
            }
          }
        ]
      }
    }
  }

  get dialChartOptions () : Chart.ChartOptions | null {
    return {
      cutoutPercentage: 75,
      rotation: Math.PI,
      circumference: Math.PI,
      legend: {
        display: false
      },
      tooltips: {
        enabled: false
      },
      plugins: {
        doughnutlabel: this.preparedAvarageScore
      }
    }
  }

  prepareScoreNumberToFloat (score: number): string {
    return (score / 10).toFixed(1)
  }
  goToList (): void {
    this.$router.push({
      name: 'survey.ts.dashboard',
      params: {
        tsSurveyId: this.tsSurveyId.toString()
      }
    })
  }

  async prepareRatingReviews () {
    if (!this.activeRateeReview) {
      return
    }

    this.ratingReviews = await TsService.getRateeRatingReviews(this.tsRaterRateeId, this.activeRateeReview.id)
  }
}
</script>

<style scoped lang="scss">
.app-360 {
  .results-block .charts {
    display: flex;

    .left-result-side, .right-result-side {
      flex: 1;
    }
  }

  .score-item .score {
    float: right;
    font-weight: bold;
    color: #0085cd;
  }
}
</style>
