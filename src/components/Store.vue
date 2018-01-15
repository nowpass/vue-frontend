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
    import loading from './parts/Loading'

    // Mixins
    import settings from '../mixins/settings'
    import decrypt from '../mixins/decrypt'
    import formparse from '../mixins/formparse'
    import chrome from '../mixins/chrome'

    // Modules
    import ApiElements from '../modules/api-elements'

    // 3rd party
    import Icon from 'vue-awesome/components/Icon'

    /**
     * Insert popup (in iframe in the site, calling chrome methods)
     */
    export default {
        name: "store",
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

            this.loadElements();
        },
        methods: {

            /**
             * Trigger loading the Elements into the table (promise) - API key needs to be set
             */
            loadElements() {
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
                window.localStorage.setItem('lastPostRequest', '');

                console.log("Error loading elements: " + JSON.stringify(error));

                // TODO show notification
                if (error.status) {
                    this.errorMsg = error.response.status + ' ' + error.response.statusText;

                    return;
                }

                this.errorMsg = 'Unknown Error - check your connection!';
            },


            /**
             * Update an element
             *
             * @param element {object}
             */
            update(element) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('In dev environment update called');
                    return;
                }

                this.toggleLoading();

                this.setRequestData(this.postData.requestBody.formData);

                let username = this.getFormUsername();
                let clearPassword = this.getFormPassword();
                let form_data = this.getFormData();

                element.username = username;
                element.password = this.encrypt(clearPassword, this.passphrase);
                element.form_data = JSON.stringify(form_data);


                this.apiElements.store(element, this.resolveSaveElement, this.failSaveElement);
            },

            /**
             *  Resolve the saving of an element (e.g. close popup and reset it)
             */
            resolveSaveElement(response) {
                window.localStorage.setItem('lastPostRequest', '');

                this.sendClosePopup();
            },

            /**
             *  Error handling for failed saving
             */
            failSaveElement(error) {
                console.log("Error saving elements: " + JSON.stringify(error));

                // TODO show notification
                if (error.status) {
                    this.errorMsg = error.response.status + ' ' + error.response.statusText;

                    return;
                }

                this.errorMsg = 'Unknown Error - check your connection!';

                window.localStorage.setItem('lastPostRequest', '');
            },

            /**
             * Close the Popup
             */
            close() {
                if (process.env.NODE_ENV === 'development') {
                    return;
                }

                // Delete item
                window.localStorage.setItem('lastPostRequest', '');

                this.sendClosePopup();
            },

            /**
             * Save the new element
             */
            store() {
                if (process.env.NODE_ENV === 'development') {
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

                this.apiElements.store(element, this.resolveSaveElement, this.failSaveElement);
            },

            /**
             * Close Popup
             */
            sendClosePopup() {
                if (process.env.NODE_ENV === 'development') {
                    return;
                }

                this.sendBrowserMessage({task: 'storeClose'});
            },

            /**
             * Toggle Loading dialog
             */
            toggleLoading() {
                this.isLoading = !this.isLoading;
            }
        },
        data() {
            return {
                apiElements: new ApiElements(this.getSetting('apiUrl', ''), this.getSetting('apiKey', '')),

                // What login are we looking for?
                postData: JSON.parse(this.getSetting('lastPostRequest', '')),
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

    .list-group-item {
        padding: 0.5rem 0.75rem
    }
</style>