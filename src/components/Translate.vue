<script>
    export default {
        name: "translate",
        props: ['word', 'ucfirst', 'placeholders'],
        template: '\
        <span v-once>\
          {{translate(word, ucfirst, placeholders)}} \
        </span>\
        ',
        methods: {
            /**
             * Translate a string (in dev just add ##), else against the chrome.i18n API
             * @param string {string}
             * @param ucfirst {bool}
             * @param placeholders {array}
             * @returns {string}
             */
            translate(string, ucfirst=false, placeholders) {
                if (process.env.NODE_ENV === 'development') {
                    if (ucfirst) {
                        string = string.charAt(0).toUpperCase() + string.slice(1);
                    }

                    return '##' + string + '##'
                }

                let trans = '';

                if (!placeholders) {
                    trans = chrome.i18n.getMessage(string);
                } else {
                    trans = chrome.i18n.getMessage(string, placeholders);
                }

                if (!trans) {
                    // Warn in console
                    console.log('No translation for ' + string + '. At the following to the messages.json.');
                    console.log('"' + string + '": {\n\t"message":"' + string+ '"\n},');
                }

                if (ucfirst) {
                    return trans.charAt(0).toUpperCase() + trans.slice(1);
                }

                return trans;
            }
        },
        data() {
            return {
            }
        }
    }
</script>
