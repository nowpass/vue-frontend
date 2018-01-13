<template>
    <div id="pagination" class="text-center list-group-item">
        <div class="row align-items-center">
            <div class="col-2 text-left">
                <select v-model="paginationLimit" v-on:change="changeLimit(paginationLimit)">
                    <option value="3">3</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </div>

            <div v-if="itemsTotal / limit > 1" id="pagination-pages" class="col-7">
                <button v-if="currentPage > 1" v-on:click.prevent="changeCurrentPage(currentPage - 1)"
                        class="btn btn-default btn-sm">
                    &lt;
                </button>
                <button v-for="page in Math.ceil(itemsTotal / limit)"
                        v-bind:class="page === currentPage ? 'btn-primary' : ''"
                        v-on:click.prevent="changeCurrentPage(page)"
                        class="btn btn-default btn-sm">
                    {{page}}
                </button>
                <button v-if="(currentPage) * limit < itemsTotal" class="btn btn-default btn-sm"
                        v-on:click.prevent="changeCurrentPage(currentPage + 1)">
                    &gt;
                </button>
            </div>
            <div class="col-3 text-right" v-bind:class="itemsTotal / limit <= 1 ? 'offset-sm-7' : ''">
                <translate :word="'showing'"/>
                {{itemsLength}} / {{itemsTotal}}
            </div>
        </div>
    </div>
</template>

<script>
    import translate from '../helpers/Translate'

    export default {
        name: "pagination",
        props: ['limit', 'currentPage', 'itemsLength', 'itemsTotal'],
        components: {translate},
        created() {

        },
        methods: {
            changeCurrentPage(page) {
                this.$emit('changeCurrentPage', page);
            },
            changeLimit(limit) {
                this.$emit('changeLimit', limit);
            }
        },
        data() {
            return {
                paginationLimit: this.limit
            }
        }
    }
</script>

<style scoped>

</style>
