<template>
    <div id="vault">

        <div class="container-fluid text-left">
            <div id="header" class="text-left row">
                <div class="col-9">
                    <h3>
                        <translate v-once :word="'vault'"/>
                    </h3>
                </div>
                <div class="col-3 text-right">
                    <!-- TODO Add debounce -->
                    <input type="text" placeholder="Search" v-model="filterSearch" class="form-control"
                           v-on:keyup="resetPage().loadElements()"/>
                </div>
            </div>

            <div id="elements" class="list-group">
                <div id="elements-header" class="list-group-item">
                    <div class="row align-items-center">
                        <div class="col-md-1">
                        </div>
                        <div class="col-md-3">
                            <a href="#" v-on:click.prevent="orderBy('title')">
                                <translate v-once :word="'title'"/>
                                <icon name="sort"></icon>
                            </a>
                        </div>
                        <div class="col-md-3">
                            <a href="#" v-on:click.prevent="orderBy('url')">
                                <translate v-once :word="'url'"/>
                                <icon name="sort"></icon>
                            </a>
                        </div>
                        <div class="col-md-2">
                            <a href="#" v-on:click.prevent="orderBy('username')">
                                <translate v-once :word="'username'"/>
                                <icon name="sort"></icon>
                            </a>
                        </div>
                        <div class="col-md-3">
                            <translate v-once :word="'password'"/>
                        </div>
                    </div>
                </div>

                <div id="elements-body">
                    <div v-if="elements.length === 0" class="list-group-item">
                        <translate v-once :word="'no_elements'"/>
                    </div>

                    <div v-for="element in elements"
                         class="single-element list-group-item"
                         v-bind:id="'element-' + element.id">
                        <div class="row info-element align-items-center" v-on:click="showElement(element)" v-on:contextmenu.prevent="$refs.elementContextMenu.open($event, {element: element})">
                            <div class="col-md-1">
                                <icon v-bind:name="iconMapping[element.kind]"></icon>
                            </div>

                            <div class="col-md-3">
                                {{element.title}}
                            </div>

                            <div class="col-md-3">
                                <a v-bind:href="element.url" target="_blank">{{element.url}}</a>
                            </div>

                            <div class="col-md-2">
                                {{element.username}}
                            </div>

                            <div class="col-md-3" v-if="element.password !== '' || element.clearPassword != ''">
                                <div class="input-group">
                                    <input v-bind:type="element.unlocked ? 'text' : 'password'"
                                           v-model="element.clearPassword"
                                           class="form-control" v-on:click.prevent.stop=""/>
                                    <div class="input-group-append">
                                        <button v-if="!element.unlocked" class="btn btn-primary"
                                                v-on:click.stop.prevent="showPassword(element)">
                                            <translate :word="'show'"/>
                                        </button>
                                        <button v-if="element.unlocked" class="btn btn-primary"
                                                v-on:click.stop.prevent="hidePassword(element)">
                                            Hide
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3" v-if="element.password === ''">
                                <translate :word="'no_password'"/>
                            </div>
                        </div><!--//Row -->

                        <div class="edit-element edit-row" v-if="element === editElement">
                            <login :element="element" :isNew="false" v-on:storeLogin="saveElement" v-on:cancelEditLogin="showElement"></login>
                        </div>
                    </div>
                </div><!-- //body-->

                <pagination :limit="limit" :currentPage="currentPage" :itemsLength="elements.length" :itemsTotal="total"
                            v-on:changeLimit="changeLimit" v-on:changeCurrentPage="goToPage"/>


            </div><!-- //Elements -->

            <div id="element-create">
                <div class="text-right">
                    <dropdown :visible="dropdownElementVisible" :position="dropdownPosition"
                              @clickout="dropdownElementVisible = false">
                        <span class="link" @click="dropdownElementVisible = true">
                            <icon name="plus-circle" scale="3"></icon>
                        </span>
                        <div class="dialog" slot="dropdown">
                            <div class="list-group text-center">
                                <button class="btn btn-default list-group-item list-group-item-action"
                                        v-on:click="dropdownElementVisible = false;showNewLogin()">
                                    <icon name="user-circle"></icon>
                                    <translate :word="'new_login'"/>
                                </button>
                                <!-- Later -->
                                <!--
                                <button class="btn btn-default list-group-item list-group-item-action">
                                  Mail-Account
                                </button>
                                <button class="btn btn-default list-group-item list-group-item-action">
                                  Server
                                </button>
                                <button class="btn btn-default list-group-item list-group-item-action">
                                  Identity
                                </button>
                                -->
                            </div>
                        </div>
                    </dropdown>
                </div>

                <div id="login-new" v-if="isShowNewLogin">
                    <login :element="newElement" :isNew="true" v-on:storeLogin="saveElement" v-on:cancelEditLogin="showElement"></login>
                </div>
            </div>

        </div> <!-- //Container -->

        <div v-if="showUnlock">
            <unlock v-on:update_passphrase="updatePassphrase" :element="unlockElement" :task="unlockTask"></unlock>
        </div>

        <div id="popup-generator" class="now-modal now-fade" v-bind:class="isGeneratorPopupActive ? '' : 'invisible'">
            <div class="now-modal-inner">
                <div class="now-modal-title">
                    <h4>
                        <translate :word="'password_generator'"/>
                    </h4>
                </div>
                <div class="now-modal-body">
                    <div class="form-group">
                        <label for="generator-password">
                            <translate :word="'password'"/>
                            :</label>
                        <div class="input-group">
                            <input type="text" id="generator-password" class="form-control"
                                   v-model.trim="generatedPassword"/>
                            <div class="input-group-append">
                                <button class="btn btn-default" v-on:click="setGeneratedPassword()">
                                    <icon name="refresh"></icon>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <input id="generator-numbers" type="checkbox" v-model="generatorNumbers"/>
                        <label for="generator-numbers">
                            <translate :word="'numbers'"/>
                            (0-9)</label>
                    </div>

                    <div class="form-group">
                        <input id="generator-special" type="checkbox" v-model="generatorSpecial"/>
                        <label for="generator-special">
                            <translate :word="'special_characters'"/>
                        </label>
                    </div>

                    <div class="form-group">
                        <label for="generator-length">
                            <translate :word="'password_length'"/>
                            :</label>
                        <div class="input-group">
                            <input type="range" id="generator-length" v-model="generatorLength" min="1" max="50"
                                   class="form-control">
                            <div class="input-group-append">
                                <button class="btn btn-default">{{generatorLength}}</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="now-modal-footer text-center">
                    <div class="form-group">
                        <button class="btn btn-default" v-on:click.prevent="hideGenerator()">
                            <translate :word="'cancel'"/>
                        </button>
                        <button class="btn btn-primary" v-on:click.prevent="usePassword(generatorElement)">
                            <translate :word="'use_password'"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="isLoading">
            <loading v-once></loading>
        </div>

        <div v-if="showLoginFirst">
            <login-first v-once></login-first>
        </div>

        <context-menu id="element-context" ref="elementContextMenu" @ctx-open="onElementContextMenu"  @ctx-cancel="resetElementContextMenu">
            <li v-on:click="deleteElement($event, menuData)">
                <translate :word="'delete_element'"/>
            </li>
            <li>
                <translate :word="'duplicate_element'"/>
            </li>
        </context-menu>

    </div><!-- //App -->
