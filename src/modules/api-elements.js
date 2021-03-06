import axios from 'axios'
import ApiBase from "./api-base";

export const GET_ELEMENTS = '/api/v1/elements';
export const POST_ELEMENTS = '/api/v1/elements';
export const DELETE_ELEMENTS = '/api/v1/elements/';

export default class extends ApiBase {

    constructor(apiUrl, apiKey) {
        super(apiUrl, apiKey);

        this.loadUrl = this.apiUrl + GET_ELEMENTS;
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

        axios({
            method: 'delete',
            url: url,
            data: JSON.stringify({id: id})
        })
            .then(resolve)
            .catch(fail);
    }
}
