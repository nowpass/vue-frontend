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
                    <input type="text" placeholder="Search" v-model="filterSearch" class="form-control"
                           v-on:keyup="searchElements()"/>
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
                        <div class="row info-element align-items-center" v-on:click="showElement(element)"
                             v-on:contextmenu.prevent="$refs.elementContextMenu.open($event, {element: element})">
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
                            <login :element="element" :isNew="false" v-on:storeLogin="saveElement"
                                   v-on:cancelEditLogin="showElement"></login>
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
                    <login :element="newElement" :isNew="true" v-on:storeLogin="saveElement"
                           v-on:cancelEditLogin="showElement"></login>
                </div>
            </div>

        </div> <!-- //Container -->

        <div v-if="showUnlock">
            <unlock v-on:update_passphrase="updatePassphrase" :element="unlockElement" :task="unlockTask"></unlock>
        </div>

        <generate v-if="isGeneratorPopupActive" :element="generatorElement" v-on:closeGenerator="hideGenerator" v-on:useGenerated="useGeneratedPassword"></generate>

        <div v-if="isLoading">
            <loading v-once></loading>
        </div>

        <div v-if="showLoginFirst">
            <login-first v-once></login-first>
        </div>

        <context-menu id="element-context" ref="elementContextMenu" @ctx-open="onElementContextMenu"
                      @ctx-cancel="resetElementContextMenu">
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
    import LoginFirst from "./parts/LoginFirst";

    // Mixins
    import settings from '../mixins/settings';
    import decrypt from '../mixins/decrypt'

    // Modules
    import ApiElements from '../modules/api-elements'

    // 3rd party
    import Icon from 'vue-awesome/components/Icon'
    import dropdown from 'vue-my-dropdown'
    import contextMenu from 'vue-context-menu'
    import debounce from 'lodash/debounce'

    // Font Awesome icons
    import 'vue-awesome/icons/user-circle'
    import 'vue-awesome/icons/refresh'
    import 'vue-awesome/icons/sort'
    import 'vue-awesome/icons/plus-circle'
    import 'vue-awesome/icons/spinner'
    import Loading from "./parts/Loading";
    import Pagination from "./parts/Pagination";
    import Generate from "./Generate";

    /**
     * Main Management for Elements (except Notes)
     */
    export default {
        name: 'nowpass',
        components: {
            Generate,
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
            resolveElements(response) {
                this.elements = response.data['elements'];
                this.total = parseInt(response.data['total']);

                this.toggleLoading();
            },

            /**
             * Fail for load Elements
             */
            failElements(error) {
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
            saveElement(saveElement) {
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
            goToPage(page) {
                this.offset = (page - 1) * this.limit;
                this.currentPage = page;
                this.loadElements();
            },

            /**
             * Change the limit and trigger reload
             *
             * @param limit {number}
             */
            changeLimit(limit) {
                this.limit = limit;
                this.resetPage();
                this.loadElements();
            },

            /**
             * Reset page (e.g. return to first page and set Offset to zero)
             * @returns this {methods}
             */
            resetPage() {
                this.offset = 0;
                this.currentPage = 1;

                return this;
            },

            /**
             * Toggle Loading dialog
             */
            toggleLoading() {
                this.isLoading = !this.isLoading;
            },

            /**
             * Show / Edit given element
             * @param element {object}
             */
            showElement(element) {
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
            showPassword(element) {
                // Let's unlock that and save passphrase in state (if wanted)
                if (!this.passphrase) {
                    this.showUnlock = true;
                    this.unlockTask = 'password';
                    this.unlockElement = element;
                    return;
                }

                let password = this.decrypt(element.password, this.passphrase);

                element.unlocked = true;
                element.clearPassword = password;

                // Workaround for dev, so element gets update
                element.title += ' ';
            },

            /**
             * Hide password
             * @param element
             */
            hidePassword(element) {
                element.unlocked = false;
                element.title = element.title.trim();
            },

            /**
             * Set the ordering of the passwords (db query, e.g. triggers a reload)
             * @param orderBy {string}
             */
            orderBy(orderBy) {
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
            showGenerator(element) {
                if (!this.passphrase) {
                    this.unlockElement = element;
                    this.unlockTask = 'generator';
                    this.showUnlock = true;

                    return;
                }

                this.generatorElement = element;
                this.isGeneratorPopupActive = true;
            },

            /**
             * Hide the generator and reset generated password etc.
             */
            hideGenerator() {
                this.generatorElement = null;
                this.isGeneratorPopupActive = false;
            },

            /**
             * Inserts the password into the given element (both encrypted and unecrypted)
             * @param generatedPassword {string}
             */
            useGeneratedPassword(generatedPassword) {
                console.log('Using generated pw' + generatedPassword);

                this.generatorElement.password = this.encrypt(generatedPassword, this.passphrase);
                this.generatorElement.clearPassword = generatedPassword;
                this.generatorElement.unlocked = true;

                // Workaround as else child is not updated
                this.generatorElement.title += ' ';
                this.generatorElement.title = this.generatorElement.title.trim();

                this.isGeneratorPopupActive = false;
            },

            /**
             * Show the new login
             */
            showNewLogin() {
                this.newElement = {
                    title: '',
                    url: '',
                    username: '',
                    password: '',
                    unlocked: true,

                    // Auto generate?
                    clearPassword: '',
                    comment: ''
                };

                this.isShowNewLogin = true;
            },

            /**
             * Update the passphrase
             * @param passphrase {string}
             * @param activeElement {object}
             * @param task {string}
             */
            updatePassphrase(passphrase, activeElement, task) {
                this.showUnlock = false;

                if (!passphrase) {
                    return;
                }

                this.passphrase = passphrase;

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

            /**
             * Delete an element
             * @param evt {Event)
             * @param data {object}
             */
            deleteElement(evt, data) {
                this.apiElements.delete(data.element.id, (result) => {
                    this.loadElements()
                }, (error) => {
                    console.log(error)
                })
            },

            /**
             * Temporary store item data
             */
            onElementContextMenu(locals) {
                this.menuData = locals
            },

            /**
             * Reset context menu
             */
            resetElementContextMenu() {
                this.menuData = null;
            },

            /**
             * Search for elements
             */
            searchElements: debounce(function () {
                this.resetPage();
                this.loadElements();
            }, 300),
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

                // Pagination and Filter (TODO make setting)
                offset: 0,
                limit: 10,
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
                passphrase: this.getPassphrase(),

                // Generator Popup
                isGeneratorPopupActive: false,
                generatorElement: null,
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
