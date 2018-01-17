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
                        Error Exporting!

                        <p>
                        {{errorMessage}}
                        </p>
                    </h3>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                Export Vault as JSON
                            </div>
                            <div class="card-body">
                                <p>
                                    Export all saved elements from the Vault.
                                </p>
                                <div class="form-group">
                                    <input type="checkbox" id="vaultWithPasswords" v-model="vaultWithPasswords"/>
                                    <label for="vaultWithPasswords">Clear text Passwords (careful!)</label>
                                </div>
                                <div class="form-group">
                                    <button class="btn btn-primary" v-on:click.prevent="exportVault">
                                        Download JSON
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                Export secure Notes as JSON
                            </div>
                            <div class="card-body">
                                <p>
                                    Export all secure Notes from the Vault.
                                </p>
                                <div class="form-group">
                                    <input type="checkbox" id="notesInClearText" v-model="notesInClearText"/>
                                    <label for="notesInClearText">Notes in clear text (careful!)</label>
                                </div>
                                <div class="form-group">
                                    <button class="btn btn-primary" v-on:click.prevent="exportNotes">
                                        Download JSON
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
            exportVault() {
                let filters = {
                    search: '',
                    order_by: 'title ASC',
                    offset: 0,
                    limit: 1000
                };

                this.apiElements.load(filters, this.resolveExportVault, this.failExportVault);
            },

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

            failExportVault(error) {
                // TODO enhance
                this.errorMsg(JSON.stringify(error));
            },

            exportNotes() {
                let filters = {
                    search: '',
                    order_by: 'id ASC',
                    offset: 0,
                    limit: 1000
                };

                this.apiNotes.load(filters, this.resolveExportNotes, this.failExportNotes);
            },

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
