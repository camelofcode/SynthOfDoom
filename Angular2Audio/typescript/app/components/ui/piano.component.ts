import { Component } from '@angular/core';

@Component({
    selector: 'piano',
    template: `
<div class="key white">
    <div class="key black"></div>
</div>
<div class="key white">    
        <div class="key black"></div>
    </div>

<div class="key white"></div>
<div class="key white">    
        <div class="key black"></div>
    </div>

<div class="key white">    
        <div class="key black"></div>
    </div>

<div class="key white">    
        <div class="key black"></div>
    </div>

<div class="key white"></div>
<div class="key white">
                <div class="key black"></div>
            </div>
<div class="key white">    
        <div class="key black"></div>
    </div>

<div class="key white"></div>
<div class="key white">    
        <div class="key black"></div>
    </div>

<div class="key white">    
        <div class="key black"></div>
    </div>

<div class="key white">    
        <div class="key black"></div>
    </div>

<div class="key white"></div>
`,
    styles: [`
.key {
            outline: 1px solid #777;
        }
        .white {
            position: relative;
            width: 40px;
            height: 180px;
            display: inline-block;
            margin-right: -3px;
            background-color: #fff;
        }
        .black {
            position: relative;
            background-color: #000;
            width: 24px;
            height: 100px;
            margin-left: 28px;
            z-index: 1;
        }
        
        .highlight {
            background-color: red;
        }
`]
})

export class PianoComponent {

}