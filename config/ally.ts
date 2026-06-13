import Env from '@ioc:Adonis/Core/Env'
import { AllyConfig } from '@ioc:Adonis/Addons/Ally'

const allyConfig: AllyConfig = {
  google: {
    driver: 'google',
    clientId: Env.get('GOOGLE_CLIENT_ID'),
    clientSecret: Env.get('GOOGLE_CLIENT_SECRET'),
    callbackUrl: Env.get('GOOGLE_CALLBACK_URL'),
    scopes: ['userinfo.email', 'userinfo.profile'],
  },
}

export default allyConfig
