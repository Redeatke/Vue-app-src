export class Message {
    constructor(username, firstName, lastName, message) {
        this.username = username
        this.firstName = firstName
        this.lastName = lastName
        this.message = message
        this.redacted = false
        this._originalText = null
    }
}
