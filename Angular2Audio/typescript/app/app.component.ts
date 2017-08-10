import { Component, OnInit, ViewChild } from '@angular/core';
import { AudioContextService } from './services/audioContext.service';

@Component({
    selector: 'my-app',
    template: `<oscillator #oscillator1></oscillator><oscillator #oscillator2></oscillator><oscillator #oscillator3></oscillator><mixer #mixer></mixer><envelope #envelope></envelope><biquad-filter #filter></biquad-filter>`
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
        this.oscillator1.node().connect(this.mixer.inputs()[0]);
        this.oscillator2.node().connect(this.mixer.inputs()[1]);
        this.oscillator3.node().connect(this.mixer.inputs()[2]);

        this.mixer.output().connect(this.envelope.node());
        this.envelope.node().connect(this.filter.node());
        this.filter.node().connect(this.audioContext.destination);
    }
}