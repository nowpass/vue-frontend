<template>
    <div id="generate" v-bind:class="isUsedIntern ? 'now-modal now-fade' : ''">
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
                    <input id="generator-special" type="checkbox" v-model="generatorSpecial" />
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
                    <button class="btn btn-default" v-on:click.prevent="close()">
                        <translate :word="'cancel'"/>
                    </button>
                    <button class="btn btn-primary" v-on:click.prevent="use()">
                        <translate :word="'use_password'"/>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import translate from './Translate'
    import settings from '../mixins/settings'

    // 3rd party
    import Icon from 'vue-awesome/components/Icon'

    // Font Awesome icons
    import 'vue-awesome/icons/refresh'

    /**
     * Unlocks the passphrase
     */
    export default {
        name: "generate",
        components: {translate, Icon},
        mixins: [settings],
        created() {
            this.setGeneratedPassword();
        },
        methods: {
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

                // Crypto Browser API for real random
                let crypto = window.crypto || window.msCrypto; // for IE 11
                let randomNumbers = new Uint8Array(this.generatorLength);

                // Get a set of random numbers (0-255)
                crypto.getRandomValues(randomNumbers);

                // Only using ASCII chars atm
                for (let i = 0; i < this.generatorLength; i++) {
                    password += chars.charAt(Math.floor((randomNumbers[i] / 256) * (chars.length - 1)));
                }

                return password;
            },

            /**
             * Emit update_passphrase event with empty passphrase
             */
            close: function () {
                this.generatedPassword = "";

                // Used in vault etc. on the extension itself (not in an iframe)
                if (this.isUsedIntern) {
                    this.$emit('use_generated', this.generatedPassword);
                    return;
                }

                if (process.env.NODE_ENV === 'development') {
                    console.log('in dev environment');
                    return;
                }

                let message = {
                    task: 'generatedClose'
                };

                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    let lastTabId = tabs[0].id;
                    chrome.tabs.sendMessage(lastTabId, message);
                });
            },
            
            use: function () {
                // Used in vault etc. on the extension itself (not in an iframe)
                if (this.isUsedIntern) {
                    this.$emit('use_generated', this.generatedPassword);
                    return;
                }

                if (process.env.NODE_ENV === 'development') {
                    console.log('in dev environment');
                    return;
                }

                let message = {
                    task: 'generatedInsert',
                    generatedPassword: this.generatedPassword
                };

                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    let lastTabId = tabs[0].id;
                    chrome.tabs.sendMessage(lastTabId, message);
                });
            }
        },
        data() {
            return {
                isUsedIntern: this.$route.path === '/generate' ? false : true,

                // Generator
                isGeneratorPopupActive: false,
                generatorNumbers: true,
                generatorSpecial: true,
                generatorLength: 13,
                generatedPassword: '',

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
    #generate label {
        margin-bottom: .1rem;
    }
</style>
