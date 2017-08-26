
import { AudioContextService } from '../services/audioContext.service';
import Utilities from '../supporting/utilities';

export abstract class FxComponent   {

    protected context: AudioContext;
    protected abstract audioNode: AudioNode; 
    private inNode: GainNode;
    private wet: GainNode;
    private dry: GainNode;
    private output: GainNode;

    node(): AudioNode {
        this.inNode.connect(this.dry);
        this.inNode.connect(this.audioNode);
        this.audioNode.connect(this.wet);
        this.wet.connect(this.output);
        this.dry.connect(this.output);

        return this.output;
    }
    input(): AudioNode { return this.inNode; }

    protected constructor(private readonly audioContextService: AudioContextService) {
        this.context = audioContextService.context();
        this.inNode = this.context.createGain();
        this.dry = this.context.createGain();
        this.wet = this.context.createGain();
        this.output = this.context.createGain();
    }

    updateMix(value: number) {
        const scaled = Utilities.scaleFromPercent(value, 0, 1);
        this.wet.gain.setValueAtTime(scaled, 0);
        this.dry.gain.setValueAtTime(1.0 - scaled, 0);
    }
}