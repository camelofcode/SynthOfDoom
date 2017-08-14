import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { InputService } from './services/input.service';
import { MidiInputService } from './services/midi.input.service';
import { KeyboardInputService } from './services/keyboard.input.service';
import { AudioContextService } from './services/audioContext.service';

import { AppComponent }  from './app.component';
import { EnvelopeComponent } from './components/envelope.component';
import { OscillatorComponent } from './components/oscillator.component';
import { BiquadFilterComponent } from './components/biquadfilter.component';

import { MixerComponent } from './components/mixer.component';
import { KnobComponent } from './components/ui/knob.component';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ AppComponent, EnvelopeComponent, OscillatorComponent, BiquadFilterComponent, MixerComponent, KnobComponent ],
  bootstrap:    [ AppComponent ],
  providers:    [ InputService, MidiInputService, KeyboardInputService, AudioContextService ]
})
export class AppModule { }
