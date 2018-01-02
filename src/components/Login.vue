<!-- Very tightly coupled to parent, basically just outsourcing.. (TODO Loose that and use v-model and event emit) -->
<template>
    <div id="login" class="col-12">
        <h3>
            <translate v-once :word="'new_login'" />
        </h3>
        <hr />
        <div class="row">
            <div class="col-6">
                <div class="form-group">
                    <label for="title"><translate :word="'title'" ucfirst="true" /></label>
                    <input type="text" id="title" placeholder="" v-model="element.title"
                           class="form-control"/>
                </div>
            </div>
            <div class="col-6">
                <div class="form-group">
                    <label for="url"><translate :word="'url'" ucfirst="true" /></label>
                    <input type="text" id="url" placeholder="https://" v-model="element.url"
                           class="form-control"/>
                </div>
            </div>
            <div class="col-6">
                <div class="form-group">
                    <label for="username"><translate :word="'username'" ucfirst="true" /></label>
                    <input type="text" id="username" v-model="element.username" class="form-control"/>
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
                <textarea v-model="element.comment" class="form-control"></textarea>
            </div>

            <div class="col-6">
                <div class="row">
                    <div class="col-12" v-if="element.createdAt">
                        <br/>
                        <label>
                            <translate v-once :word="'created_at'" />
                        </label>
                        {{new Date(element.createdAt)}}
                    </div>

                    <div class="col-12" v-if="element.updatedAt">
                        <label>
                            <translate v-once :word="'updated_at'" />
                        </label>
                        {{new Date(element.updatedAt)}}
                    </div>
                </div>
            </div>
            <div class="col-12">
                <hr/>
            </div>

            <div class="col-12 text-right">
                <button class="btn btn-default" v-on:click="$parent.showElement(element)">
                    <translate v-once :word="'cancel'" />
                </button>
                <button class="btn btn-primary" v-on:click="$parent.saveElement(element)">
                    <translate v-once :word="'save'" />
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    import translate from './Translate'

    export default {
        name: "login",
        components: {translate},
        props: ['element'],
        data() {
            return {}
        }
    }
</script>

<style>
    #login {
        background: #f1f1f1;
        padding: 10px;
    }
</style>