<template>
    <div id="options">
        <div class="container-fluid text-left">
            <div id="header" class="text-left row">
                <div class="col-12">
                    <h3>
                        nowpass Password Manager - <translate v-once :word="'nowpassOption'" />
                    </h3>
                </div>
            </div>

            <div id="content">
                <div class="alert alert-warning" v-if="errorMsg">
                    <h3>
                        <translate v-once :word="'validation_failed'" />
                    </h3>
                    {{errorMsg}}
                </div>

                <div class="alert alert-info" v-if="success">
                    <h3>
                        <translate v-once :word="'login_success'" />
                    </h3>
                    <translate v-once :word="'you_are_now_connected_to_nowpass'" />
                </div>

                <div class="alert alert-info" v-if="apiKey === ''">
                    <h3>
                        <translate v-once :word="'login_required'" />
                    </h3>
                    <translate v-once :word="'you_are_not_connected_to_nowpass'" />
                </div>

                <div class="form-group">
                    <label for="api-url" id="label-api-url">
                        <translate v-once :word="'apiUrl'" />
                    </label>
                    <input type="text" class="form-control" id="api-url" v-model="apiUrl"/>
                </div>

                <div class="form-group">
                    <label for="api-email" id="label-api-email">
                        <translate v-once :word="'apiEmail'" />
                    </label>
                    <input type="email" class="form-control" id="api-email" v-model="apiEmail"/>
                </div>

                <div class="form-group">
                    <label for="api-password" id="label-api-password">
                        <translate v-once :word="'apiPassword'" />
                    </label>
                    <input type="password" class="form-control" id="api-password" v-model="apiPassword"/>
                </div>

                <div class="form-group">
                    <input type="checkbox" v-model="storePassphrase" />
                    <label id="label-store-passphrase">
                        <translate v-once :word="'storePassphrase'" /> (<translate v-once :word="'insecure'" />)
                    </label>
                </div>

                <div class="form-group" v-if="storePassphrase">
                    <label for="passphrase" id="label-passphrase">
                        <translate v-once :word="'passphrase'" />
                    </label>
                    <input type="password" class="form-control" id="passphrase" v-model="passphrase"/>
                </div>

                <div class="form-group">
                    <button class="btn btn-default" v-on:click="testOptions()">
                        <translate v-once :word="'testApi'" />
                    </button>
                    <button class="btn btn-primary" v-on:click="validateAndSave()">
                        <translate v-once :word="'save'" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import translate from './Translate'
    import settings from '../mixins/settings'
    import axios from 'axios'

    export default {
        name: 'Options',
        components: {translate},
        mixins: [settings],
        created() {
            this.loadOptions();
        },
        methods: {
            loadOptions: function () {
                this.apiUrl = this.getSetting('apiUrl', 'http://localhost:1337');
                this.apiEmail = this.getSetting('apiEmail', '');

                this.apiPassword = this.getSetting('apiPassword', '');

                this.passphrase = this.getSetting('passphrase', '');
                this.apiKey = this.getSetting('apiKey', '');

                if (this.passphrase) {
                    this.storePassphrase = true;
                }
            },

            testOptions: function () {
                this.validateAndSave(false);
            },
            
            validateAndSave: function (store=true) {
                // TODO static consts with version
                let url = this.apiUrl + '/api/v1/entrance/login';

                let payload = {
                    'emailAddress': this.apiEmail,
                    'password': this.apiPassword,
                };

                axios.defaults.headers['Content-Type'] = 'application/vnd.api+json';
                axios.defaults.headers['Accept'] = 'application/vnd.api+json';

                var vm = this;

                this.errorMsg = '';
                this.success = false;

                axios({
                    method: 'put',
                    url: url,
                    data: JSON.stringify(payload)
                }).then(function (response) {
                    vm.success = true;
                    vm.store(response.data.apiKey);
                }).catch(function (error) {
                    vm.errorMsg = error.response.status + ' ' + error.response.statusText;
                });
            },

            store: function (apiKey) {
                this.saveSetting('apiUrl', this.apiUrl);
                this.saveSetting('apiEmail', this.apiEmail);

                // TODO Should not be saved after API key has been obtained
                this.saveSetting('apiPassword', this.apiPassword);

                // Remove passphrase
                if (!this.storePassphrase) {
                    this.passphrase = '';
                }

                this.saveSetting('passphrase', this.passphrase);
                this.saveSetting('apiKey', apiKey);

                // Make sure it's stored
                this.apiKey = apiKey;

                // Store login time
                this.saveSetting('loginTime', new Date().getTime());
            }
        },
        data() {
            return {
                // Options
                apiUrl: '',
                apiEmail: '',
                apiPassword: '',
                storePassphrase: false,
                passphrase: '',
                apiKey: '',

                // Error handling
                errorMsg: '',
                success: false
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    h1, h2 {
        font-weight: normal;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        display: inline-block;
        margin: 0 10px;
    }

    a {
        color: #42b983;
    }
</style>