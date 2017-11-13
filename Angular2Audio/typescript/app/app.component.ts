import { Component, OnInit, ViewChild, AfterViewChecked } from '@angular/core';
import { AudioContextService } from './services/audioContext.service';
import { FxComponent } from './components/fx.component';
import { LfoComponent } from './components/lfo.component';
import { MidiLearnComponent } from './components/ui/midilearn.component';

@Component({
    selector: 'my-app',
    template: `
<div class="center">
<midi-learn #midiLearn id="midi-learn"></midi-learn>
<oscillator name="Oscillator 1" class="section" #oscillator1 id="oscillator1"></oscillator>
<oscillator name="Oscillator 2" class="section" #oscillator2  id="oscillator2"></oscillator>
<oscillator name="Oscillator 3" class="section" #oscillator3  id="oscillator3"></oscillator>
<noise class="section" #noise id="noise"></noise>
<mixer class="section" #mixer id="mixer"></mixer>
<envelope class="section" #envelope  id="envelope"></envelope>
<biquad-filter name="Filter 1" class="section" #filter1 id="filter1"></biquad-filter>
<biquad-filter name="Filter 2" class="section" #filter2 id="filter2"></biquad-filter>
<lfo name="Lfo 1" class="section" #lfo1 id="lfo1"></lfo>
<lfo name="Lfo 2" class="section" #lfo2 id="lfo2"></lfo>
<lfo name="Lfo 3" class="section" #lfo3 id="lfo3"></lfo>
<delay class="section" #delay id="delay"></delay>
<br/>
<piano id="piano"></piano>
</div>
`
})
export class AppComponent implements OnInit, AfterViewChecked  {
    private readonly audioContextService: AudioContextService;
    private readonly audioContext: AudioContext;

    @ViewChild('midiLearn')
    private midiLearn: MidiLearnComponent;

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

    @ViewChild('filter1')
    private filter1: IAudioNodeComponent;

    @ViewChild('filter2')
    private filter2: IAudioNodeComponent;

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

        this.mixer.output1().connect(this.filter1.node());
        this.mixer.output2().connect(this.filter2.node());

        this.filter1.node().connect(this.envelope.node());
        this.filter2.node().connect(this.envelope.node());

        this.envelope.node().connect(this.delay.input());
        this.delay.node().connect(this.audioContext.destination);

        this.filter1.registerTargets('Filter 1');
        this.filter2.registerTargets('Filter 2');
        this.oscillator1.registerTargets('Oscillator 1');
        this.oscillator2.registerTargets('Oscillator 2');
        this.oscillator3.registerTargets('Oscillator 3');
        this.lfo1.loadTargets();
        this.lfo2.loadTargets();
        this.lfo3.loadTargets();

    }

    ngAfterViewChecked(): void {
        this.midiLearn.loadTargets();
    }
}