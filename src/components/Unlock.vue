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
                           v-on:keyup.13="unlock()"/>
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
                            v-on:click.prevent="close()">
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
    import translate from './Translate'
    import settings from '../mixins/settings'

    /**
     * Unlocks the passphrase
     */
    export default {
        name: "unlock",
        props: ['element', 'task'],
        components: {translate},
        mixins: [settings],
        methods: {
            /**
             * Emit update_passphrase event to parent
             */
            unlock: function () {
                console.log('Unlocking');

                if (!this.passphrase) {
                    return;
                }

                if (this.remember) {
                    this.saveSetting('passphrase', this.passphrase);
                    return;
                }

                // Reseted on every extension launch
                this.saveSetting('temporary_passphrase', this.passphrase);

                // Popup mode
                if (this.$route.path !== '/unlock') {
                    this.$emit('update_passphrase', this.passphrase, this.element, this.task);
                    return;
                }

                if (process.env.NODE_ENV === 'development') {
                    this.$router.push('/');
                    return;
                }

                chrome.tabs.getCurrent(function(tab) {
                    chrome.tabs.remove(tab.id, function() { });
                });
            },
            /**
             * Emit update_passphrase event with empty passphrase
             */
            close: function () {
                this.passphrase = '';

                if (this.$route.path !== '/unlock') {
                    this.$emit('update_passphrase', this.passphrase, this.element, this.task);
                    return;
                }

                if (process.env.NODE_ENV === 'development') {
                    this.$router.push('/');
                    return;
                }

                chrome.tabs.getCurrent(function(tab) {
                    chrome.tabs.remove(tab.id, function() { });
                });
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
