<template>
    <div id="lab">
        <h3>Labs</h3>

        <translate :word="'use_password'"/>
    </div>
</template>

<script>
    /**
     * Just for tests
     */

    import translate from './helpers/Translate'

    export default {
        name: "lab",
        components: {translate},
        created() {
        },
        methods: {},
        data() {
            return {
                elements: [
                    {
                        id: 42,
                        title: 'Login 1',
                        url: 'http://www.test.de',
                        username: 'myuser'
                    },
                    {
                        id: 43,
                        title: 'Login 2',
                        url: 'http://www.test.de',
                        username: 'myuser42'
                    },
                ]
            }
        }
    }
</script>
