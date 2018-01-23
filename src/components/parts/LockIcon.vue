<template>
    <div id="lock-icon">
        <icon :name="icon" scale="2"></icon>
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
        data() {
            return {
                icon: this.passphrase ? 'unlock' : 'lock'
            }
        }
    }
</script>

<style scoped>
    .fa-icon {color: #333;}
</style>