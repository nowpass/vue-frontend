/**
 * Wrapper arround the window.localStorage engine
 */
export default {
    name: 'Settings',
    methods: {
        /**
         * Get a setting or fall back to the default option
         *
         * @param key {string}
         * @param def {string}
         * @returns {string}
         */
        getSetting(key, def) {
            let option = window.localStorage.getItem(key);

            if (option) {
                return option;
            }
            return def;
        },

        /**
         * Store a setting in the window local storage
         * @param key {string}
         * @param val {string}
         */
        setSetting(key, val) {
            window.localStorage.setItem(key, val);
        },

        /**
         * Get the passphrase (out of the temporary or normal storage)
         * @returns {string}
         */
        getPassphrase() {
            return this.getSetting('passphrase', '') || this.getSetting('temporary_passphrase');
        },

        /**
         * Clear the passphrase
         */
        clearPassphrase() {
            this.setSetting('passphrase', '');
            this.setSetting('temporary_passphrase', '');
        }
    }
}
