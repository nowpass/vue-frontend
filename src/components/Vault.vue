<template>
    <div id="vault">

        <div class="container-fluid text-left">
            <div id="header" class="text-left row">
                <div class="col-9">
                    <h3>
                        nowpass Password Manager -
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
                <div id="elements-header" class="list-group-item active">
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
                    <div v-for="element in elements"
                         class="single-element list-group-item"
                         v-bind:id="'element-' + element.id">
                        <div class="row info-element align-items-center" v-on:click="showElement(element)">
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
                                            <translate :word="'hide'"/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3" v-if="element.password === ''">
                                <translate :word="'no_password'"/>
                            </div>
                        </div><!--//Row -->

                        <div class="edit-element edit-row" v-if="element === editElement">
                            <div id="edit-element-container" class="col-12">
                                <div class="row align-items-center">
                                    <div class="col-6">
                                        <div class="form-group">
                                            <label for="title">
                                                <translate :word="'title'"/>
                                            </label>
                                            <input type="text" id="title" placeholder="Title" v-model="element.title"
                                                   class="form-control"/>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="form-group">
                                            <label for="url">
                                                <translate :word="'url'"/>
                                            </label>
                                            <input type="text" id="url" placeholder="https://" v-model="element.url"
                                                   class="form-control"/>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="form-group">
                                            <label for="username">
                                                <translate :word="'username'"/>
                                            </label>
                                            <input type="text" id="username" v-model="element.username"
                                                   class="form-control"/>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="form-group">
                                            <label>
                                                <translate :word="'password'"/>
                                            </label>
                                            <div class="input-group">
                                                <input v-bind:type="element.unlocked ? 'text' : 'password'"
                                                       v-model="element.clearPassword"
                                                       class="form-control" :disabled="!element.unlocked"/>

                                                <div class="input-group-append">
                                                    <button class="btn btn-default"
                                                            v-on:click.prevent="showGenerator(element)">
                                                        <translate :word="'generate_new'"/>
                                                    </button>
                                                    <button v-if="!element.unlocked" class="btn btn-primary"
                                                            v-on:click.prevent="showPassword(element)">
                                                        <translate :word="'show'"/>
                                                    </button>
                                                    <button v-if="element.unlocked" class="btn btn-primary"
                                                            v-on:click.prevent="hidePassword(element)">
                                                        <translate :word="'hide'"/>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-6">
                                        <label>
                                            <translate :word="'comment'"/>
                                        </label>
                                        <textarea v-model="element.comment" class="form-control"></textarea>
                                    </div>

                                    <div class="col-6">
                                        <div class="row">
                                            <div class="col-12" v-if="element.createdAt">
                                                <br/>
                                                <label>
                                                    <translate :word="'created_at'"/>
                                                </label>
                                                {{new Date(element.createdAt)}}
                                            </div>

                                            <div class="col-12" v-if="element.updatedAt">
                                                <label>
                                                    <translate :word="'updated_at'"/>
                                                </label>
                                                {{new Date(element.updatedAt)}}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <hr/>
                                    </div>

                                    <div class="col-12 text-right">
                                        <button class="btn btn-default" v-on:click="showElement(element)">
                                            <translate :word="'cancel'"/>
                                        </button>
                                        <button class="btn btn-primary" v-on:click="saveElement(element)">
                                            <translate :word="'save'"/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div><!-- //body-->

                <div id="elements-footer" class="text-center list-group-item active">
                    <div class="row align-items-center">
                        <div class="col-2 text-left">
                            <select v-model="limit" v-on:change="resetPage().loadElements()">
                                <option value="3">3</option>
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>

                        <div v-if="pages > 1" id="pagination" class="col-7">
                            <button v-if="currentPage > 1" v-on:click.prevent="goToPage(currentPage - 1)"
                                    class="btn btn-default btn-sm">
                                <
                            </button>
                            <button v-for="page in pages"
                                    v-bind:class="page === currentPage ? 'btn-success' : ''"
                                    v-on:click.prevent="goToPage(page)"
                                    class="btn btn-default btn-sm">
                                {{page}}
                            </button>
                            <button v-if="(currentPage) * limit < total" class="btn btn-default btn-sm"
                                    v-on:click.prevent="goToPage(currentPage + 1)">
                                >
                            </button>
                        </div>
                        <div class="col-3 text-right" v-bind:class="pages === 1 ? 'offset-sm-7' : ''">
                            <translate :word="'showing'"/>
                            {{elements.length}} / {{total}}
                        </div>
                    </div>
                </div>
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
                                <!-- For later -->
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
                    <login :element="newElement"></login>
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

    </div><!-- //App -->
</template>

