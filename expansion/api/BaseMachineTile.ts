interface IMachineBaseData extends IMachineData {
    progress: number,
    progressMax: number,
    basePower: number,
    inputAmount: number
}

interface IMachineBaseTile<T extends IMachineBaseData> extends IMachineTile<T> {
    power?: number;

    start?(): boolean;

    isActive?(): boolean;

    finish?();

    postTick?();
}

function BaseMachineTile<T extends IMachineBaseData>(prototype: IMachineBaseTile<T>): IMachineBaseTile<T> {
    prototype = MachineTileEntity<T>(prototype);

    let defaultValues = prototype.defaultValues;
    defaultValues.basePower = 20;
    defaultValues.progress = 0;
    defaultValues.progressMax = 0;
    defaultValues.inputAmount = 0;

    if (!prototype.tick) {
        prototype.tick = function (this: IMachineBaseTile<T>) {
            if (this.isActive()) {
                if (this.data.progress >= this.data.progressMax) {
                    this.finish();
                    if (!this.start()) {
                        this.data.progress = 0;
                        this.data.progressMax = 0;
                        this.data.inputAmount = 0;
                        this.power = 0;
                        this.refreshModel();
                    }
                } else {
                    this.power = MachineRegistry.calcEnergy(this.data.basePower, this.data.energy);
                    this.data.energy -= this.power;
                    this.data.progress += this.power;
                }
            } else {
                if (this.start()) {
                    this.refreshModel();
                }
            }

            this.container.setScale("energyScale", this.data.energy / this.getEnergyStorage());
            this.container.setScale("progressScale", this.data.progress / this.data.progressMax);
            this.container.setScale("speedScale", (this.power / this.data.basePower) || 0);
            this.postTick();
        }
    }

    if (!prototype.postTick) {
        prototype.postTick = function () {

        };
    }

    if (!prototype.isActive) {
        prototype.isActive = function (this: IMachineBaseTile<T>) {
            if (this.data.progress) {
                let source = this.container.getSlot("slotSource");
                if (!source.id || source.count < this.data.inputAmount) {
                    this.data.progress = 0;
                    this.data.progressMax = 0;
                    this.data.inputAmount = 0;
                    this.power = 0;
                    this.refreshModel();
                    return false;
                }

                return true;
            }

            return false;
        }
    }

    if (!prototype.start) {
        prototype.start = function () {
            return false;
        };
    }

    return prototype;
}