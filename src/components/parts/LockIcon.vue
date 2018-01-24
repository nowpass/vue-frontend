<template>
    <div id="lock-icon" v-on:click.prevent="toggleLock">
        <icon :name="this.passphrase ? 'unlock' : 'lock'" scale="2"></icon>
    </div>
</template>

<script>
    // 3rd party
    import Icon from 'vue-awesome/components/Icon'
    import settings from '@/mixins/settings';

    import 'vue-awesome/icons/lock'
    import 'vue-awesome/icons/unlock'

    export default {
        name: "lock-icon",
        props: ['passphrase'],
        components: {
            Icon
        },
        mixins: [settings],
        created() {
        },
        methods: {
            /**
             * Lock / Unlock the passphrase
             */
            toggleLock: function () {
                // Lock
                if (this.passphrase) {
                    this.clearPassphrase();

                    this.$emit('lock-passphrase');

                    return;
                }

                this.$emit('unlock-passphrase');
            }
        }
    }
</script>

<style scoped>
    .fa-icon {color: #333;}
</style>
