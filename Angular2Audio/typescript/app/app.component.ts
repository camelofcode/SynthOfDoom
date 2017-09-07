import { Component, OnInit, ViewChild } from '@angular/core';
import { AudioContextService } from './services/audioContext.service';
import { FxComponent } from './components/fx.component';
import { LfoComponent } from './components/lfo.component';

@Component({
    selector: 'my-app',
    template: `
<oscillator name="Oscillator 1" class="section" #oscillator1></oscillator>
<oscillator name="Oscillator 2" class="section" #oscillator2></oscillator>
<oscillator name="Oscillator 3" class="section" #oscillator3></oscillator>
<noise class="section" #noise></noise>
<mixer class="section" #mixer></mixer>
<envelope class="section" #envelope></envelope>
<biquad-filter class="section" #filter></biquad-filter>
<lfo name="Lfo 1" class="section" #lfo1></lfo>
<lfo name="Lfo 2" class="section" #lfo2></lfo>
<lfo name="Lfo 3" class="section" #lfo3></lfo>
<delay class="section" #delay></delay>
`
})
export class AppComponent implements OnInit  {
    private readonly audioContextService: AudioContextService;
    private readonly audioContext: AudioContext;

    @ViewChild('oscillator1')
    private oscillator1: IAudioNodeComponent;

    @ViewChild('oscillator2')
    private oscillator2: IAudioNodeComponent;

    @ViewChild('oscillator3')
    private oscillator3: IAudioNodeComponent;

    @ViewChild('noise')
    private noise: IAudioNodeComponent;

    @ViewChild('envelope')
    private envelope: IAudioNodeComponent;

    @ViewChild('filter')
    private filter: IAudioNodeComponent;

    @ViewChild('mixer')
    private mixer: IMultiInputAudioNodeComponent;

    @ViewChild('delay')
    private delay: FxComponent;

    @ViewChild('lfo1')
    private lfo1: LfoComponent;

    @ViewChild('lfo2')
    private lfo2: LfoComponent;

    @ViewChild('lfo3')
    private lfo3: LfoComponent;

    constructor(audioContextService: AudioContextService) {
        this.audioContextService = audioContextService;
        this.audioContext = this.audioContextService.context();
    }

    ngOnInit(): void {
        this.mixer.addChannel(this.oscillator1.node(), 'Oscillator 1');
        this.mixer.addChannel(this.oscillator2.node(), 'Oscillator 2');
        this.mixer.addChannel(this.oscillator3.node(), 'Oscillator 3');
        this.mixer.addChannel(this.noise.node(), 'Noise');

        this.mixer.output().connect(this.envelope.node());

        this.envelope.node().connect(this.filter.node());

        this.filter.node().connect(this.delay.input());
        this.delay.node().connect(this.audioContext.destination);

        this.filter.registerTargets('Filter');
        this.oscillator1.registerTargets('Oscillator 1');
        this.oscillator2.registerTargets('Oscillator 2');
        this.oscillator3.registerTargets('Oscillator 3');
        this.lfo1.loadTargets();
        this.lfo2.loadTargets();
        this.lfo3.loadTargets();
    }
}