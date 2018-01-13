<template>
    <div id="store">
        <div class="list-group">
            <div class="list-group-item">
                <h4>
                    <translate v-once :word="'store_login_for'"/>
                    {{url}}
                </h4>
            </div>
            <div id="list-elements" class="list-group-item">
                <div v-if="elements.length" class="list-group-item">
                    <translate v-once :word="'update_existing_login'"/>
                </div>

                <div v-for="element in elements" class="list-group-item list-group-item-action"
                     v-on:click.prevent="update(element)">
                    <div class="row align-items-center">
                        <div class="col-7">
                            <h4>{{element.title}}</h4>
                            <small>{{element.url.substr(0, 30)}}</small>
                        </div>
                        <div class="col-5">
                            {{element.username}}
                        </div>
                    </div>
                </div>
            </div>
            <div class="list-group-item list-group-item-action text-right">
                <button class="btn default" v-on:click.prevent="close()">
                    <translate v-once :word="'cancel'"/>
                </button>
                <button class="btn btn-primary" v-on:click.prevent="store()">
                    <translate v-once :word="'store_as_new_item'"/>
                </button>
            </div>
        </div>

        <div v-if="isLoading">
            <loading v-once></loading>
        </div>
    </div>
</template>

<script>
    // Components
    import translate from './helpers/Translate'
    import loading from './Loading'

    // Mixins
    import settings from '../mixins/settings'
    import decrypt from '../mixins/decrypt'
    import formparse from '../mixins/formparse'
    import chrome from '../mixins/chrome'

    // 3rd party
    import axios from 'axios'
    import Icon from 'vue-awesome/components/Icon'

    /**
     * Insert popup (in iframe in the site, calling chrome methods)
     */
    export default {
        name: "insert",
        components: {
            translate,
            loading,
            Icon
        },
        mixins: [settings, decrypt, formparse, chrome],
        created() {
            if (!this.postData) {
                console.log('NO POST data');

                // We shouldn't have been called actually
                window.localStorage.setItem('lastPostRequest', '');
                this.sendClosePopup();

                return;
            }

            this.load();
        },
        methods: {
            /**
             * TODO move to wrapper and add loading dialog
             *
             * Load the elements for this site
             */
            load: function () {
                // Should not happen
                if (!this.apiKey || !this.passphrase) {
                    throw 'Api key and passphrase needed for this view!';
                }

                let url = this.apiUrl + '/api/v1/elements?search=' + this.url + '&pw_only=true&limit=50';
                url = encodeURI(url);

                var vm = this;

                axios({
                    method: 'get',
                    url: url,
                    headers: {'api-key': this.apiKey},
                }).then(function (response) {
                    vm.elements = response.data['elements'];
                }).catch(function (error) {
                    vm.errorMsg = error.response.status + ' ' + error.response.statusText;
                });
            },

            /**
             * Update an element
             *
             * @param element {object}
             */
            update: function (element) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('In dev environment update called');
                    return;
                }

                this.setRequestData(this.postData.requestBody.formData);

                let url = this.apiUrl + '/api/v1/elements/' + element.id;

                let username = this.getFormUsername();
                let clearPassword = this.getFormPassword();
                let form_data = this.getFormData();

                element.username = username;
                element.password = this.encrypt(clearPassword, this.passphrase);
                element.form_data = JSON.stringify(form_data);

                var vm = this;

                axios.defaults.headers['Content-Type'] = 'application/vnd.api+json';
                axios.defaults.headers['Accept'] = 'application/vnd.api+json';

                axios({
                    method: 'patch',
                    url: url,
                    headers: {'api-key': this.apiKey},
                    data: JSON.stringify(element)
                }).then(function (response) {
                    window.localStorage.setItem('lastPostRequest', '');

                    // Close popup
                    vm.sendClosePopup();
                }).catch(function (error) {
                    // TODO handle error
                    console.log(error);
                });
            },

            /**
             * Close the Popup
             */
            close: function () {
                if (process.env.NODE_ENV === 'development') {
                    console.log('Dev environment close called');
                    return;
                }

                // Delete item
                window.localStorage.setItem('lastPostRequest', '');

                this.sendClosePopup();
            },

            /**
             * Save the new element
             */
            store: function () {
                if (process.env.NODE_ENV === 'development') {
                    console.log('In dev environment store called');
                    return;
                }

                this.setRequestData(this.postData.requestBody.formData);

                let username = this.getFormUsername();
                let clearPassword = this.getFormPassword();
                let form_data = this.getFormData();

                // TODO replace against world class
                let element = {
                    kind: 'website',

                    // Only host
                    title: this.url,

                    // Full URL
                    url: this.postData.url,
                    username: username,
                    password: this.encrypt(clearPassword, this.passphrase),
                    form_data: JSON.stringify(form_data),

                    status: 1
                };

                // Save to API
                console.log('Saving to API' + JSON.stringify(element));

                // Base URL (TODO move to const)
                let url = this.apiUrl + '/api/v1/elements';

                var vm = this;

                axios.defaults.headers['Content-Type'] = 'application/vnd.api+json';
                axios.defaults.headers['Accept'] = 'application/vnd.api+json';

                axios({
                    method: 'post',
                    url: url,
                    headers: {'api-key': this.apiKey},
                    data: JSON.stringify(element)
                }).then(function (response) {
                    window.localStorage.setItem('lastPostRequest', '');

                    // Close popup
                    vm.sendClosePopup();
                }).catch(function (error) {
                    // TODO handle error
                    console.log(error);
                });
            },

            sendClosePopup: function () {
                this.sendBrowserMessage({task: 'insertClose'});
            }
        },
        data() {
            return {
                // What login are we looking for?
                postData: JSON.parse(this.getSetting('lastPostRequest', '')),
                url: this.$route.params.url,

                elements: [],

                apiUrl: this.getSetting('apiUrl', ''),
                apiKey: this.getSetting('apiKey', ''),
                passphrase: this.getSetting('passphrase', '') || this.getSetting('temporary_passphrase'),

                isLoading: false,
            }
        }
    }
</script>

<style>
    #store {
        padding: 5px;
    }

    #list-elements {
        position: relative;
        overflow-y: scroll;
        overflow-x: hidden;
        min-height: 241px;
        padding: 0;
    }

    body {
        min-width: 200px !important;
    }

    #nowpass, body {
        width: 100%;
    }

    .list-group-item {
        padding: 0.5rem 0.75rem
    }
</style>