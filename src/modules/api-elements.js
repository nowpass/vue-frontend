import axios from 'axios'

export const GET_ELEMENTS = '/api/v1/elements';
export const POST_ELEMENTS = '/api/v1/elements';
export const DELETE_ELEMENTS = '/api/v1/elements/';

export default class {
    constructor(apiUrl, apiKey) {
        console.log(apiUrl, apiKey);

        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.setDefault();
    }

    setDefault() {
        axios.defaults.headers['Content-Type'] = 'application/vnd.api+json';
        axios.defaults.headers['Accept'] = 'application/vnd.api+json';
        axios.defaults.headers['api-key'] = this.apiKey;
    }

    /**
     * Load elements
     * @param filters {object}
     * @param resolve {function}
     * @param fail {function}
     */
    load(filters = {
                     filterSearch: "",
                     orderBy: "id ASC",
                     offset: 0,
                     limit: 100
                 },
                 resolve,
                 fail) {

        let url = this.apiUrl + GET_ELEMENTS;

        console.log(url);

        let parts = [];

        // Filter Search
        if (filters.filterSearch) {
            parts.push('search=' + filters.filterSearch);
        }

        // Add Ordering
        parts.push('order_by=' + filters.orderBy);

        // Limit / Ofset
        parts.push('offset=' + filters.offset);
        parts.push('limit=' + filters.limit);

        // Build URL (TODO optimize)
        for (let i = 0; i < parts.length; i++) {
            let glue = (i === 0) ? '?' : '&';

            url += glue + parts[i];
        }

        // Encode possible special chars
        url = encodeURI(url);

        // Query complete
        console.log('Querying ' + url);


        axios({
            method: 'get',
            url: url,
        })
          .then(resolve)
          .catch(fail);
    }

    /**
     * Store an element
     * @param elementToSave {object}
     * @param resolve {function}
     * @param fail {function}
     */
    store(elementToSave, resolve, fail) {
        // Clone element, as we have to delete things (like clear text password)
        let element = JSON.parse(JSON.stringify(elementToSave));

        let method = 'post';

        let url = this.apiUrl + POST_ELEMENTS;

        // Update
        if (element.id) {
            method = 'patch';
            url = url + '/' + element.id;
        }

        // Let's make sure we don't expose unwanted information..
        delete(element.clearPassword);
        delete(element.unlocked);

        // Make sure no spaces are left
        element.title = element.title.trim();

        axios({
            method: method,
            url: url,
            data: JSON.stringify(element)
        })
            .then(resolve)
            .catch(fail);
    }

    /**
     * Delete an element
     * @param id {number}
     * @param resolve {function}
     * @param fail {function}
     */
    delete(id, resolve, fail) {
        let url = this.apiUrl + DELETE_ELEMENTS + id;

        console.log('Deleting ' + id + ' at ' + url);

        axios({
            method: 'delete',
            url: url,
            data: JSON.stringify({id: id})
        })
            .then(resolve)
            .catch(fail);
    }
}
