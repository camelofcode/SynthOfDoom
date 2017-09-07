import { Injectable } from '@angular/core';
import { LfoTarget } from '../models/lfoTarget';
import { LfoConnectionRequest } from '../models/lfoConnectionRequest';
import { LfoConnectionResponse } from '../models/lfoConnectionResponse';

@Injectable()
export class LfoTargetService {

    private readonly targets: Array<LfoTarget> = new Array<LfoTarget>();

    registerTarget(target: LfoTarget): void {
        if (!this.getTargetById(target.id)) {
            this.targets.push(target);
        }
    }

    getTargets(): Array<LfoTarget> {
        return this.targets;
    }

    connectTarget(request: LfoConnectionRequest): LfoConnectionResponse {
        const target = this.getTargetById(request.id);
        request.lfo.connect(target.parameter);
        return new LfoConnectionResponse(target.minAmplitude, target.maxAmplitude);
    }

    disconnectTarget(request: LfoConnectionRequest): void {
        const target = this.getTargetById(request.id);
        request.lfo.disconnect(target.parameter);
    }

    private getTargetById = (id: string): LfoTarget => {
        for (let i = 0; i < this.targets.length; i++) {
            if (this.targets[i].id === id) {
                return this.targets[i];
            }
        }
        return null;
    }
}