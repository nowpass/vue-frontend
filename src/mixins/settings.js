/**
 * Wrapper arround the window.localStorage engine
 */
export default {
    name: 'Settings',
    methods: {
        getSetting: function (key, def) {
            let option = window.localStorage.getItem(key);

            if (option) {
                return option;
            }
            return def;
        },

        saveSetting: function (key, val) {
            window.localStorage.setItem(key, val);
        }
    }
}
