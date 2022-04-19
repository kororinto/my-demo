
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from '@/store'
//import { lang, loadLanguageAsync } from './plugins/i18n'
// import VueI18n from 'vue-i18n';
import { exitApp } from '@/plugins/cordova/index.js'
import { device } from '@/utils/device'
import NavigationBar from './components/NavigationBar/index'
import Message from './components/Message/service.js'
Vue.prototype.$message = Message;
Vue.component('NavigationBar', NavigationBar)
import Vant from 'vant'
import { Toast } from 'vant'
import 'vant/lib/index.css'
import '@/assets/fonts/iconfont.css'
import './styles/common.scss'
Vue.use(Vant)


Vue.prototype.$bus = new Vue();

Vue.config.productionTip = false


// if (lang === 'ar') {
//   document.documentElement.setAttribute('dir', 'rtl')
// }

router.beforeEach((to, from, next) => {
  document.title = to.meta.title
  if (from.fullPath === '/'||from.path==='/studentHomework') {
    to.meta.isNoHistory = true
  }
  next()
})

const initVue = () => {
  new Vue({
    router,
    store,
    // i18n,
    render: h => h(App),
    mounted () {
      console.log(window.history && window.history.pushState);
      if (window.history && window.history.pushState) { 
        if(this.$route.name!="addGroup"){
          document.addEventListener('backbutton', () => {
            // alert('backbutton----' + this.$route.meta.isNoHistory)
             if (this.$route.meta.isNoHistory) {
               exitApp()
             } else {
               this.$router.back()
             }
           }, false)
        }
      }
    }
  }).$mount('#app')
}

 const start = () => {
  store.dispatch('user/setUser').then(() => {
    initVue()
  }).catch(err => {
    console.log(err)
    Toast(err)
  })
  // Promise.all([loadLanguageAsync(lang)]).then(() => {
    
  // })

  window.onReloadUserInfo = function () {
    store.dispatch('user/setUser')
  }
}

if (device.isRunningStandalone) {
  document.addEventListener('deviceready', start, false)
  // 防止安卓报window.focusLose不是函数的错误
  if (device.platform.android) {
    window.focusLose = (status) => {
      console.log(status)
    }
  }
} else {
  start()
}
