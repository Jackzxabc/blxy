import Vue from 'vue'
import App from './App'
import store from '@/store';
import base from '@/config/baseUrl'

Vue.prototype.$base = base;

Vue.config.productionTip = false

//挂载全局http请求
import $http from '@/config/requestConfig'
Vue.prototype.$http = $http;


App.mpType = 'app'

const app = new Vue({
	store,
    ...App
})
app.$mount()
