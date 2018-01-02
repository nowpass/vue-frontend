<template>
    <div id="nowpass">

        <div class="container-fluid">
            <div class="row">
                <div id="nowpass-menu" class="col-md-2" v-if="$route.path != '/popup'">
                    <router-link to="/">Vault</router-link>
                    <router-link to="/options">Options</router-link>
                    <!-- DEV -->
                    <router-link to="/popup">Popup (DEV)</router-link>
                </div>
                <div id="nowpass-content" class="col-md-10">
                    <router-view></router-view>
                </div>
            </div>
        </div>

    </div> <!-- // End app -->
</template>

<script>
    import translate from './components/Translate'
    import Options from './components/Options';
    import Vault from './components/Vault';

    export default {
        name: 'nowpass',
        components: {Options, Vault, translate},
        created() {

        },
    }
</script>

<style>
    #nowpass-menu {
        background: #f1f1f1;
        min-height: 100vh;
    }

    #nowpass-content {
        padding-left: 0;
        padding-right: 0;
    }

    #header {
        margin-bottom: 17px;
        padding: 10px 15px 0 15px;
        background: #f1f1f1;
    }

    #header h3 {
        line-height: 35px;
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
</style>

<style lang="scss">
    @import './assets/styles/custom-bootstrap.scss';
    @import '../node_modules/bootstrap/scss/bootstrap.scss';
</style>
