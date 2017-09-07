import { NgModule } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { InputService } from './services/input.service';
import { MidiInputService } from './services/midi.input.service';
import { KeyboardInputService } from './services/keyboard.input.service';
import { AudioContextService } from './services/audioContext.service';
import { LfoTargetService } from './services/lfoTarget.service';

import { AppComponent }  from './app.component';
import { EnvelopeComponent } from './components/envelope.component';
import { OscillatorComponent } from './components/oscillator.component';
import { LfoComponent } from './components/lfo.component';
import { BiquadFilterComponent } from './components/biquadfilter.component';
import { NoiseComponent } from './components/noise.component';
import { DelayFxComponent } from './components/delay.fx.component';

import { MixerComponent } from './components/mixer.component';
import { KnobComponent } from './components/ui/knob.component';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ AppComponent, EnvelopeComponent, OscillatorComponent, LfoComponent, BiquadFilterComponent, NoiseComponent, DelayFxComponent, MixerComponent, KnobComponent ],
  bootstrap:    [ AppComponent ],
  providers:    [ InputService, MidiInputService, KeyboardInputService, AudioContextService, LfoTargetService ]
})
export class AppModule { }
