import { AudioContextService } from '../services/audioContext.service';
import Utilities from '../supporting/utilities';

export abstract class FxComponent   {

    protected context: AudioContext;
    private readonly fxChainStart: AudioNode; 
    private readonly fxChainEnd: AudioNode; 
    private readonly inNode: GainNode;
    private readonly wet: GainNode;
    private readonly dry: GainNode;
    private readonly output: GainNode;

    node(): AudioNode {   
        return this.output;
    }

    input(): AudioNode { return this.inNode; }

    protected connectFxChain(start: AudioNode, end: AudioNode) {
        this.fxChainStart.connect(start);
        end.connect(this.fxChainEnd);
    }

    protected constructor(private readonly audioContextService: AudioContextService) {
        this.context = audioContextService.context();

        this.fxChainStart = this.context.createGain();
        this.fxChainEnd = this.context.createGain();

        this.inNode = this.context.createGain();
        this.dry = this.context.createGain();
        this.wet = this.context.createGain();
        this.output = this.context.createGain();

        this.inNode.connect(this.output);
        this.inNode.connect(this.dry);
        this.fxChainEnd.connect(this.wet);
        this.wet.connect(this.output);
    }

    updateMix(value: number) {
        const scaled = Utilities.scaleFromPercent(value, 0, 1);
        this.wet.gain.setValueAtTime(scaled, 0);
        this.dry.gain.setValueAtTime(1.0 - scaled, 0);
    }

    updateOn(event: any) {
        if (event.target.checked) {
            this.inNode.disconnect(this.output);
            this.inNode.connect(this.fxChainStart);
            this.dry.connect(this.output);

        } else {
            this.inNode.connect(this.output);
            this.inNode.disconnect(this.fxChainStart);
            this.dry.disconnect(this.output);
        }
    }
}