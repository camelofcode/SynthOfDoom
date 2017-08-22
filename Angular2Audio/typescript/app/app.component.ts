import { Component, OnInit, ViewChild } from '@angular/core';
import { AudioContextService } from './services/audioContext.service';

@Component({
    selector: 'my-app',
    template: `<oscillator class="section" #oscillator1></oscillator><oscillator class="section" #oscillator2></oscillator><oscillator class="section" #oscillator3></oscillator><mixer class="section" #mixer></mixer><envelope class="section" #envelope></envelope><biquad-filter class="section" #filter></biquad-filter>`,
})
export class AppComponent implements OnInit {
    private readonly audioContextService: AudioContextService;
    private readonly audioContext: AudioContext;

    @ViewChild('oscillator1')
    private oscillator1: IAudioNodeComponent;

    @ViewChild('oscillator2')
    private oscillator2: IAudioNodeComponent;

    @ViewChild('oscillator3')
    private oscillator3: IAudioNodeComponent;

    @ViewChild('envelope')
    private envelope: IAudioNodeComponent;

    @ViewChild('filter')
    private filter: IAudioNodeComponent;

    @ViewChild('mixer')
    private mixer: IMultiInputAudioNodeComponent;

    constructor(audioContextService: AudioContextService) {
        this.audioContextService = audioContextService;
        this.audioContext = this.audioContextService.context();
    }

    ngOnInit(): void {
        this.mixer.addChannel(this.oscillator1.node(), 'Oscillator 1');
        this.mixer.addChannel(this.oscillator2.node(), 'Oscillator 2');
        this.mixer.addChannel(this.oscillator3.node(), 'Oscillator 3');

        this.mixer.output().connect(this.envelope.node());

        this.envelope.node().connect(this.filter.node());

        this.filter.node().connect(this.audioContext.destination);
    }
}