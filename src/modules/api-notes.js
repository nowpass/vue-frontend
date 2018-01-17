import axios from 'axios'
import ApiBase from "./api-base";

export const GET = '/api/v1/notes';
export const POST = '/api/v1/notes';
export const DELETE = '/api/v1/notes/';

export default class extends ApiBase {

    constructor(apiUrl, apiKey) {
        super(apiUrl, apiKey);

        this.loadUrl = this.apiUrl + GET;
    }

    /**
     * Store an note
     * @param noteToSave {object}
     * @param resolve {function}
     * @param fail {function}
     */
    store(noteToSave, resolve, fail) {
        // Clone note, as we have to delete things (like clear text)
        let note = JSON.parse(JSON.stringify(noteToSave));

        let method = 'post';

        let url = this.apiUrl + POST;

        // Update
        if (note.id) {
            method = 'patch';
            url = url + '/' + note.id;
        }

        // Let's make sure we don't expose unwanted information..
        delete(note.clearContent);

        // Make sure no spaces are left
        note.title = note.title.trim();

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
