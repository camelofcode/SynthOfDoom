//Based On https://github.com/spheras/knob
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

@Component({
    template: `
<div #knob class="knob"></div>
`,
    styles: [`
    .knob{
        width:100%;
        height:100%;
        background-size: contain;
        cursor:pointer;
    }
`],
    selector: 'knob'
})

export class KnobComponent {
    @Input('min') min: number = 0;
    @Input('max') max: number = 0;
    @Input('value') meterValue: number = 0;
    @Input('startDegree') startDegree: number = 200;
    @Input('endDegree') endDegree: number = 120;
    @Input('intensive') intensive: boolean = true;
    @Output('change') change: EventEmitter<number> = new EventEmitter<number>(false);
    @ViewChild('knob') knobDiv: ElementRef;

    private meterRotation: number = 0;
    private tmpMeterRotation: number = 0;
    private startX: number = 0;
    private startY: number = 0;
    private maxDistance: number = 0;

    constructor() {
        this.maxDistance = document.body.clientHeight;
        if (document.body.clientWidth > this.maxDistance) {
            this.maxDistance = document.body.clientWidth;
        }
        this.maxDistance = Math.round((this.maxDistance * 10) / 100);
    }

    ngAfterViewInit() {
        this.knobDiv.nativeElement.addEventListener('mousedown', (e: any) => { this.setChangeListener(e); });
        this.knobDiv.nativeElement.addEventListener('touchstart', (e: any) => { this.setChangeListener(e); });
        this.calculateInitialValue();
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

    public setInitialValue(value: number) {
        this.meterValue = value;
        this.calculateInitialValue();
    }

    private calculateInitialValue() {
        const norm: number = this.meterValue - this.min;
        const percent = norm * 100 / (this.max - this.min);
        const maxdeg = this.getMaxDegrees();
        let rot = percent * maxdeg / 100;
        this.meterRotation = rot % 360;
        rot = rot + this.startDegree;
        this.knobDiv.nativeElement.style.transform = 'rotate(' + (rot) + 'deg)';
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
        this.tmpMeterRotation = newValue;

        this.knobDiv.nativeElement.style.transform = 'rotate(' + (newValue + this.startDegree) + 'deg)';

        this.meterValue = (100 * newValue) / maxDegrees;
        const norm = this.max - this.min;
        this.meterValue = Math.round(((norm * this.meterValue) / 100) + this.min);

        if (this.intensive) {
            this.change.emit(this.meterValue);
        }
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
                this.change.emit(this.meterValue);
            }
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            this.startX = 0;
            this.startY = 0;
            this.meterRotation = this.tmpMeterRotation;
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
}