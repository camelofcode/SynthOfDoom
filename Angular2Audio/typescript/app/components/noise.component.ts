import { Component } from '@angular/core';
import { AudioContextService } from '../services/audioContext.service';

@Component({
    selector: 'noise',
    template: `<h4>Noise</h4>
<div><label>Color</label><br/>
    <select (change)="updateColor($event.target.value)">
        <option value="white" selected>White</option>
        <option value="pink">Pink</option>    
        <option value="brown">Brown</option>
    </select>
</div>`
})
export class NoiseComponent implements IAudioNodeComponent {
    private readonly context: AudioContext;

    private whiteNoiseSource: AudioBufferSourceNode;
    private pinkNoiseSource: AudioBufferSourceNode;
    private brownNoiseSource: AudioBufferSourceNode;
    private currentGenerator: AudioNode;
    private readonly output: GainNode;

    constructor(private audioContextService: AudioContextService) {
        this.context = audioContextService.context();
        this.output = this.context.createGain();
        this.output.gain.value = 1.0;

        this.initWhiteNoise();
        this.initPinkNoise();
        this.initBrownNoise();

        this.currentGenerator = this.whiteNoiseSource;
        this.currentGenerator.connect(this.output);
    }


    node(): AudioNode {
        return this.output;
    }

    updateColor(type: string) {
        this.currentGenerator.disconnect(this.output);

        switch (type) {
            case 'white':
                {
                    this.currentGenerator = this.whiteNoiseSource;
                    break;
                }
            case 'pink':
                {
                    this.currentGenerator = this.pinkNoiseSource;
                    break;
                }
            case 'brown':
                {
                    this.currentGenerator = this.brownNoiseSource;
                    break;
                }
            default: this.currentGenerator = this.whiteNoiseSource;
        }

        this.currentGenerator.connect(this.output);
    }

    private initWhiteNoise() {
        this.whiteNoiseSource = this.context.createBufferSource();

        this.initNoise(this.whiteNoiseSource, (output: Float32Array, bufferSize: Number) => {
            //https://noisehack.com/generate-noise-web-audio-api/
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
        });
    }

    private initPinkNoise() {
        this.pinkNoiseSource = this.context.createBufferSource();

        this.initNoise(this.pinkNoiseSource, (output: Float32Array, bufferSize: Number) => {
            //http://www.musicdsp.org/files/pink.txt
            var b0: number, b1: number, b2: number, b3: number, b4: number, b5: number, b6: number;
            b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                output[i] *= 0.11;
                b6 = white * 0.115926;
            }
        });
    }

    private initBrownNoise() {
        this.brownNoiseSource = this.context.createBufferSource();

        this.initNoise(this.brownNoiseSource, (output: Float32Array, bufferSize: Number) => {
            //https://noisehack.com/generate-noise-web-audio-api/
            var lastOut: number = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5;
            }
        });
    }

    private initNoise(source: AudioBufferSourceNode, generator: Function) {
        const bufferSize = 2 * this.context.sampleRate;
        const noiseBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        generator(output, bufferSize);

        source.buffer = noiseBuffer;
        source.loop = true;
        source.start(0);
    }
}