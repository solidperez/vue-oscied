import store from '@/store'
import { BaseApiService } from '@/services/BaseApiService'
import {User, RegistrationData, SignInData, UpdatePasswordData, UpdateUserData} from '@/interfaces/UserInterfaces'

class UserService extends BaseApiService {
  checkEmailAvailability (email: string) : boolean {
    return this.callMethod('get', '/public/check-email-availability', {},
      'available', { params: { email } })
  }

  getAvailableRegistrationFields () : string[] {
    return this.callMethod('get', '/public/registration-fields', {}, 'fields')
  }

  async getUser (hard: boolean = false) : Promise<User> {
    if (store.getters['user/currentUser'] && hard !== true) {
      return store.getters['user/currentUser']
    }

    const response = await this.api.get('/me')
    store.commit('user/setUser', response.data)
    store.commit('user/setIsAuthenticated', true)

    return response.data
  }

  logout () : void {
    store.commit('user/logout')
  }

  registration (regData: RegistrationData) : object {
    return this.callMethod('post', '/public/registration', { registrationForm: regData })
  }

  signIn (signInData: SignInData) : string {
    return this.callMethod('post', '/login_check', signInData, 'token')
  }

  update (userId: number, userData: UpdateUserData) : User {
      return this.callMethod('put', `/user/${ userId }`, { updateUserDataForm: userData })
  }

  changePassword (userId: number, passwordData: UpdatePasswordData) {
    return this.callMethod(
      'post',
      `/user/${ userId }/change_password`,
      { updatePasswordForm: passwordData }
    )
  }
}

export default new UserService()
