//Based On https://github.com/spheras/knob
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ControlChangeService } from '../../services/controlChange.service';
import { ControlChangeTarget } from '../../models/controlChangeTarget';

@Component({
    selector: 'knob',
    template: `
<div class="knob-background">
    <div #knob class="knob-handle"></div>
</div>
<label class="knob-label">{{label}}</label>
<label class="knob-label">{{labelValue}} {{unit}}</label>
`,
    styles: [`
.knob-background{
    background:url('/skins/skin1_back.svg');    
    background-size: contain;
    background-repeat: no-repeat;
    width: 30px;
    height: 30px;
    display: inline-block;
}
.knob-handle{
    background:url('/skins/skin1_front.svg');
    background-size: contain;    
    background-repeat: no-repeat;
    width: 100%;
    height: 100%;
    cursor:pointer;
}
.knob-label{
    font-size: 10px;
    display: block;
}
`]
})

export class KnobComponent {
    private meterRotation: number = 0;
    private tempMeterRotation: number = 0;
    private startX: number = 0;
    private startY: number = 0;
    private maxDistance: number = 0;
    private min: number = 0;
    private max: number = 100;
    private percentValue: number = 50;
    private labelValue: number = 50;
    private startDegree: number = 200;
    private endDegree: number = 120;
    private intensive: boolean = true;
    private loValue: number;
    private hiValue: number;
    private updateFunction: Function;

    private controlChangeService: ControlChangeService;
    private changeDetector: ChangeDetectorRef;

    @Input('label')
    label: String = 'label';

    @Input('unit')
    unit: String = '';

    @ViewChild('knob')
    knobDiv: ElementRef;

    constructor(controlChangeService: ControlChangeService, changeDetector: ChangeDetectorRef) {
        this.controlChangeService = controlChangeService;
        this.changeDetector = changeDetector;

        this.maxDistance = document.body.clientHeight;
        if (document.body.clientWidth > this.maxDistance) {
            this.maxDistance = document.body.clientWidth;
        }
        this.maxDistance = Math.round((this.maxDistance * 10) / 100);
    }

    init(component: String, lo: number, hi: number, initial: number, update: Function) {
        this.loValue = lo;
        this.hiValue = hi;
        this.updateFunction = update;

        this.percentValue = this.scaleToPercent(initial, this.loValue, this.hiValue);

        this.calculateInitialValue();
        this.setLabel();

        this.controlChangeService.registerTarget({
            id: component + "" + this.label,
            displayName: component + " " + this.label,
            update: (value: number) => {
                this.percentValue = value;
                this.calculateInitialValue();
                this.setLabel();
                this.setValueFromPercent(this.percentValue);
            }
        } as ControlChangeTarget);
    }

    ngAfterViewInit() {
        this.knobDiv.nativeElement.addEventListener('mousedown', (e: any) => { this.setChangeListener(e); });
        this.knobDiv.nativeElement.addEventListener('touchstart', (e: any) => { this.setChangeListener(e); });

        this.setLabel();
    }

    getMouseDifference(e: any) {
        const mousepos = this.getMousePosition(e);
        const yMovement = mousepos.clientY - this.startY;
        const xMovement = mousepos.clientX - this.startX;
        return yMovement + xMovement;
    }

    getMaxDegrees(): number {
        if (this.endDegree > this.startDegree) {
            return this.endDegree - this.startDegree;
        } else if (this.endDegree < this.startDegree) {
            return 360 + this.endDegree - this.startDegree;
        } else {
            return 0;
        }
    }

    calculateChange(mousePositionChange: number) {
        const maxDegrees = this.getMaxDegrees();
        let newValue = mousePositionChange * maxDegrees / this.maxDistance;
        newValue = (newValue + this.meterRotation);

        if (newValue < 0) {
            newValue = 0;
        } else if (newValue > maxDegrees) {
            newValue = maxDegrees;
        }
        this.tempMeterRotation = newValue;

        this.knobDiv.nativeElement.style.transform = `rotate(${newValue + this.startDegree}deg)`;

        this.percentValue = (100 * newValue) / maxDegrees;
        const norm = this.max - this.min;
        this.percentValue = Math.round(((norm * this.percentValue) / 100) + this.min);

        if (this.intensive) {
            this.setValueFromPercent(this.percentValue);
        }

        this.setLabel();
    }

    getMousePosition(event: any): any {
        const result = { clientX: 0, clientY: 0 };
        if (event.touches) {
            result.clientX = event.touches[0].clientX;
            result.clientY = event.touches[0].clientY;
        } else {
            result.clientX = event.clientX;
            result.clientY = event.clientY;
        }
        return result;
    }

    setChangeListener(e: any) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        if (e.preventDefault) {
            e.preventDefault();
        }
        const mousepos = this.getMousePosition(e);
        this.startX = mousepos.clientX;
        this.startY = mousepos.clientY;

        var funcMove = (e: any) => {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            var change = this.getMouseDifference(e);
            this.calculateChange(change);
        }

        var funcRemove = (e: any) => {
            if (!this.intensive) {
                this.setValueFromPercent(this.percentValue);
            }
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            this.startX = 0;
            this.startY = 0;
            this.meterRotation = this.tempMeterRotation;
            document.removeEventListener('mousemove', funcMove);
            document.removeEventListener('touchmove', funcMove);
            document.removeEventListener('mouseup', funcRemove);
            document.removeEventListener('touchend', funcRemove);
        }

        document.addEventListener('mousemove', funcMove, false);
        document.addEventListener('touchmove', funcMove, false);
        document.addEventListener('mouseup', funcRemove, false);
        document.addEventListener('touchend', funcRemove, false);
    }

    private setValueFromPercent(value: number) {
        this.updateFunction(this.scaleFromPercent(value, this.loValue, this.hiValue));
    }

    private setLabel = function () {
        let value = this.unit === '%' ? this.percentValue : this.scaleFromPercent(this.percentValue, this.loValue, this.hiValue);

        this.labelValue = parseInt(value + "", 10) === value ? value : value.toFixed(2);
        this.changeDetector.detectChanges();
    }

    private calculateInitialValue() {
        const norm: number = this.percentValue - this.min;
        const percent = norm * 100 / (this.max - this.min);
        const maxdeg = this.getMaxDegrees();
        let rot = percent * maxdeg / 100;
        this.meterRotation = rot % 360;
        rot = rot + this.startDegree;
        this.knobDiv.nativeElement.style.transform = `rotate(${rot}deg)`;
    }

    private scaleFromPercent(value: number, lower: number, upper: number) {
        return ((upper - lower) * (value / 100.0)) + lower;
    }

    private scaleToPercent(value: number, lower: number, upper: number) {
        return ((value - lower) / (upper - lower)) * 100.0;
    }
}