import axios from 'axios'

export default class ApiBase {
    constructor(apiUrl, apiKey) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.setDefaults();
    }

    setDefaults() {
        axios.defaults.headers['Content-Type'] = 'application/vnd.api+json';
        axios.defaults.headers['Accept'] = 'application/vnd.api+json';
        axios.defaults.headers['api-key'] = this.apiKey;
    }

    /**
     * Load
     * @param filters {object}
     * @param resolve {function}
     * @param fail {function}
     */
    load(filters = {
                     search: "",
                     order_by: "id ASC",
                     offset: 0,
                     limit: 100
                 },
                 resolve,
                 fail) {

        let url = this.loadUrl;

        let cnt = 0;

        for (let key of Object.keys(filters)) {
            let glue = (cnt === 0) ? '?' : '&';

            url += glue + key + '=' + filters[key];

            cnt++;
        }

        // Encode possible special chars
        this.url = encodeURI(url);

        axios({
            method: 'get',
            url: url,
        })
          .then(resolve)
          .catch(fail);
    }
}
