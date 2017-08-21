export default class Utilities {
    static scaleFromPercent(value: number, lower: number, upper: number) {
        return ((upper - lower) * (value / 100.0)) + lower;
    }

    static scaleToPercent(value: number, lower: number, upper: number) {
        return ((value - lower) / (upper - lower)) * 100.0;
    }
}