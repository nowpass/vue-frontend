<template>
    <div id="login-first" class="now-modal now-fade" v-once>
        <h2>
            <router-link to="/options" target="_blank">
                <!-- TODO add a nice image -->
                <h1>
                    <translate v-once :word="'you_need_to_login_first'"/>
                </h1>
            </router-link>
        </h2>
    </div>
</template>

<script>
    import translate from '../helpers/Translate'

    /**
     * Login first popup / overlay
     */
    export default {
        name: "login-first",
        components: {translate},
        data() {
            return {}
        }
    }
</script>
