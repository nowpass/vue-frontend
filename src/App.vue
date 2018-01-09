<template>
    <div id="nowpass">

        <div class="container-fluid">
            <div class="row">
                <div id="nowpass-menu" class="col-sm-2" v-once v-if="hasMenu()">
                    <div class="list-group">
                        <div id="nowpass-logo" class="text-center">
                            <img src="./assets/nowpass-logo-transparent-300px.png">
                        </div>

                        <router-link to="/" class="list-group-item">
                            <icon name="lock"></icon>
                            <translate v-once :word="'vault'"/>
                        </router-link>
                        <router-link to="/notes" class="list-group-item">
                            <icon name="sticky-note-o"></icon>
                            <translate v-once :word="'secure_notes'"/>
                        </router-link>
                        <router-link to="/options" class="list-group-item">
                            <icon name="cog"></icon>
                            <translate v-once :word="'options'"/>
                        </router-link>
                        <!-- DEV -->
                        <div v-once v-if="isDev" class="dev-menu">
                            <h3>Development</h3>
                            <router-link to="/popup" class="list-group-item">Extension Popup</router-link>
                            <router-link to="/insert/test.de" class="list-group-item">Insert Popup</router-link>
                            <router-link to="/store/test.de" class="list-group-item">Store Popup</router-link>
                            <router-link to="/lab" class="list-group-item">Labs (Scrap pad)</router-link>
                            <router-link to="/generate" class="list-group-item">Generate</router-link>
                        </div>
                    </div>
                </div>
                <div id="nowpass-content" class="col-sm-10">
                    <!-- Content -->
                    <router-view></router-view>
                </div>
            </div>
        </div>

    </div> <!-- // End app -->
</template>

<script>
    // Components
    import translate from './components/Translate'
    import Options from './components/Options';
    import Vault from './components/Vault';

    // 3rd party
    import Icon from 'vue-awesome/components/Icon'

    // Icons Font-Awesome
    import 'vue-awesome/icons/lock'
    import 'vue-awesome/icons/sticky-note-o'
    import 'vue-awesome/icons/cog'

    /**
     * Entry point (mostly just an skeleton, logic is in the components)
     */
    export default {
        name: 'nowpass',
        components: {Options, Vault, translate, Icon},
        created() {
        },
        methods: {
            hasMenu: function () {
                const excludes = ['/popup', '/insert/', '/store/', '/generate'];

                for (let exclude of excludes) {

                    if (this.$route.path.startsWith(exclude)) {
                        return false;
                    }
                }

                return true;
            },
        },
        data() {
            return {
                isDev: process.env.NODE_ENV === 'development',
            }
        }
    }
</script>

<style>
    #nowpass {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background: #eff3f8;
    }

    #nowpass-menu {
        background: rgb(54, 62, 70);
        min-height: 100vh;
        padding: 0;
    }

    #nowpass-content {
        padding-left: 0;
        padding-right: 0;
    }

    #nowpass-menu .list-group-item {
        border: 0;
        border-radius: 0;
        background: rgb(54, 62, 70);
        padding: 1rem 1.25rem;
        color: #fff;
    }

    #nowpass-menu a.list-group-item:hover {
        background: rgb(18, 132, 184);
        color: #fff;
    }

    #nowpass-menu .router-link-exact-active {
        background: rgb(91, 100, 108);
        color: #fff;
    }

    #nowpass-menu .fa-icon {
        color: #888;
        display: inline-block;

        width: auto;
        height: 1rem; /* or any other relative font sizes */

        /* You would have to include the following two lines to make this work in Safari */
        max-width: 100%;
        max-height: 100%;
        margin-right: 7px;
    }

    #header {
        margin-bottom: 17px;
        padding: 14px 15px 0 15px;
        height: 60px;
        background: #fff;
        border-bottom: 1px solid #ccc;
    }

    #header h3 {
        line-height: 35px;
    }

    #nowpass-logo {
        padding: 5px;
        background: #fff;
        border-bottom: 1px solid #ccc;
        height: 60px;
    }

    #nowpass-logo img {
        max-width: 95%;
        max-height: 55px;
    }

    /* Bootstrap Modals suck */
    .now-fade {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        align-content: center;
        background: rgba(0, 0, 0, 0.8);
        z-index: 9;
    }

    .now-fade-white {
        background: rgba(255, 255, 255, 0.8);
    }

    .now-modal-inner {
        background: #fff;
        border-radius: 5px;
    }

    .now-modal-title {
        border-bottom: 1px solid #ccc;
        padding: 10px 15px;
    }

    .now-modal-body {
        padding: 10px 15px;
    }

    .now-modal-footer {
        padding: 10px 15px 0;
        border-top: 1px solid #ccc;
    }

    .dev-menu h3 {
        color: #fff;
        margin-top: 20px;
    }

    /** Common styles */
    #nowpass .list-group-item {
        border-radius: 0;
    }

</style>

<style lang="scss">
    @import './assets/styles/custom-bootstrap.scss';
    @import '../node_modules/bootstrap/scss/bootstrap.scss';
</style>