</template>

<script>
    // Components
    import Login from './parts/LoginEdit';
    import translate from './helpers/Translate'
    import Unlock from './Unlock'
    import LoginFirst from "./LoginFirst";

    // 3rd party
    import axios from 'axios'
    import Icon from 'vue-awesome/components/Icon'
    import dropdown from 'vue-my-dropdown';
    import contextMenu from 'vue-context-menu'

    // Mixins
    import settings from '../mixins/settings';
    import decrypt from '../mixins/decrypt'

    // Modules
    import ApiElements from '../modules/api-elements'

    // Font Awesome icons
    import 'vue-awesome/icons/user-circle'
    import 'vue-awesome/icons/refresh'
    import 'vue-awesome/icons/sort'
    import 'vue-awesome/icons/plus-circle'
    import 'vue-awesome/icons/spinner'
    import Loading from "./Loading";
    import Pagination from "./parts/Pagination";

    /**
     * Main Management for Elements (except Notes)
     */
    export default {
        name: 'nowpass',
        components: {
            Pagination,
            Loading,
            LoginFirst,
            dropdown,
            translate,
            Login,
            Unlock,
            // 3rd party
            Icon,
            contextMenu
        },
        mixins: [settings, decrypt],
        /**
         * Called on Vue create, resets passhrase, loads Elements and set the generated count
         */
        created() {
            if (!this.apiKey) {
                this.showLoginFirst = true;
                return;
            }
            this.loadElements();
            this.setGeneratedPassword();
        },
        methods: {
            /**
             * Trigger loading the Elements into the table (promise) - API key needs to be set
             */
            loadElements: function () {
                this.toggleLoading();

                let filters = {
                    filterSearch: this.filterSearch,
                    orderBy: this.orderByValue + ' ' + (this.orderByASC ? 'ASC' : 'DESC'),
                    offset: this.offset,
                    limit: this.limit
                };

                this.apiElements.load(filters, this.resolveElements, this.failElements)
            },

            /**
             * Resolve the response for load Elements
             */
            resolveElements: function (response) {
                this.elements = response.data['elements'];
                this.total = parseInt(response.data['total']);

                this.toggleLoading();
            },

            /**
             * Fail for load Elements
             */
            failElements: function (error) {
                console.log("Error loading elements: " + JSON.stringify(error));

                // TODO show notification

                if (error.response && error.response.status === 401) {
                    this.$router.push('/options');
                }

                // Redirect to test api
                this.$router.push('/options');
            },

            /**
             * Store an element
             */
            saveElement: function (saveElement) {
                if (!this.passphrase) {
                    this.showUnlock = true;
                    this.unlockElement = null;
                    this.unlockTask = '';
                    return;
                }

                // Let's make sure the password is encrypted.. TODO check if that causes unwanted changes
                if (saveElement.clearPassword) {
                    saveElement.password = this.encrypt(saveElement.clearPassword, this.passphrase);
                }

                this.apiElements.store(saveElement, this.resolveSaveElement, this.failSaveElement)
            },

            /**
             *  Resolve the saving of an element (e.g. trigger reload)
             */
            resolveSaveElement(response) {
                this.newElement = {};
                this.isShowNewLogin = false;

                this.loadElements();
            },

            /**
             *  Error handling for failed saving
             */
            failSaveElement(error) {
                // TODO handle error
                console.log(error);
            },

            /**
             * Go to page
             * @param page {number}
             */
            goToPage: function (page) {
                this.offset = (page - 1) * this.limit;
                this.currentPage = page;
                this.loadElements();
            },

            /**
             * Change the limit and trigger reload
             *
             * @param limit {number}
             */
            changeLimit: function (limit) {
                this.limit = limit;
                this.resetPage();
                this.loadElements();
            },

            /**
             * Reset page (e.g. return to first page and set Offset to zero)
             * @returns this {methods}
             */
            resetPage: function () {
                this.offset = 0;
                this.currentPage = 1;

                return this;
            },

            /**
             * Toggle Loading dialog
             */
            toggleLoading: function () {
                this.isLoading = !this.isLoading;
            },

            /**
             * Show / Edit given element
             * @param element {object}
             */
            showElement: function (element) {
                if (this.newElement === element) {
                    this.newElement = {};
                    this.isShowNewLogin = false;
                    return;
                }

                if (this.editElement === element) {
                    this.editElement = null;
                    return;
                }

                this.editElement = element;
            },

            /**
             * Show password
             * @param element {object}
             */
            showPassword: function (element) {
                // Let's unlock that and save passphrase in state (if wanted)
                if (!this.passphrase) {
                    this.showUnlock = true;
                    this.unlockTask = 'password';
                    this.unlockElement = element;
                    return;
                }

                let password = this.decrypt(element.password, this.passphrase);

                // TODO remove
                console.log('Unlocked password ' + password);

                element.unlocked = true;
                element.clearPassword = password;

                // Hack for dev, so element gets update
                element.title += ' ';
            },

            /**
             * Hide password
             * @param element
             */
            hidePassword: function (element) {
                element.unlocked = false;
                element.title = element.title.trim();
            },

            /**
             * Set the ordering of the passwords (db query, e.g. triggers a reload)
             * @param orderBy {string}
             */
            orderBy: function (orderBy) {
                if (this.orderByValue === orderBy) {
                    // We already order that way, let's switch ASC / DESC
                    this.orderByASC = !this.orderByASC;
                } else {
                    this.orderByASC = true;
                    this.orderByValue = orderBy;
                }

                // Reset Pagination
                this.resetPage();

                this.loadElements();
            },

            /**
             * Show the password generator
             * @param element {object}
             */
            showGenerator: function (element) {
                if (!this.passphrase) {
                    this.unlockElement = element;
                    this.unlockTask = 'generator';
                    this.showUnlock = true;

                    return;
                }

                this.generatorElement = element;
                this.isGeneratorPopupActive = true;

                // Generate a new password
                this.generatedPassword = this.getGeneratePassword();
            },

            /**
             * Hide the generator and reset generated password etc.
             */
            hideGenerator: function () {
                this.generatedPassword = null;
                this.generatorElement = null;
                this.isGeneratorPopupActive = false;
            },

            /**
             * Inserts the password into the given element (both encrypted and unecrypted)
             * @param element {object}
             */
            usePassword: function (element) {
                element.password = this.encrypt(this.generatedPassword, this.passphrase);
                element.clearPassword = this.generatedPassword;
                element.unlocked = true;

                this.hideGenerator();
            },

            /**
             * Set the generated password
             */
            setGeneratedPassword: function () {
                this.generatedPassword = this.getGeneratePassword();
            },

            /**
             * Generate a random (using window.crypto function of the browser) password with the given settings
             * @returns {string}
             */
            getGeneratePassword: function () {
                let password = '';
                let chars = this.LOWER_CHARS + this.UPPER_CHARS;

                if (this.generatorNumbers) {
                    chars += this.NUMBERS;
                }

                if (this.generatorSpecial) {
                    chars += this.SPECIAL;
                }

                // Let's use the crypto Browser API
                let crypto = window.crypto || window.msCrypto; // for IE 11
                let randomNumbers = new Uint8Array(this.generatorLength);

                // Get a set of random numbers (0-255)
                crypto.getRandomValues(randomNumbers);

                for (let i = 0; i < this.generatorLength; i++) {
                    password += chars.charAt(Math.floor((randomNumbers[i] / 256) * chars.length));
                }

                return password;
            },

            /**
             * Show the new login
             */
            showNewLogin: function () {
                this.newElement = {
                    title: '',
                    url: '',
                    username: '',
                    password: '',
                    unlocked: true,
                    clearPassword: this.getGeneratePassword(),
                    comment: ''
                };

                this.isShowNewLogin = true;
            },

            /**
             * Update the passphrase
             * @param passphrase
             * @param activeElement
             * @param task
             */
            updatePassphrase: function (passphrase, activeElement, task) {
                this.showUnlock = false;

                if (!passphrase) {
                    return;
                }

                this.passphrase = passphrase;

                console.log(passphrase);
                console.log(activeElement);
                console.log(task);

                if (activeElement == null) {
                    return;
                }

                if (task === 'password') {
                    this.showPassword(activeElement);
                    return;
                }

                // Return
                this.showGenerator(activeElement);
            },

            deleteElement(evt, data) {
                this.apiElements.delete(data.element.id, (result) => {this.loadElements()}, (error) => {console.log(error)})
            },

            // Context menu
            onElementContextMenu(locals) {
                this.menuData = locals
            },

            resetElementContextMenu() {
                this.menuData = null;
            },

        },
        data() {
            return {
                apiElements: new ApiElements(this.getSetting('apiUrl', ''), this.getSetting('apiKey', '')),
                apiKey: this.getSetting('apiKey', ''),
                showLoginFirst: false,

                // Elements
                elementToUnlock: null,
                elementToGenerate: null,
                elements: [],

                // Pagination and Filter
                offset: 0,
                limit: 20,
                total: 0,
                currentPage: 1,

                // Search and Ordering
                filterSearch: '',
                orderByASC: false,
                orderByValue: 'id',

                // Edit
                editElement: null,

                // Icons
                iconMapping: {
                    website: 'user-circle',
                    mail: 'envelope-o',
                    server: 'server',
                    identity: 'address-card-o'
                },

                // New
                dropdownElementVisible: false,
                dropdownPosition: ["left", "center", "right", "top"],
                newElement: {},

                isShowNewLogin: false,

                // Loading Dialog
                isLoading: false,

                // Passphrase Popup
                showUnlock: false,
                unlockElement: null,
                unlockTask: '',

                // Check if we have a passphrase or temporary one
                passphrase: this.getSetting('passphrase', '') || this.getSetting('temporary_passphrase'),

                // Generator Popup
                isGeneratorPopupActive: false,
                generatedPassword: '',
                generatorNumbers: true,
                generatorSpecial: true,
                generatorLength: 13,

                generatorElement: null,

                // TODO move to constant export
                LOWER_CHARS: 'abcdefghijklmnopqrstuvwxyz',
                UPPER_CHARS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                NUMBERS: '0123456789',
                SPECIAL: '!"§$&(/)=?@\'+-*#,\\.-_'
            }
        }
    }

</script>

<style>
    #elements-header a {
    }

    .edit-element {
        border-top: 1px solid #ccc;
        margin-top: 8px;
    }

    .info-element {
        cursor: pointer;
    }

    .dialog {
        z-index: 9;
    }

    .edit-row {
        margin-left: -1.25rem;
        margin-right: -1.25rem;
    }

    #login-new {
        background: #fff;
        padding: 5px;
        border: 1px solid #ccc;
        margin-bottom: 15px;
    }

    #edit-element-container {
        background: #f9f9f9;
        padding: 10px;
        margin-bottom: -0.75rem;
    }
</style>
