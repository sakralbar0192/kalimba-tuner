import { FFT_SIZE, AVERAGE_MAX_VALUE, AVERAGE_MIN_VALUE, AVERAGE_VALUE, PHASES } from "../const/const";

export class FrequencyReceiver {
    construtor() {
        this.samplingRate = null;
        this.waveFormArray = [];
        this.animationId = null;
        this.waveFormArray = [];
        this.audioContext = null;
        this.analyser = null;
        this.currentFrequency = null;
    }    

    isItemOnMiddleLine(item) {
        return (item === AVERAGE_MAX_VALUE || item === AVERAGE_MIN_VALUE)
    }
     
    isItemInPhase(item) {
        return item > AVERAGE_VALUE;
    }
     
    determinePhase(item) {
        return this.isItemOnMiddleLine(item) 
            ? PHASES.middle
            : this.isItemInPhase(item)
                ? PHASES.phase
                : PHASES.antiphase;
    }
     
    calculateFrequency(data) {
        const duration = (data.waveStart.length/2) + data.phase.length + data.waveMiddle.length + data.antiphase.length + data.waveEnd.length/2;
        this.currentFrequency = 1 / (duration / 44100);
    }

    async initializeMediaServices(audioStream) {
        const audioContext = new AudioContext();
        this.analyser = audioContext.createAnalyser();
        this.analyser.fftSize = FFT_SIZE;

        this.samplingRate = audioContext.sampleRate;
        const bufferLength = this.analyser.frequencyBinCount;

        this.waveFormArray = new Uint8Array(bufferLength);

        const source = audioContext.createMediaStreamSource(audioStream);
        source.connect(this.analyser);
    }    
    
    listening() {
        this.currentFrequency = 0;

        this.analyser.getByteTimeDomainData(this.waveFormArray);

        let accumulatedValues = [], compressedWaveFormArray = [], phase;

        this.waveFormArray.forEach((currentItem, currentIndex) => {
            if (currentIndex === 0) {
                phase = this.determinePhase(currentItem)
                accumulatedValues.push(currentItem);
                return;
            } else if (
                (this.isItemInPhase(currentItem) && phase === PHASES.phase) ||
                (this.isItemOnMiddleLine(currentItem) && phase === PHASES.middle) ||
                (!this.isItemInPhase(currentItem) && phase === PHASES.antiphase)
            ) {
                accumulatedValues.push(currentItem);
                return;
            } else if (
                (!this.isItemInPhase(currentItem) && phase === PHASES.phase) ||
                (!this.isItemOnMiddleLine(currentItem) && phase === PHASES.middle) ||
                (this.isItemInPhase(currentItem) && phase === PHASES.antiphase)
            ) {
                const item = {
                    length: accumulatedValues.length,
                    phase: phase,
                    amplitude: phase !== PHASES.middle
                    ? phase === PHASES.phase
                        ? Math.max.apply (null, accumulatedValues) - AVERAGE_VALUE
                        : AVERAGE_VALUE - Math.min.apply (null, accumulatedValues)
                    : null,
                    
                };
                
                compressedWaveFormArray.push(item);
                accumulatedValues = [];

                phase = this.determinePhase(currentItem);
                accumulatedValues.push(currentItem);
            }
        });

        while (compressedWaveFormArray.length > 5) {
            let phaseFinded = false, antiphaseFinded = false, dataForFrequencyCalculation = {
                waveStart: null,
                waveMiddle: null,
                waveEnd: null,
                phase: null,
                antiphase: null
            };

            dataForFrequencyCalculation.waveStart = compressedWaveFormArray.find(item => {
                return item.phase === PHASES.middle
            });
            
            compressedWaveFormArray = compressedWaveFormArray.slice(compressedWaveFormArray.indexOf(dataForFrequencyCalculation.waveStart));

            if (compressedWaveFormArray.length < 5) break;            

            if (compressedWaveFormArray[1].phase === PHASES.phase) {
                phaseFinded = true;
                dataForFrequencyCalculation.phase = compressedWaveFormArray[1];
            } else if (compressedWaveFormArray[1].phase === PHASES.antiphase) {
                antiphaseFinded = true;
                dataForFrequencyCalculation.antiphase = compressedWaveFormArray[1];
            };

            if (compressedWaveFormArray[2].phase === PHASES.middle) {
                dataForFrequencyCalculation.waveMiddle = compressedWaveFormArray[2];
            };

            if (compressedWaveFormArray[3].phase === PHASES.phase && antiphaseFinded) {
                phaseFinded = true;
                dataForFrequencyCalculation.phase = compressedWaveFormArray[3];
            } else if (compressedWaveFormArray[3].phase === PHASES.antiphase && phaseFinded) {
                antiphaseFinded = true;
                dataForFrequencyCalculation.antiphase = compressedWaveFormArray[3];
            };

            if (compressedWaveFormArray[4].phase === PHASES.middle) {
                dataForFrequencyCalculation.waveEnd = compressedWaveFormArray[4];
            };

            if (
                (dataForFrequencyCalculation.phase || dataForFrequencyCalculation.phase !== null) &&
                (dataForFrequencyCalculation.antiphase || dataForFrequencyCalculation.antiphase !== null) &&
                (dataForFrequencyCalculation.waveStart || dataForFrequencyCalculation.waveStart !== null) &&
                (dataForFrequencyCalculation.waveMiddle || dataForFrequencyCalculation.waveMiddle !== null) &&
                (dataForFrequencyCalculation.waveEnd || dataForFrequencyCalculation.waveEnd !== null) &&
                dataForFrequencyCalculation.phase.amplitude === dataForFrequencyCalculation.antiphase.amplitude &&
                dataForFrequencyCalculation.phase.amplitude > 5
            ) {
                this.calculateFrequency(dataForFrequencyCalculation);
                compressedWaveFormArray = compressedWaveFormArray.slice(dataForFrequencyCalculation.waveMiddle - 1);
            }

            compressedWaveFormArray = compressedWaveFormArray.slice(1);
        }
    }
}