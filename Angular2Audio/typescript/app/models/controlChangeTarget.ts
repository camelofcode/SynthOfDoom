export class ControlChangeTarget {
    id: string;
    displayName: string;
    update: Function;

    constructor(id: string, displayName: string, update: Function) {
        this.id = id;
        this.displayName = displayName;
        this.update = update;
    }
}