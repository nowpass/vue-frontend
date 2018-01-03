import Vue from 'vue'
import Router from 'vue-router'
import Options from '@/components/Options'
import Vault from '@/components/Vault'
import Popup from '@/components/Popup'
import Unlock from '@/components/Unlock'
import Lab from '@/components/Lab'
import Insert from '@/components/Insert'

Vue.use(Router)

/**
 * Router for nowpass
 */
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
            path: '/popup',
            component: Popup
        },
        {
            path: '/unlock',
            component: Unlock
        },
        {
            path: '/lab',
            component: Lab
        },
        {
            path: '/insert/:url',
            component: Insert
        }
    ]
})
