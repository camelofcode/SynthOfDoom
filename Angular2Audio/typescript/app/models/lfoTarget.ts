export class LfoTarget {
    id: string;
    displayName: string;
    minAmplitude: number;
    maxAmplitude: number;
    parameter: AudioParam;

    constructor(id: string, displayName: string, minAmplitude: number, maxAmplitude: number, parameter: AudioParam) {
        this.id = id;
        this.displayName = displayName;
        this.minAmplitude = minAmplitude;
        this.maxAmplitude = maxAmplitude;
        this.parameter = parameter;
    }
}