<script>
    // Components
    import Login from './Login';
    import translate from './Translate'
    import Unlock from './Unlock'
    import LoginFirst from "./LoginFirst";

    // 3rd party
    import axios from 'axios'
    import Icon from 'vue-awesome/components/Icon'
    import dropdown from 'vue-my-dropdown';

    // Mixins
    import settings from '../mixins/settings';
    import decrypt from '../mixins/decrypt'

    // Font Awesome icons
    import 'vue-awesome/icons/user-circle'
    import 'vue-awesome/icons/refresh'
    import 'vue-awesome/icons/sort'
    import 'vue-awesome/icons/plus-circle'
    import 'vue-awesome/icons/spinner'
    import Loading from "./Loading";

    /**
     * Main Management for Elements (except Notes)
     */
    export default {
        name: 'nowpass',
        components: {
            Loading,
            LoginFirst,
            Icon,
            dropdown,
            translate,
            Login,
            Unlock
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
             * Load the Elements into the table (promise) - API key needs to be set
             */
            loadElements: function () {
                this.toggleLoading();

                // Base URL (TODO move to mixin const)
                let url = this.apiUrl + '/api/v1/elements';

                let parts = [];

                // Filter Search
                if (this.filterSearch !== '') {
                    parts.push('search=' + this.filterSearch);
                }

                // Add Ordering
                parts.push('order_by=' + this.orderByValue + ' ' + (this.orderByASC ? 'ASC' : 'DESC'));

                // Limit / Ofset
                parts.push('offset=' + this.offset);
                parts.push('limit=' + this.limit);

                // Build URL (TODO optimize)
                for (let i = 0; i < parts.length; i++) {
                    let glue = (i === 0) ? '?' : '&';

                    url += glue + parts[i];
                }

                // Encode possible special chars
                url = encodeURI(url);

                // Query complete
                console.log('Querying ' + url);

                // Reference
                var vm = this;

                axios({
                    method: 'get',
                    url: url,
                    headers: {'api-key': this.apiKey},
                }).then(function (response) {
                    vm.elements = response.data['elements'];
                    vm.total = parseInt(response.data['total']);

                    vm.calculatePages();
                    vm.toggleLoading();
                }).catch(function (error) {
                    console.log(error);

                    // Redirect
                    vm.$router.push('/Options');
                });
            },

            /**
             * Save an element
             * @param saveElement
             */
            saveElement: function (saveElement) {
                if (!this.passphrase) {
                    this.showUnlock = true;
                    this.unlockElement = null;
                    this.unlockTask = '';
                    return;
                }

                // Clone element, as we have to delete things (like clear text password)
                let element = JSON.parse(JSON.stringify(saveElement));

                let method = 'post';

                // Base URL (TODO move to const)
                let url = this.apiUrl + '/api/v1/elements';

                // Update
                if (element.id) {
                    method = 'patch';
                    url = url + '/' + element.id;
                }

                // Let's make sure the password is encrypted..
                if (element.clearPassword) {
                    element.password = this.encrypt(element.clearPassword, this.passphrase);
                }

                delete(element.clearPassword);
                delete(element.unlocked);

                // Make sure no spaces are left
                element.title = element.title.trim();

                // Reference
                var vm = this;

                axios.defaults.headers['Content-Type'] = 'application/vnd.api+json';
                axios.defaults.headers['Accept'] = 'application/vnd.api+json';

                axios({
                    method: method,
                    url: url,
                    headers: {'api-key': this.apiKey},
                    data: JSON.stringify(element)
                }).then(function (response) {
                    // Trigger reload
                    vm.newElement = {};
                    vm.isShowNewLogin = false;

                    vm.loadElements();
                }).catch(function (error) {
                    // TODO handle error
                    console.log(error);
                });
            },

            /**
             * Calculate amount of pages
             */
            calculatePages: function () {
                if (this.total === 0) {
                    this.pages = 1;
                }

                this.pages = Math.ceil(this.total / this.limit);
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
                this.generatedPassword = this.generatePassword();
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
                this.generatedPassword = this.generatePassword();
            },

            /**
             * Generate a random (using window.crypto function of the browser) password with the given settings
             * @returns {string}
             */
            generatePassword: function () {
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
                    title: 'New Element',
                    url: 'https://',
                    username: '',
                    password: '',
                    unlocked: true,
                    clearPassword: this.generatePassword(),
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
            }
        },
        data() {
            return {
                apiUrl: this.getSetting('apiUrl', ''),
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

                pages: 1,
                currentPage: 1,

                countElements: 0,
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
        color: #fff;
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
        background: #f1f1f1;
        border-radius: 5px;
        padding: 5px;
    }

    #edit-element-container {
        background: #f1f1f1;
        padding: 10px;
    }
</style>
