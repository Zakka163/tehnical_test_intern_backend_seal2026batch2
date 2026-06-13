declare module '@ioc:Adonis/Addons/Ally' {
  interface SocialProviders {
    google: {
      implementation: import('@ioc:Adonis/Addons/Ally').GoogleDriverContract
      config: import('@ioc:Adonis/Addons/Ally').GoogleDriverConfig
    }
  }
}
