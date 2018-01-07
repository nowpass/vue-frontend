<template>
    <div id="notes">

        <div class="container-fluid text-left">
            <div id="header" class="text-left row">
                <div class="col-9">
                    <h3>
                        <translate v-once :word="'notes'"/>
                    </h3>
                </div>
                <div class="col-3 text-right">
                    <!-- TODO Add debounce -->
                    <input type="text" placeholder="Search" v-model="filterSearch" class="form-control"
                           v-on:keyup="resetPage().loadNotes()"/>
                </div>
            </div>

            <div id="notes-list" class="list-group">
                <div id="notes-header" class="list-group-item active">
                    <div class="row align-items-center">

                        <div class="col-md-5">
                            <a href="#" v-on:click.prevent="orderBy('url')">
                                <translate v-once :word="'url'"/>
                                <icon name="sort"></icon>
                            </a>
                        </div>
                        <div class="col-md-4">
                            <a href="#" v-on:click.prevent="orderBy('title')">
                                <translate v-once :word="'title'"/>
                                <icon name="sort"></icon>
                            </a>
                        </div>
                        <div class="col-md-3">
                            <a href="#" v-on:click.prevent="orderBy('createdAt')">
                                <translate v-once :word="'created_at'"/>
                                <icon name="sort"></icon>
                            </a>
                        </div>
                    </div>
                </div>

                <div id="notes-body">
                    <div v-for="note in notes"
                         class="single-note list-group-item"
                         v-bind:id="'note-' + note.id">
                        <div class="row info-note align-items-center" v-on:click="showNote(note)">
                            <div class="col-md-5">
                                <a v-bind:href="note.url" target="_blank">{{note.url}}</a>
                            </div>

                            <div class="col-md-4">
                                {{note.title}}
                            </div>

                            <div class="col-md-3">
                                {{getComputed(note.createdAt)}}
                            </div>
                        </div><!--// Note info -->

                        <div class="edit-note edit-row" v-if="note === editNote">
                            <div id="edit-note-container" class="col-12">
                                <div class="row align-items-center">
                                    <div class="col-6">
                                        <div class="form-group">
                                            <label for="title">
                                                <translate :word="'title'"/>
                                            </label>
                                            <input type="text" id="title" placeholder="" v-model="note.title"
                                                   class="form-control"/>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="form-group">
                                            <label for="url">
                                                <translate :word="'url'"/>
                                            </label>
                                            <input type="text" id="url" placeholder="" v-model="note.url"
                                                   class="form-control"/>
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <div class="form-group">
                                            <label for="content">
                                                <translate :word="'content'"/>
                                            </label>
                                            <textarea id="content" v-model="note.clearContent" class="form-control" rows="10"></textarea>
                                        </div>
                                    </div>

                                    <div class="col-12 text-right">
                                        <button class="btn btn-default" v-on:click="showNote(note)">
                                            <translate :word="'close'"/>
                                        </button>
                                        <button class="btn btn-primary" v-on:click="saveNote(note)">
                                            <translate :word="'save'"/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div><!--// Edit note-->

                </div><!-- //body-->

                <div id="notes-footer" class="text-center list-group-item active">
                    <div class="row align-items-center">
                        <div class="col-2 text-left">
                            <select v-model="limit" v-on:change="resetPage().loadNotes()">
                                <option value="3">3</option>
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>

                        <div v-if="pages > 1" id="pagination" class="col-8">
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
                        <div class="col-2 text-right" v-bind:class="pages === 1 ? 'offset-sm-8' : ''">
                            <translate :word="'showing'"/>
                            {{notes.length}} / {{total}}
                        </div>
                    </div>
                </div>
            </div><!-- //Notes -->


        </div> <!-- //Container -->

        <div v-if="showUnlock">
            <unlock v-on:update_passphrase="updatePassphrase" :element="unlockNote" :task="'note'"></unlock>
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
    import Loading from "./Loading";

    // 3rd party
    import axios from 'axios'
    import Icon from 'vue-awesome/components/Icon'
    import dropdown from 'vue-my-dropdown';
    import {format} from 'date-fns';
    import {en} from 'date-fns';

    // Mixins
    import settings from '../mixins/settings';
    import decrypt from '../mixins/decrypt'

    // Font Awesome icons
    import 'vue-awesome/icons/user-circle'
    import 'vue-awesome/icons/refresh'
    import 'vue-awesome/icons/sort'
    import 'vue-awesome/icons/plus-circle'
    import 'vue-awesome/icons/spinner'

    /**
     * Main Management for Notes
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
         * Called on Vue create, loads notes and set the generated count
         */
        created() {
            if (!this.apiKey) {
                this.showLoginFirst = true;
                return;
            }
            this.loadNotes();
        },
        methods: {
            /**
             * Load the Notes into the table (promise)
             */
            loadNotes: function () {
                this.toggleLoading();

                // Base URL (TODO move to mixin const)
                let url = this.apiUrl + '/api/v1/notes';

                let parts = [];

                // Filter Search
                if (this.filterSearch !== '') {
                    parts.push('search=' + this.filterSearch);
                }

                // Add Ordering
                parts.push('order_by=' + this.orderByValue + ' ' + (this.orderByASC ? 'ASC' : 'DESC'));

                // Limit / Offset
                parts.push('offset=' + this.offset);
                parts.push('limit=' + this.limit);

                // Build URL (TODO optimize)
                for (let i = 0; i < parts.length; i++) {
                    let glue = (i === 0) ? '?' : '&';

                    url += glue + parts[i];
                }

                // Encode possible special chars
                url = encodeURI(url);

                // Reference
                var vm = this;

                axios({
                    method: 'get',
                    url: url,
                    headers: {'api-key': this.apiKey},
                }).then(function (response) {
                    vm.notes = response.data['notes'];
                    vm.total = parseInt(response.data['total']);

                    vm.calculatePages();
                    vm.toggleLoading();
                }).catch(function (error) {
                    console.log(error);
                    // Redirect
                    // vm.$router.push('/Options');
                });
            },

            /**
             * Save the note changes
             */
            saveNote: function (noteToSave) {
                if (!this.passphrase) {
                    this.showUnlock = true;
                    this.unlockNote = null;
                    this.unlockTask = '';
                    return;
                }

                // Clone element, as we have to delete things (like clear text password)
                let note = JSON.parse(JSON.stringify(noteToSave));

                let method = 'post';

                // Base URL (TODO move to const)
                let url = this.apiUrl + '/api/v1/notes';

                // Update
                if (note.id) {
                    method = 'patch';
                    url = url + '/' + note.id;
                }

                // Let's make sure the password is encrypted..
                if (note.clearContent) {
                    note.content = this.encrypt(note.clearContent, this.passphrase);
                }

                delete(note.clearContent);

                // Make sure no spaces are left
                note.title = note.title.trim();

                // Reference
                var vm = this;

                axios.defaults.headers['Content-Type'] = 'application/vnd.api+json';
                axios.defaults.headers['Accept'] = 'application/vnd.api+json';

                axios({
                    method: method,
                    url: url,
                    headers: {'api-key': this.apiKey},
                    data: JSON.stringify(note)
                }).then(function (response) {
                    // Trigger reload
                    vm.loadNotes();
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
                this.loadNotes();
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
             * Show / Edit given note
             * @param element {object}
             */
            showNote: function (note) {
                // Let's unlock that and save passphrase in state
                if (!this.passphrase) {
                    this.showUnlock = true;
                    this.unlockTask = 'note';
                    this.unlockNote = note;
                    return;
                }

                if (this.editNote === note) {
                    this.editNote = null;
                    return;
                }

                note.clearContent = this.decrypt(note.content, this.passphrase);

                this.editNote = note;
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
                this.loadNotes();
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

                if (activeElement == null) {
                    return;
                }

            },

            /**
             * Get a formated date (TODO i18n)
             *
             * @param date
             * @returns {string | *}
             */
            getComputed(date) {
                return format(date, 'MM/DD/YYYY @ h:mm a', {locale: en});
            }
        },
        data() {
            return {
                apiUrl: this.getSetting('apiUrl', ''),
                apiKey: this.getSetting('apiKey', ''),
                showLoginFirst: false,

                // Notes
                noteToUnlock: null,
                notes: [],

                // Pagination and Filter
                offset: 0,
                limit: 20,
                total: 0,

                pages: 1,
                currentPage: 1,

                countNotes: 0,
                filterSearch: '',
                orderByASC: false,
                orderByValue: 'id',

                // Edit
                editNote: null,

                // Loading Dialog
                isLoading: false,

                // Passphrase Popup
                showUnlock: false,
                unlockNote: null,
                unlockTask: '',

                // Check if we have a passphrase or temporary one
                passphrase: this.getSetting('passphrase', '') || this.getSetting('temporary_passphrase'),
            }
        }
    }

</script>

<style>
    #notes-header a {
        color: #fff;
    }

    .edit-note {
        border-top: 1px solid #ccc;
        margin-top: 8px;
    }

    .info-note {
        cursor: pointer;
    }

    .edit-row {
        margin-left: -1.25rem;
        margin-right: -1.25rem;
    }

    #edit-note-container {
        background: #f1f1f1;
        padding: 10px;
    }
</style>
