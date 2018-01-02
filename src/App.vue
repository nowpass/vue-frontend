<template>
    <div id="nowpass">

        <div class="container-fluid">
            <div class="row">
                <div id="nowpass-menu" class="col-md-2">
                    <router-link to="/">Vault</router-link>
                    <router-link to="/options">Options</router-link>
                </div>
                <div id="nowpass-content" class="col-md-10">
                    <router-view></router-view>
                </div>
            </div>
        </div>

    </div> <!-- // End app -->
</template>

<script>
    import Options from './components/Options';
    import Vault from './components/Vault';

    export default {
        name: 'nowpass',
        components: {Options, Vault},

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
</style>

<style lang="scss">
    @import './assets/styles/custom-bootstrap.scss';
    @import '../node_modules/bootstrap/scss/bootstrap.scss';
</style>
