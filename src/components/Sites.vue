<template>
    <div id="sites">

        <div class="container-fluid text-left">
            <div id="header" class="text-left row">
                <div class="col-8">
                    <h3>
                        <translate v-once :word="'sites'"/>
                    </h3>
                </div>
                <div class="col-3 text-right">
                    <input type="text" placeholder="Search" v-model="filterSearch" class="form-control"
                           v-on:keyup="searchElements"/>
                </div>
            </div>

            <div id="sites-list" class="list-group">
                <div id="sites-header" class="list-group-item">
                    <div class="row align-items-center">

                        <div class="col-md-5">
                            <a href="#" v-on:click.prevent="orderBy('url')">
                                <translate v-once :word="'url'"/>
                                <icon name="sort"></icon>
                            </a>
                        </div>
                        <div class="col-md-4">
                            <translate v-once :word="'tags'"/>
                        </div>
                        <div class="col-md-3">
                            <a href="#" v-on:click.prevent="orderBy('createdAt')">
                                <translate v-once :word="'created_at'"/>
                                <icon name="sort"></icon>
                            </a>
                        </div>
                    </div>
                </div>

                <div id="sites-body">
                    <div v-if="sites.length == 0" class="list-group-item">
                        <translate v-once :word="'no_sites'"/>
                    </div>

                    <div v-for="site in sites"
                         class="single-site list-group-item"
                         v-bind:id="'site-' + site.id">
                        <div class="row info-site align-items-center"
                             v-on:contextmenu.prevent="$refs.noteContextMenu.open($event, {note: site})">
                            <div class="col-md-5 text-ellipsis">
                                <a v-bind:href="site.url" target="_blank">{{site.url}}</a>
                            </div>

                            <div class="col-md-4 text-ellipsis">
                                {{site.title}}
                            </div>

                            <div class="col-md-3">
                                {{getComputed(site.createdAt)}}
                            </div>
                        </div>
                    </div>

                </div><!-- //body-->

                <pagination :limit="limit" :currentPage="currentPage" :itemsLength="sites.length" :itemsTotal="total"
                            v-on:changeLimit="changeLimit" v-on:changeCurrentPage="goToPage"/>
            </div><!-- //sites -->
        </div> <!-- //Container -->

        <div v-if="isLoading">
            <loading v-once></loading>
        </div>

        <div v-if="showLoginFirst">
            <login-first v-once></login-first>
        </div>

        <context-menu id="element-context" ref="noteContextMenu" @ctx-open="onNoteContextMenu"
                      @ctx-cancel="resetNoteContextMenu">
            <li v-on:click="deleteSite($event, menuData)">
                <translate :word="'delete_site'"/>
            </li>
        </context-menu>

    </div><!-- //App -->
</template>

<script>
    // Components
    import Login from './parts/LoginEdit';
    import translate from './helpers/Translate'
    import Unlock from './parts/Unlock'
    import LoginFirst from "./parts/LoginFirst";
    import Loading from "./parts/Loading";
    import Pagination from "./parts/Pagination"
    import LockIcon from "./parts/LockIcon";

    // Mixins
    import settings from '../mixins/settings';

    // Modules
    import ApiSites from '../modules/api-sites'

    // 3rd party
    import Icon from 'vue-awesome/components/Icon'
    import dropdown from 'vue-my-dropdown';
    import {format} from 'date-fns';
    import {en} from 'date-fns';
    import debounce from 'lodash/debounce'
    import contextMenu from 'vue-context-menu'

    // Font Awesome icons
    import 'vue-awesome/icons/user-circle'
    import 'vue-awesome/icons/refresh'
    import 'vue-awesome/icons/sort'
    import 'vue-awesome/icons/plus-circle'
    import 'vue-awesome/icons/spinner'

    /**
     * Main Management for sites
     */
    export default {
        name: 'nowpass',
        components: {
            Loading,
            LoginFirst,
            dropdown,
            translate,
            Login,
            Unlock,
            LockIcon,
            Pagination,
            // 3rd Party
            Icon,
            contextMenu
        },
        mixins: [settings],
        /**
         * Called on Vue create, loads sites and set the generated count
         */
        created() {
            if (!this.apiKey) {
                this.showLoginFirst = true;
                return;
            }
            this.loadSites();
        },
        methods: {
            /**
             * Load the sites into the table (promise)
             */
            loadSites() {
                this.toggleLoading();

                let filters = {
                    search: this.filterSearch,
                    order_by: this.orderByValue + ' ' + (this.orderByASC ? 'ASC' : 'DESC'),
                    offset: this.offset,
                    limit: this.limit
                };

                this.apiSites.load(filters, this.resolveLoad, this.failLoad)
            },

            /**
             * Resolve the response for loading
             */
            resolveLoad(response) {
                this.sites = response.data['sites'];
                this.total = parseInt(response.data['total']);

                this.toggleLoading();
            },

            /**
             * Fail for load
             */
            failLoad(error) {
                console.log("Error loading sites: " + JSON.stringify(error));

                // TODO show notification

                if (error.response && error.response.status === 401) {
                    this.$router.push('/options');
                }

                // Redirect to test api
                this.$router.push('/options');
            },

            /**
             * Save the site changes
             */
            saveNote: function (noteToSave) {
                if (!this.passphrase) {
                    this.showUnlockPopup();
                    return;
                }

                // Let's make sure the note is encrypted..
                if (noteToSave.clearContent) {
                    noteToSave.content = this.encrypt(noteToSave.clearContent, this.passphrase);
                }

                this.apisites.store(noteToSave, this.loadSites, this.failSave);
            },

            /**
             *  Error handling for failed saving
             */
            failSave(error) {
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
                this.loadSites();
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
             * Change the limit and trigger reload
             *
             * @param limit {number}
             */
            changeLimit: function (limit) {
                this.limit = limit;
                this.resetPage();
                this.loadSites();
            },

            /**
             * Toggle Loading dialog
             */
            toggleLoading: function () {
                this.isLoading = !this.isLoading;
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
                this.loadSites();
            },

            /**
             * Search for elements
             */
            searchElements: debounce(function () {
                this.resetPage().loadSites();
            }, 300),

            /**
             * Get a formated date (TODO i18n)
             *
             * @param date
             * @returns {string | *}
             */
            getComputed(date) {
                return format(date, 'MM/DD/YYYY @ h:mm a', {locale: en});
            },

            /**
             * Lock the passphrase
             */
            lockPassphrase() {
                this.clearPassphrase();
                this.passphrase = '';
            },

            /**
             * Delete an item
             * @param evt {Event)
             * @param data {object}
             */
            deleteSite(evt, data) {
                this.apiSites.delete(data.note.id, (result) => {
                    this.loadSites()
                }, (error) => {
                    console.log(error)
                })
            },

            /**
             * Temporary store item data
             */
            onNoteContextMenu(locals) {
                this.menuData = locals
            },

            /**
             * Reset context menu
             */
            resetNoteContextMenu() {
                this.menuData = null;
            },
        },
        data() {
            return {
                apiSites: new ApiSites(this.getSetting('apiUrl', ''), this.getSetting('apiKey', '')),
                apiKey: this.getSetting('apiKey', ''),
                showLoginFirst: false,

                // sites
                sites: [],

                // Pagination and Filter
                offset: 0,
                limit: 20,
                total: 0,
                currentPage: 1,

                // Search and Ordering
                filterSearch: '',
                orderByASC: false,
                orderByValue: 'id',

                // Loading Dialog
                isLoading: false,

                // Check if we have a passphrase or temporary one
                passphrase: this.getPassphrase(),
            }
        }
    }

</script>

<style>
</style>
