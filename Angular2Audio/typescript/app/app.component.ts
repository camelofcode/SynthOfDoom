import { Component, OnInit, ViewChild } from '@angular/core';
import { AudioContextService } from './services/audioContext.service';

@Component({
    selector: 'my-app',
    template: `<oscillator #oscillator1></oscillator><oscillator #oscillator2></oscillator><envelope #envelope1></envelope><biquad-filter #filter1></biquad-filter>`
})
export class AppComponent implements OnInit {
    private readonly audioContextService: AudioContextService;
    private readonly audioContext: AudioContext;

    @ViewChild('oscillator1')
    private oscillator1: IAudioNodeComponent;

    @ViewChild('oscillator2')
    private oscillator2: IAudioNodeComponent;

    @ViewChild('envelope1')
    private envelope1: IAudioNodeComponent;

    @ViewChild('filter1')
    private filter: IAudioNodeComponent;

    constructor(audioContextService: AudioContextService) {
        this.audioContextService = audioContextService;
        this.audioContext = this.audioContextService.context();
    }

    ngOnInit(): void {
        this.oscillator1.node().connect(this.envelope1.node());
        this.oscillator2.node().connect(this.envelope1.node());
        this.envelope1.node().connect(this.filter.node());
        this.filter.node().connect(this.audioContext.destination);
    }
}