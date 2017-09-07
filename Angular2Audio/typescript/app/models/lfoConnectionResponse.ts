export class LfoConnectionResponse {
    minAmplitude: number;
    maxAmplitude: number;

    constructor(minAmplitude: number, maxAmplitude: number) {
        this.minAmplitude = minAmplitude;
        this.maxAmplitude = maxAmplitude;
    }
}