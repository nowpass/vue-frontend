import Vue from 'vue'
import Router from 'vue-router'
import Options from '@/components/Options'
import Vault from '@/components/Vault'

Vue.use(Router)

const Bar = {template: '<div>bar</div>'}

export default new Router({
    routes: [
        {
            path: '/',
            name: 'nowpass Vault',
            component: Vault
        },
        {
            path: '/options',
            name: 'Options',
            component: Options
        },
        {
            path: '/bar',
            component: Bar
        }
    ]
})
