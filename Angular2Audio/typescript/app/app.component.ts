import { Component, OnInit, ViewChild } from '@angular/core';
import { AudioContextService } from './services/audioContext.service';

@Component({
    selector: 'my-app',
    template: `<h1>Hello {{name}}</h1><oscillator #oscillator1></oscillator><envelope #envelope1></envelope><biquad-filter #filter1></biquad-filter>`
})
export class AppComponent implements OnInit {
    private readonly audioContextService: AudioContextService;

    private audioContext: AudioContext;

    name = 'Angular';

    @ViewChild('oscillator1')
    private oscillator1: IAudioNodeComponent;

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
        this.envelope1.node().connect(this.filter.node());
        this.filter.node().connect(this.audioContext.destination);
    }
}
