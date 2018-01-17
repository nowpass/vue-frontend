<template>
    <div id="options">
        <div class="container-fluid text-left">
            <div id="header" class="text-left row">
                <div class="col-12">
                    <h3>
                        <translate v-once :word="'export'"/>
                    </h3>
                </div>
            </div>

            <div id="export-content">
                <div class="alert alert-warning" v-if="errorMessage">
                    <h3>
                        <translate v-once :word="'error_exporting'"/>!
                    </h3>
                    <p>
                        {{errorMessage}}
                    </p>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <translate v-once :word="'export_vault_as_json'"/>
                            </div>
                            <div class="card-body">
                                <p>
                                    <translate v-once :word="'export_all_saved_elements_from_the_vault'"/>
                                </p>
                                <div class="form-group">
                                    <input type="checkbox" id="vaultWithPasswords" v-model="vaultWithPasswords"/>
                                    <label for="vaultWithPasswords">
                                        <translate v-once :word="'clear_text_passwords'"/>
                                    </label>
                                </div>
                                <div class="form-group">
                                    <button class="btn btn-primary" v-on:click.prevent="exportVault">
                                        <translate v-once :word="'download_json'"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <translate v-once :word="'export_secure_notes_as_json'"/>
                            </div>
                            <div class="card-body">
                                <p>
                                    <translate v-once :word="'export_all_notes'"/>
                                </p>
                                <div class="form-group">
                                    <input type="checkbox" id="notesInClearText" v-model="notesInClearText"/>
                                    <label for="notesInClearText">
                                        <translate v-once :word="'notes_with_clear_text'"/>
                                    </label>
                                </div>
                                <div class="form-group">
                                    <button class="btn btn-primary" v-on:click.prevent="exportNotes">
                                        <translate v-once :word="'download_json'"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    // Components
    import translate from './helpers/Translate'

    // Mixins
    import settings from '../mixins/settings'
    import decrypt from "../mixins/decrypt";

    // Modules
    import ApiElements from '../modules/api-elements'
    import ApiNotes from '../modules/api-notes'

    export default {
        name: 'Export',
        components: {translate},
        mixins: [settings, decrypt],
        created() {
        },
        methods: {
            /**
             * Export the vault
             * TODO more than 1000 items
             * @async
             */
            exportVault() {
                let filters = {
                    search: '',
                    order_by: 'title ASC',
                    offset: 0,
                    limit: 1000
                };

                this.apiElements.load(filters, this.resolveExportVault, this.failExportVault);
            },

            /**
             * Resolve for the export
             * @param result {object}
             */
            resolveExportVault(result) {
                let elements = result.data['elements'];

                if (this.vaultWithPasswords) {
                    for (let element of elements) {
                        element.password_cleartext = '';

                        if (element.password) {
                            element.password_cleartext = this.decrypt(element.password, this.passphrase);
                        }
                    }
                }

                let w = window.open("", "_blank");
                w.document.title = 'Nowpass CSV export';
                w.document.write(JSON.stringify(elements));
            },

            /**
             * Fail / Show error message on export
             * @param error {object}
             */
            failExportVault(error) {
                // TODO enhance
                this.errorMsg(JSON.stringify(error));
            },

            /**
             * Export the notes
             * @async
             */
            exportNotes() {
                let filters = {
                    search: '',
                    order_by: 'id ASC',
                    offset: 0,
                    limit: 1000
                };

                this.apiNotes.load(filters, this.resolveExportNotes, this.failExportNotes);
            },

            /**
             * Resolve for the export
             * @param result {object}
             */
            resolveExportNotes(result) {
                let notes = result.data['notes'];

                if (this.notesInClearText) {
                    for (let note of notes) {
                        note.content_cleartext = '';

                        if (note.content) {
                            note.content_cleartext = this.decrypt(note.content, this.passphrase);
                        }
                    }
                }

                let w = window.open("", "_blank");
                w.document.title = 'Nowpass CSV export';
                w.document.write(JSON.stringify(notes));
            },

            /**
             * Fail exporting notes
             * @param error {object}
             */
            failExportNotes(error) {
                // TODO enhance
                this.errorMsg(JSON.stringify(error));
            },
        },
        data() {
            return {
                apiElements: new ApiElements(this.getSetting('apiUrl', ''), this.getSetting('apiKey', '')),
                apiNotes: new ApiNotes(this.getSetting('apiUrl', ''), this.getSetting('apiKey', '')),
                passphrase: this.getPassphrase(),

                // Export settings
                vaultWithPasswords: false,
                notesInClearText: false,

                // Error handling
                errorMessage: '',
            }
        }
    }
</script>
