import { Component, ChangeDetectorRef } from '@angular/core';
import { ControlChangeService } from '../../services/controlChange.service';
import { ControlChangeTarget } from '../../models/controlChangeTarget';

@Component({
    selector: 'midi-learn',
    template: `<div><label>Midi Learn Target</label><br/>
    <select #selectedTarget>
        <option *ngFor="let target of targets" value="{{target.id}}">{{target.displayName}}</option>  
    </select>
<button (click)="startLearn(selectedTarget.value)" *ngIf="!learning">Learn</button>
<button (click)="cancelLearn()" *ngIf="learning">Cancel</button>
</div>
`
})

export class MidiLearnComponent {
    private controlChangeService: ControlChangeService;
    private changeDetector: ChangeDetectorRef;
    private targets: Array<ControlChangeTarget> = new Array<ControlChangeTarget>();
    learning: boolean = false;

    constructor(controlChangeService: ControlChangeService, changeDetector: ChangeDetectorRef) {
        this.controlChangeService = controlChangeService;
        this.changeDetector = changeDetector;

        this.controlChangeService.learningStopped$.subscribe(() => {
            this.learning = false;
            this.changeDetector.detectChanges();
        });
    }

    startLearn(id: String): void {
        this.learning = true;
        this.changeDetector.detectChanges();

        this.controlChangeService.beginLearn(this.targets.find(target => target.id === id));
    }

    cancelLearn(): void {
        this.controlChangeService.cancelLearn();
    }

    loadTargets(): void {
        this.targets = new Array<ControlChangeTarget>();

        const targets = this.controlChangeService.getTargets();
        for (let i = 0; i < targets.length; i++) {
            this.targets.push(targets[i]);
        }
    }
}