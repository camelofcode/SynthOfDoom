export class LfoConnectionRequest {
    id: string;
    lfo: GainNode;

    constructor(id: string, lfo: GainNode) {
        this.id = id;
        this.lfo = lfo;
    }
}