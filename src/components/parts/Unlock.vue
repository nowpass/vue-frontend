<template>
    <div id="unlock" class="now-modal now-fade">
        <div class="now-modal-inner">
            <div class="now-modal-title">
                <h4>
                    <translate :word="'enter_your_pass_phrase'"/>
                </h4>
            </div>
            <div class="now-modal-body">
                <div class="form-group">
                    <label for="passhrase">
                        <translate :word="'passphrase'"/>
                    </label>
                    <input type="password" id="passhrase" class="form-control" v-model.trim="passphrase"
                           v-on:keyup.13="unlock()" autocomplete="new-password"/>
                </div>
                <div class="form-group">
                    <input id="remember" v-model="remember" type="checkbox" />
                    <label for="remember">
                        <translate :word="'remember_passphrase'" />
                    </label>
                </div>
            </div>
            <div class="now-modal-footer text-center">
                <div class="form-group">
                    <button class="btn btn-default"
                            v-on:click.prevent="close()" v-if="!disableCancel">
                        <translate :word="'cancel'"/>
                    </button>
                    <button class="btn btn-primary" v-on:click.prevent="unlock()">
                        <translate :word="'unlock'" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    // Components
    import translate from '../helpers/Translate'

    // Mixins
    import settings from '../../mixins/settings'
    import chrome from "../../mixins/chrome";

    /**
     * Unlocks the passphrase
     */
    export default {
        name: "unlock",
        props: ['element', 'task', 'disableCancel'],
        components: {translate},
        mixins: [settings, chrome],
        methods: {
            /**
             * Emit update_passphrase event to parent
             */
            unlock() {
                if (!this.passphrase) {
                    return;
                }

                if (this.remember) {
                    this.setSetting('passphrase', this.passphrase);
                } else {
                    // Reseted on every extension launch
                    this.setSetting('temporary_passphrase', this.passphrase);
                }

                // Popup mode
                if (this.$route.path !== '/unlock') {
                    this.$emit('update_passphrase', this.passphrase, this.element, this.task);
                    return;
                }

                if (process.env.NODE_ENV === 'development') {
                    this.$router.push('/');
                    return;
                }

                this.closeCurrentBrowserTab();
            },
            /**
             * Emit update_passphrase event with empty passphrase
             */
            close() {
                this.passphrase = '';

                if (this.$route.path !== '/unlock') {
                    this.$emit('update_passphrase', this.passphrase, this.element, this.task);
                    return;
                }

                if (process.env.NODE_ENV === 'development') {
                    this.$router.push('/');
                    return;
                }

                this.closeCurrentBrowserTab();
            }
        },
        data() {
            return {
                passphrase: '',
                remember: false
            }
        }
    }
</script>
