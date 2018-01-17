<template>
    <div id="popup">
        <div class="list-group">
            <div class="list-group-item list-group-item-light">
                <input type="text" placeholder="Search" v-model="filterSearch" class="form-control"
                       v-on:keyup="searchElements()"/>
            </div>
        </div>
        <div v-if="errorMsg" class="alert alert-warning">
            <h3>
                <translate v-once :word="'error_loading_results'"/>
            </h3>
            {{errorMsg}}
        </div>

        <div v-if="filterSearch" class="list-group-item">
            <div v-for="element in elements" class="list-group-item">
                <div class="row align-items-center">
                    <div class="col-7">
                        <h3>{{element.title}}</h3>
                        <small>{{element.url.substr(0, 30)}}</small>
                    </div>
                    <div class="col-5 text-right" v-if="element.password">
                        <button class="btn btn-default" v-on:click.prevent="copyPassword(element)">
                            <translate :word="'copy_password'"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="list-group-item align-self-center">
            <router-link to="/" target="_blank">
                <icon name="unlock-alt"></icon>
                <translate v-once :word="'my_vault'"/>
            </router-link>
        </div>
        <div class="list-group-item">
            <router-link to="/notes" target="_blank">
                <icon name="sticky-note-o"></icon>
                <translate v-once :word="'my_notes'"/>
            </router-link>
        </div>
        <div class="list-group-item">
            <router-link to="/generate">
                <icon name="random"></icon>
                <translate v-once :word="'generate_password'"/>
            </router-link>
        </div>
        <div class="list-group-item">
            <a href="https://nowpass.org/help" target="_blank">
                <icon name="question-circle"></icon>
                <translate v-once :word="'help'"/>
            </a>
        </div>
        <div class="list-group-item">
            <router-link to="/options" target="_blank">
                <icon name="cog"></icon>
                <translate v-once :word="'options'"/>
            </router-link>
        </div>
        <div class="list-group-item list-group-item-light">
            <router-link to="/logout" target="_blank">
                <icon name="sign-out"></icon>
                <translate v-once :word="'logout'"/>
            </router-link>
        </div>

        <div v-if="showUnlock">
            <unlock v-on:update_passphrase="updatePassphrase" :element="activeElement"></unlock>
        </div>

        <div v-if="showLoginFirst">
            <login-first></login-first>
        </div>

        <div v-if="isLoading">
            <loading v-once></loading>
        </div>
    </div><!-- //popup -->
</template>

<script>
    // Components
    import translate from './helpers/Translate'
    import Unlock from './Unlock'
    import LoginFirst from "./parts/LoginFirst";
    import loading from './parts/Loading'

    // Mixins
    import settings from '../mixins/settings'
    import decrypt from '../mixins/decrypt'

    // Modules
    import ApiElements from '../modules/api-elements'

    // 3rd party
    import Icon from 'vue-awesome/components/Icon'
    import debounce from 'lodash/debounce'

    // Icons Font-Awesome
    import 'vue-awesome/icons/cog'
    import 'vue-awesome/icons/question-circle'
    import 'vue-awesome/icons/sign-out'
    import 'vue-awesome/icons/random'
    import 'vue-awesome/icons/sticky-note-o'
    import 'vue-awesome/icons/unlock-alt'

    /**
     * View for the extension popup
     */
    export default {
        name: "popup",
        components: {
            LoginFirst,
            translate,
            loading,
            Unlock,
            Icon
        },
        mixins: [settings, decrypt],
        created() {
            // Make sure user is logged in :-)
            if (this.apiKey !== '') {
                this.showLoginFirst = false;
            }
        },
        methods: {
            /**
             * Search for elements
             */
            searchElements: debounce(function () {
                this.errorMsg = '';

                // Reset
                if (this.filterSearch === '') {
                    this.elements = [];
                    return;
                }

                this.toggleLoading();

                let filters = {
                    search: this.filterSearch,
                    order_by: 'id DESC', // newest first
                    offset: 0,
                    limit: 50,
                    pw_only: true
                };

                this.apiElements.load(filters, this.resolveElements, this.failElements)
            }, 300),

            resolveElements(result) {
                this.elements = result.data['elements'];

                this.toggleLoading();
            },

            /**
             * Fail for load Elements
             */
            failElements(error) {
                console.log("Error loading elements: " + JSON.stringify(error));

                 // TODO
            },

            /**
             * Copy Password
             * @param element {object}
             */
            copyPassword(element) {
                if (!this.passphrase) {
                    this.activeElement = element;
                    this.showUnlock = true;
                    return;
                }

                if (!element.clearPassword) {
                    element.clearPassword = this.decrypt(element.password, this.passphrase)
                }

                // Works on current Chromium
                document.oncopy = function (event) {
                    event.clipboardData.setData("Text", element.clearPassword);
                    event.preventDefault();
                };

                document.execCommand("Copy");
                document.oncopy = undefined;
            },

            /**
             * Update the passphrase
             * @param passphrase {string}
             * @param activeElement
             */
            updatePassphrase(passphrase, activeElement) {
                this.showUnlock = false;

                if (passphrase === '') {
                    return;
                }

                this.passphrase = passphrase;

                if (activeElement == null) {
                    return;
                }

                if (this.activeTask === 'copy') {
                    this.copyPassword(activeElement);

                    return;
                }
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
                apiKey: this.getSetting('apiKey', ''),
                passphrase: this.getPassphrase(),
                showUnlock: false,

                elements: [],
                activeElement: null,
                activeTask: 'copy',

                filterSearch: '',
                errorMsg: '',
                showLoginFirst: true,

                isLoading: false,
            }
        }
    }
</script>

<style scoped>
    #popup {
        min-width: 400px;
    }

    .fa-icon {
        padding-top: 3px !important;
        margin-right: 6px;
    }
</style>