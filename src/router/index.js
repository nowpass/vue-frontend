import Vue from 'vue'
import Router from 'vue-router'
import Options from '@/components/Options'
import Vault from '@/components/Vault'
import Notes from '@/components/Notes'
import Popup from '@/components/Popup'
import Unlock from '@/components/Unlock'
import Lab from '@/components/Lab'
import Insert from '@/components/Insert'
import Store from '@/components/Store'

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
            path: '/notes',
            name: 'Notes',
            component: Notes
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
        },
        {
            path: '/store/:url',
            component: Store
        }
    ]
})
