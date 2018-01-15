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
                <button class="btn btn-default"><translate v-once :word="'close'"/></button>
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
    import loading from './parts/Loading'

    // Mixins
    import settings from '../mixins/settings'
    import decrypt from '../mixins/decrypt'
    import chrome from "../mixins/chrome";

    // Modules
    import ApiElements from '../modules/api-elements'

    // 3rd party
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
             * Load the elements for this site
             */
            load: function () {
                this.toggleLoading();

                let filters = {
                    filterSearch: this.url,
                    orderBy: 'id DESC', // newest first
                    offset: 0,
                    limit: 50,
                    pwOnly: true
                };

                this.apiElements.load(filters, this.resolveElements, this.failElements)
            },

            /**
             * Resolve the response for load Elements
             */
            resolveElements(response) {
                this.elements = response.data['elements'];

                this.toggleLoading();
            },

            /**
             * Fail for load Elements
             */
            failElements(error) {
                console.log("Error loading elements: " + JSON.stringify(error));

                // TODO show notification
                if (error.status) {
                    this.errorMsg = error.response.status + ' ' + error.response.statusText;

                    return;
                }

                this.errorMsg = 'Unknown Error - check your connection!';
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
            },

            /**
             * Toggle Loading dialog
             */
            toggleLoading() {
                this.isLoading = !this.isLoading;
            },
        },
        data() {
            return {
                apiElements: new ApiElements(this.getSetting('apiUrl', ''), this.getSetting('apiKey', '')),

                // What login are we looking for?
                url: this.$route.params.url,
                elements: [],

                apiKey: this.getSetting('apiKey', ''),
                passphrase: this.getPassphrase(),

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