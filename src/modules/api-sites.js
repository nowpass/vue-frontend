import axios from 'axios'
import ApiBase from "./api-base";

export const GET = '/api/v1/sites';
export const POST = '/api/v1/sites';
export const DELETE = '/api/v1/sites/';

export default class extends ApiBase {

    constructor(apiUrl, apiKey) {
        super(apiUrl, apiKey);

        this.loadUrl = this.apiUrl + GET;
    }

    /**
     * Store an site
     * @param siteToSave {object}
     * @param resolve {function}
     * @param fail {function}
     */
    store(siteToSave, resolve, fail) {
        // Clone note, as we have to delete things (like clear text)
        let site = JSON.parse(JSON.stringify(siteToSave));

        let method = 'post';

        let url = this.apiUrl + POST;

        // Update
        if (site.id) {
            method = 'patch';
            url = url + '/' + site.id;
        }

        axios({
            method: method,
            url: url,
            data: JSON.stringify(note)
        })
            .then(resolve)
            .catch(fail);
    }

    /**
     * Delete a note
     * @param id {number}
     * @param resolve {function}
     * @param fail {function}
     */
    delete(id, resolve, fail) {
        let url = this.apiUrl + DELETE + id;

        axios({
            method: 'delete',
            url: url,
            data: JSON.stringify({id: id})
        })
            .then(resolve)
            .catch(fail);
    }
}
