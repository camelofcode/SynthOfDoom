import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { InputService } from './services/input.service';
import { MidiInputService } from './services/midi.input.service';
import { KeyboardInputService } from './services/keyboard.input.service';

import { AppComponent }  from './app.component';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ],
  providers:    [InputService, MidiInputService, KeyboardInputService]
})
export class AppModule { }
