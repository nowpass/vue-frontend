/**
 * Wrapper arround the window.localStorage engine
 */
export default {
    name: 'Settings',
    methods: {
        getSetting(key, def) {
            let option = window.localStorage.getItem(key);

            if (option) {
                return option;
            }
            return def;
        },

        setSetting(key, val) {
            window.localStorage.setItem(key, val);
        },

        getPassphrase() {
            return this.getSetting('passphrase', '') || this.getSetting('temporary_passphrase');
        },
    }
}
