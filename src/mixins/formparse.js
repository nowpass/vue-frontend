/**
 * Mixin for parsing and handling form data
 */
export default {
    name: 'formparse',
    methods: {
        /**
         * Set the request data (todo move into class constructor)
         * @param formRequestData
         */
        setRequestData: function (formRequestData) {
            this.formRequestData = formRequestData;
        },

        /**
         * Get the user name from the form data
         * @returns {*}
         */
        getFormUsername: function () {
            return this.getFormElement('user', this.USER_REGEX);
        },

        /**
         * Get the password from the form data
         * @returns {*}
         */
        getFormPassword: function () {
            return this.getFormElement('password', this.PASSWORD_REGEX);
        },

        /**
         * Get the form element
         * @returns {*}
         */
        getFormElement: function (type, regex) {
            let cnt = 0;
            let val = '';

            // Iterate over the object
            for (let key in this.formRequestData) {
                if (regex.test(key)) {
                    this.form_data[type].name = key;

                    // We get an Array here..
                    let arVal = this.formRequestData[key];

                    // TODO check if it could be more in reality? username[] ?
                    if (arVal && arVal.length) {
                        val = arVal[0];
                    }

                    cnt++;
                }
            }

            if (cnt > 1) {
                // TODO handle?
                console.log('Found multiple ' + type + ' .. used last.');
            }

            return val;
        },

        /**
         * Get the form data
         * @returns {{user: {}, password: {}}|form_data|{user, password}|*}
         */
        getFormData: function () {
            return this.form_data;
        }
    },
    data() {
        return {
            // TODO move
            PASSWORD_REGEX: /pass|pw|passwort/gi,
            USER_REGEX: /user|benutzer|login|email/gi,

            form_data: {user: {},password: {}},

            formRequestData: '',
        }
    }
}
