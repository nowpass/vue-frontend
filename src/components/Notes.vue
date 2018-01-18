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
                    <input type="text" placeholder="Search" v-model="filterSearch" class="form-control"
                           v-on:keyup="searchElements"/>
                </div>
            </div>

            <div id="notes-list" class="list-group">
                <div id="notes-header" class="list-group-item">
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
                    <div v-if="notes.length == 0" class="list-group-item">
                        <translate v-once :word="'no_notes'"/>
                    </div>

                    <div v-for="note in notes"
                         class="single-note list-group-item"
                         v-bind:id="'note-' + note.id">
                        <div class="row info-note align-items-center" v-on:click="showNote(note)">
                            <div class="col-md-5 text-ellipsis">
                                <a v-bind:href="note.url" target="_blank">{{note.url}}</a>
                            </div>

                            <div class="col-md-4 text-ellipsis">
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

                <pagination :limit="limit" :currentPage="currentPage" :itemsLength="notes.length" :itemsTotal="total"
                            v-on:changeLimit="changeLimit" v-on:changeCurrentPage="goToPage"/>
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
    import Login from './parts/LoginEdit';
    import translate from './helpers/Translate'
    import Unlock from './parts/Unlock'
    import LoginFirst from "./parts/LoginFirst";
    import Loading from "./parts/Loading";
    import Pagination from "./parts/Pagination"

    // Mixins
    import settings from '../mixins/settings';
    import decrypt from '../mixins/decrypt'

    // Modules
    import ApiNotes from '../modules/api-notes'

    // 3rd party
    import Icon from 'vue-awesome/components/Icon'
    import dropdown from 'vue-my-dropdown';
    import {format} from 'date-fns';
    import {en} from 'date-fns';
    import debounce from 'lodash/debounce'


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
            Unlock,
            Pagination
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

                let filters = {
                    search: this.filterSearch,
                    order_by: this.orderByValue + ' ' + (this.orderByASC ? 'ASC' : 'DESC'),
                    offset: this.offset,
                    limit: this.limit
                };

                this.apiNotes.load(filters, this.resolveLoad, this.failLoad)
            },

            /**
             * Resolve the response for loading
             */
            resolveLoad(response) {
                this.notes = response.data['notes'];
                this.total = parseInt(response.data['total']);

                this.toggleLoading();
            },

            /**
             * Fail for load
             */
            failLoad(error) {
                console.log("Error loading notes: " + JSON.stringify(error));

                // TODO show notification

                if (error.response && error.response.status === 401) {
                    this.$router.push('/options');
                }

                // Redirect to test api
                this.$router.push('/options');
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

                // Let's make sure the note is encrypted..
                if (noteToSave.clearContent) {
                    noteToSave.content = this.encrypt(noteToSave.clearContent, this.passphrase);
                }

                this.apiNotes.store(noteToSave, this.loadNotes, this.failSave);
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
             * Change the limit and trigger reload
             *
             * @param limit {number}
             */
            changeLimit: function (limit) {
                this.limit = limit;
                this.resetPage();
                this.loadNotes();
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

                if (note.content) {
                    note.clearContent = this.decrypt(note.content, this.passphrase);
                }

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
             * Search for elements
             */
            searchElements: debounce(function () {
                this.resetPage().loadNotes();
            }, 300),

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
                apiNotes: new ApiNotes(this.getSetting('apiUrl', ''), this.getSetting('apiKey', '')),
                apiKey: this.getSetting('apiKey', ''),
                showLoginFirst: false,

                // Notes
                noteToUnlock: null,
                notes: [],

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
                editNote: null,

                // Loading Dialog
                isLoading: false,

                // Passphrase Popup
                showUnlock: false,
                unlockNote: null,
                unlockTask: '',

                // Check if we have a passphrase or temporary one
                passphrase: this.getPassphrase(),
            }
        }
    }

</script>

<style>
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
        background: #f9f9f9;
        padding: 10px;
    }
</style>
