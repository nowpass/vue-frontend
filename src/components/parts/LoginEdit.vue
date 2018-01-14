<template>
    <div id="edit-login" class="col-12" v-bind:class="isNew ? 'new-login' : 'edit-login'">
        <div v-if="isNew">
        <h3>
            <translate v-once :word="'new_login'" />
        </h3>
        <hr />
        </div>
        <div class="row">
            <div class="col-6">
                <div class="form-group">
                    <label for="title"><translate :word="'title'" ucfirst="true" /></label>
                    <input type="text" id="title" placeholder="Twitter John Smith" v-model="element.title"
                           class="form-control" />
                </div>
            </div>
            <div class="col-6">
                <div class="form-group">
                    <label for="url"><translate :word="'url'" ucfirst="true" /></label>
                    <input type="text" id="url" placeholder="https://twitter.com" v-model="element.url"
                           class="form-control"/>
                </div>
            </div>
            <div class="col-6">
                <div class="form-group">
                    <label for="username"><translate :word="'username'" ucfirst="true" /></label>
                    <input type="text" id="username" v-model="element.username" class="form-control" placeholder="johnsmith"/>
                </div>
            </div>
            <div class="col-6">
                <div class="form-group">
                    <label>
                        <translate v-once :word="'password'" ucfirst="true" />
                    </label>
                    <div class="input-group">
                        <input type="text" v-model="element.clearPassword"
                               class="form-control"/>

                        <div class="input-group-append">
                            <button class="btn btn-default" v-on:click.prevent="$parent.showGenerator(element)">
                                <translate :word="'generate_new'" />
                            </button>
                            <button v-if="!element.unlocked" class="btn btn-primary"
                                    v-on:click.prevent="$parent.showPassword(element)">
                                <translate :word="'show'" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-6">
                <label><translate v-once :word="'comment'" ucfirst="true" /></label>
                <textarea v-model="element.comment" class="form-control" placeholder="Credentials for the twitter account of John Smith"></textarea>
            </div>

            <div class="col-6">
                <div class="row">
                    <div class="col-12" v-if="element.createdAt">
                        <br/>
                        <label>
                            <translate v-once :word="'created_at'" />
                        </label>
                        {{getComputed(element.createdAt)}}
                    </div>

                    <div class="col-12" v-if="element.updatedAt">
                        <label>
                            <translate v-once :word="'updated_at'" />
                        </label>
                        {{getComputed(element.updatedAt)}}
                    </div>
                </div>
            </div>
            <div class="col-12">
                <hr/>
            </div>

            <div class="col-12 text-right">
                <button class="btn btn-default" v-on:click="cancel(element)">
                    <translate v-once :word="'cancel'" />
                </button>
                <button class="btn btn-primary" v-on:click="store(element)">
                    <translate v-once :word="'save'" />
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    // Components
    import translate from '../helpers/Translate'

    // 3rd party
    import {format} from 'date-fns';
    import {en} from 'date-fns';

    /**
     * Login view
     */
    export default {
        name: "edit-login",
        components: {translate},
        props: ['element', 'isNew'],
        methods: {
            /**
             * Emit store to parent
             */
            store(element) {
                this.$emit('storeLogin', element);
            },

            /**
             * Emit cancel to parent
             */
            cancel(element) {
                this.$emit('cancelEditLogin', element);
            },

            /**
             * Get a formatted date (TODO i18n + helper)
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

            }
        }
    }
</script>

<style>
    #edit-login {
        overflow: hidden;
    }

    .new-login {
        background: #fff;
        padding: 10px;
    }

    .edit-login {
        background: #f9f9f9;
        padding: 15px;
        margin-bottom: -12px;
    }
</style>