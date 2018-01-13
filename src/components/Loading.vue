<template>
    <div id="loading" class="now-modal-footer now-fade now-fade-white" v-once>
        <div class="now-modal-inner">
            <div class="now-modal-body">
                <div class="row">
                    <div class="col-4">
                        <icon name="spinner" pulse scale="2"></icon>
                    </div>
                    <div class="col-8">
                        <h3>
                            <translate :word="'loading'"/>
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    // Components
    import translate from './helpers/Translate'

    // 3rd party
    import Icon from 'vue-awesome/components/Icon'

    // Font Awesome icons
    import 'vue-awesome/icons/spinner'

    /**
     * Loading dialog
     */
    export default {
        name: "loading",
        components: {translate, Icon}
    }
</script>
