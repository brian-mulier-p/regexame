module.exports = class Server {
    constructor(ownerId, name, examples) {
        this.ownerId = ownerId;
        this.name = name;
        this.examples = examples;
    }

    clientView(){
        return {ownerId: this.ownerId, name: this.name};
    }
}