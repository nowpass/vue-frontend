<template>
    <div id="insert">
        <div class="list-group">
            <div class="list-group-item">
                <h4>
                    <translate v-once :word="'elements_for'"/>
                    {{url}}
                </h4>
            </div>
            <div id="list-elements" class="list-group-item">
                <div v-for="element in elements" class="list-group-item list-group-item-action"
                     v-on:click.prevent="insert(element)">
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
            <div class="list-group-item list-group-item-action text-right" v-on:click.prevent="close()">
                <translate v-once :word="'close'"/>
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
    import chrome from "../mixins/chrome";

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
        mixins: [settings, decrypt, chrome],
        created() {
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
             * Insert an element into the website
             *
             * @param element {object}
             */
            insert: function (element) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('In DEV environment');
                    return;
                }

                let message = {
                    task: 'insert',
                    login: {
                        host: this.url,
                        form_data: element.form_data,
                        username: element.username,
                        password: this.decrypt(element.password, this.passphrase)
                    }
                };

                this.sendBrowserMessage(message);
            },

            /**
             * Close the Popup
             */
            close: function () {
                if (process.env.NODE_ENV === 'development') {
                    console.log('In DEV environment');
                    return;
                }

                this.sendBrowserMessage({task: 'insertClose'});
            }
        },
        data() {
            return {
                // What login are we looking for?
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
    #insert {
        padding: 5px;
    }

    #list-elements {
        position: relative;
        overflow-y: scroll;
        overflow-x: hidden;
        min-height: 255px;
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