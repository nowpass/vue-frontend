/**
 * Wrapper around the Chrome functions
 */
export default {
    name: 'Chrome',
    methods: {
        /**
         * Send a notification to the background.js
         *
         * @param message {object}
         * @param type {string} defaults to notification
         */
        sendBrowserMessage(message, type="notification") {
            console.log('Sending ' + JSON.stringify(message));

            if (process.env.NODE_ENV === 'development') {
                console.log('In development mode - sending ' + JSON.stringify(message));
                return;
            }

            // We can't use chrome.tabs here, so communication has to go through backend.js
            chrome.extension.sendMessage({type: type, options: {message: message}}, function(response) {
                // We don't respond here, this is passed to the content script
            });
        },

        /**
         * Close the current browser tab
         */
        closeCurrentBrowserTab() {
            if (process.env.NODE_ENV === 'development') {
                this.$router.push('/');
                return;
            }

            try {
                chrome.tabs.getCurrent(function(tab) {
                    chrome.tabs.remove(tab.id, function() { });
                });
            } catch (err) {
                // Ignore, happens in some Browsers
                // TODO send to background.js
            }
        }
    }
}
