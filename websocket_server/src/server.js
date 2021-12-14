module.exports = class Server {
    constructor(ownerId, ownerName, name, examples) {
        this.ownerId = ownerId;
        this.ownerName = ownerName;
        this.name = name;
        this.examples = examples;
    }

    clientView(){
        return {ownerId: this.ownerId, ownerName: this.ownerName, name: this.name};
    }
}