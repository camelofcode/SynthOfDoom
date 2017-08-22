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
    private readonly audioContext: AudioContextService;
    private readonly noiseGenerator: AudioBufferSourceNode;

    //https://noisehack.com/generate-noise-web-audio-api/
    constructor(audioContext: AudioContextService) {
        this.audioContext = audioContext;

        const context = this.audioContext.context();
        const bufferSize = 2 * context.sampleRate;
        const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        this.noiseGenerator = context.createBufferSource();
        this.noiseGenerator.buffer = noiseBuffer;
        this.noiseGenerator.loop = true;
        this.noiseGenerator.start(0);
    }

    node(): AudioNode {
        return this.noiseGenerator;
    }

    updateColor(type: string) {
        //TODO: this;
    }
}