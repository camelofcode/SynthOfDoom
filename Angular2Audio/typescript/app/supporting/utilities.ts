export default class Utilities {
    static scaleToMidiFromPercent(value: number) {
        return Utilities.scaleFromPercent(value, 0, 127);
    }

    static scaleToPercentFromMidi(value: number) {
        return Utilities.scaleToPercent(value, 0, 127);
    }

    static scaleFromPercent(value: number, lower: number, upper: number) {
        return ((upper - lower) * (value / 100.0)) + lower;
    }

    static scaleToPercent(value: number, lower: number, upper: number) {
        return ((value - lower) / (upper - lower)) * 100.0;
    }
}