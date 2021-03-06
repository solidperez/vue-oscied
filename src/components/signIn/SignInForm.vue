<template>
  <form class="form sign-in-form" @submit.prevent="submit" novalidate>
    <div class="form-group" :class="{'has-error' : errors.first('email')}">
      <label>{{ $t('email_address') }}</label>
      <input name="email"
        type="text"
        v-model="signInData.email"
        class="form-control"
        v-validate="'required'"
        :data-vv-as="$t('email_address')"/>
    </div>
    <div class="form-group" :class="{'has-error' : errors.first('password')}">
      <label>{{ $t('password') }}</label>
      <input name="password"
        v-validate="'required'"
        :data-vv-as="$t('password')"
        type="password"
        v-model="signInData.password"
        class="form-control"/>
    </div>
    <div class="row" v-if="error">
      <div class=" col-md-6">
        <p class="error">{{ error }}</p>
      </div>
    </div>
    <div class="form-actions form-actions-right form-actions-justified wrap">
      <div class="switch-form" @click="resetPassword">{{ $t('forgot_password') }}</div>
      <div class="form-actions form-actions-justified">
        <div class="checkbox-input">
          <input type="checkbox">
          <label>{{ $t('remember_me') }}</label>
        </div>
        <button type="submit" class="btn btn-success">{{ $t('button_g.sign_in') }}</button>
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { SignInData } from '@/interfaces/UserInterfaces'
import { AxiosResponse } from 'axios'
import UserService from '@/services/UserService'
import LocaleHelper from '@/utils/LocaleHelper'
import { EventBus } from '@/main'
import SurveyHelper from '@/utils/SurveyHelper'

@Component({ name: 'SignInForm' })
export default class SignInForm extends Vue {
  @Prop({ default: '' })
  surveyProduct?: string

  @Prop({ default: '' })
  accessCode?: string

  signInData: SignInData = {
    email: '',
    password: ''
  }
  error: string = ''

  async submit () {
    if (!await this.$validator.validateAll()) {
      return
    }

    try {
      if (this.surveyProduct === SurveyHelper.TS && this.accessCode) {
        this.signInData = { ...this.signInData, accessCode: this.accessCode }
      }
      await this.$auth.login(this.signInData)
      const userData = await UserService.getUser()
      LocaleHelper.setUserLocale(userData.locale)

      const userLocale = LocaleHelper.getUserLocale()
      if (userLocale) {
        this.$i18n.locale = userLocale
        this.localizeValidator(LocaleHelper.getLocaleForVeeValidate(userLocale))
      }

      this.$validator.reset()
      this.error = ''

      EventBus.$emit('authorizedComplete')
    } catch (error) {
      const response: AxiosResponse = error.response
      if (response) {
        this.error = response.data.message || response.data.error || 'Sign in error'
      } else {
        throw error
      }
    }
  }

  changeForm (formName: string) {
    this.$emit('changeForm', formName)
  }

  resetPassword () {
    this.$router.push({ name: 'requestResetPassword' })
  }
}
</script>
