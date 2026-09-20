const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3WebAudio {
    constructor (runtime) {
        this.runtime = runtime;
        this.audioCtx = null;
        this.masterGain = null;
        this.filterNode = null;
        this.analyser = null;
        this.analyserData = null;

        // ADSR parameters (in seconds, sustain is level 0..1)
        this.adsr = {
            attack: 0.02,
            decay: 0.1,
            sustain: 0.7,
            release: 0.2
        };

        this.activeNodes = new Set();

        this.runtime.on('PROJECT_STOP_ALL', () => {
            this.stopAllSounds();
        });
    }

    _getAudioContext () {
        if (!this.audioCtx && typeof window !== 'undefined') {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.audioCtx = new AudioContextClass();
                this.masterGain = this.audioCtx.createGain();
                this.masterGain.gain.value = 0.5;

                this.filterNode = this.audioCtx.createBiquadFilter();
                this.filterNode.type = 'allpass';
                this.filterNode.frequency.value = 20000;

                this.analyser = this.audioCtx.createAnalyser();
                this.analyser.fftSize = 256;
                this.analyserData = new Uint8Array(this.analyser.frequencyBinCount);

                this.masterGain.connect(this.filterNode);
                this.filterNode.connect(this.analyser);
                this.analyser.connect(this.audioCtx.destination);
            }
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    _noteToFreq (noteStr) {
        const str = String(noteStr).trim().toUpperCase();
        const num = Number(str);
        if (!isNaN(num) && num > 0) {
            if (num >= 12 && num <= 127) {
                // MIDI note
                return 440 * Math.pow(2, (num - 69) / 12);
            }
            return num; // Direct Hz
        }
        const noteMap = {C: 0, 'C#': 1, DB: 1, D: 2, 'D#': 3, EB: 3, E: 4, F: 5, 'F#': 6, GB: 6, G: 7, 'G#': 8, AB: 8, A: 9, 'A#': 10, BB: 10, B: 11};
        const match = str.match(/^([A-G][#B]?)(-?\d+)$/);
        if (match) {
            const key = match[1];
            const octave = parseInt(match[2], 10);
            const semitone = noteMap[key];
            if (semitone !== undefined) {
                const midi = (octave + 1) * 12 + semitone;
                return 440 * Math.pow(2, (midi - 69) / 12);
            }
        }
        return 440;
    }

    getInfo () {
        return {
            id: 'webaudio',
            name: '進階音訊合成 (Web Audio and Synth)',
            color1: '#8B5CF6',
            color2: '#7C3AED',
            color3: '#6D28D9',
            blocks: [
                {
                    opcode: 'playTone',
                    blockType: BlockType.COMMAND,
                    text: '播放合成音調 波形: [WAVE] 音高: [FREQ] Hz 時間: [DUR] 秒',
                    arguments: {
                        WAVE: {
                            type: ArgumentType.STRING,
                            menu: 'waveMenu',
                            defaultValue: 'square'
                        },
                        FREQ: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 440
                        },
                        DUR: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.3
                        }
                    }
                },
                {
                    opcode: 'playMusicalNote',
                    blockType: BlockType.COMMAND,
                    text: '演奏音符 [NOTE] 波形: [WAVE] 持續: [DUR] 秒',
                    arguments: {
                        NOTE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'C4'
                        },
                        WAVE: {
                            type: ArgumentType.STRING,
                            menu: 'waveMenu',
                            defaultValue: 'triangle'
                        },
                        DUR: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.4
                        }
                    }
                },
                {
                    opcode: 'playNoise',
                    blockType: BlockType.COMMAND,
                    text: '播放噪聲打擊/爆炸音效 類型: [TYPE] 持續: [DUR] 秒',
                    arguments: {
                        TYPE: {
                            type: ArgumentType.STRING,
                            menu: 'noiseMenu',
                            defaultValue: 'explosion'
                        },
                        DUR: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.25
                        }
                    }
                },
                {
                    opcode: 'setADSR',
                    blockType: BlockType.COMMAND,
                    text: '設定 ADSR 包絡 起音(A): [A] 衰減(D): [D] 延音(S): [S] 釋音(R): [R]',
                    arguments: {
                        A: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.05
                        },
                        D: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.1
                        },
                        S: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.7
                        },
                        R: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.2
                        }
                    }
                },
                {
                    opcode: 'setFilter',
                    blockType: BlockType.COMMAND,
                    text: '設定音效濾波器 模式: [MODE] 截止頻率: [FREQ] Hz 諧振(Q): [Q]',
                    arguments: {
                        MODE: {
                            type: ArgumentType.STRING,
                            menu: 'filterMenu',
                            defaultValue: 'lowpass'
                        },
                        FREQ: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1200
                        },
                        Q: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 2
                        }
                    }
                },
                {
                    opcode: 'setMasterVolume',
                    blockType: BlockType.COMMAND,
                    text: '設定合成器總音量: [VOL] %',
                    arguments: {
                        VOL: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                {
                    opcode: 'stopAllSounds',
                    blockType: BlockType.COMMAND,
                    text: '停止所有合成音調'
                },
                '---',
                {
                    opcode: 'getBassEnergy',
                    blockType: BlockType.REPORTER,
                    text: '即時低音能量 (0-100)'
                },
                {
                    opcode: 'getVolumeLevel',
                    blockType: BlockType.REPORTER,
                    text: '即時音量輸出水平 (0-100)'
                },
                {
                    opcode: 'getDominantFreq',
                    blockType: BlockType.REPORTER,
                    text: '即時音訊主頻率 (Hz)'
                }
            ],
            menus: {
                waveMenu: {
                    acceptReporters: true,
                    items: [
                        {text: '方塊波 (8-Bit Square)', value: 'square'},
                        {text: '正弦波 (Sine)', value: 'sine'},
                        {text: '三角波 (Triangle)', value: 'triangle'},
                        {text: '鋸齒波 (Sawtooth)', value: 'sawtooth'}
                    ]
                },
                noiseMenu: {
                    acceptReporters: true,
                    items: [
                        {text: '爆炸震撼 (Explosion)', value: 'explosion'},
                        {text: '復古打擊鼓 (Retro Snare)', value: 'snare'},
                        {text: '雷射光束 (Laser Sweep)', value: 'laser'},
                        {text: '白噪音 (White Noise)', value: 'white'}
                    ]
                },
                filterMenu: {
                    acceptReporters: true,
                    items: [
                        {text: '低通濾波 (Lowpass - 悶音/重低音)', value: 'lowpass'},
                        {text: '高通濾波 (Highpass - 尖銳/剔除低音)', value: 'highpass'},
                        {text: '帶通濾波 (Bandpass - 收音機電話聲)', value: 'bandpass'},
                        {text: '直通關閉 (Allpass)', value: 'allpass'}
                    ]
                }
            }
        };
    }

    playTone (args) {
        const ctx = this._getAudioContext();
        if (!ctx) return;

        const wave = Cast.toString(args.WAVE);
        const freq = Math.max(20, Math.min(20000, Cast.toNumber(args.FREQ)));
        const dur = Math.max(0.01, Math.min(10, Cast.toNumber(args.DUR)));

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = wave;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Apply ADSR
        const now = ctx.currentTime;
        const a = Math.min(dur * 0.4, this.adsr.attack);
        const d = Math.min(dur * 0.4, this.adsr.decay);
        const s = this.adsr.sustain;
        const r = this.adsr.release;

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(1, now + a);
        gain.gain.linearRampToValueAtTime(s, now + a + d);
        gain.gain.setValueAtTime(s, Math.max(now + a + d, now + dur));
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur + r);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + dur + r);

        this.activeNodes.add(osc);
        osc.onended = () => {
            this.activeNodes.delete(osc);
            osc.disconnect();
            gain.disconnect();
        };
    }

    playMusicalNote (args) {
        const freq = this._noteToFreq(Cast.toString(args.NOTE));
        this.playTone({
            WAVE: args.WAVE,
            FREQ: freq,
            DUR: args.DUR
        });
    }

    playNoise (args) {
        const ctx = this._getAudioContext();
        if (!ctx) return;

        const type = Cast.toString(args.TYPE);
        const dur = Math.max(0.05, Math.min(5, Cast.toNumber(args.DUR)));
        const bufferSize = Math.floor(ctx.sampleRate * dur);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2) - 1;
        }

        if (type === 'laser') {
            // Pitch swept tone instead of pure noise
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const now = ctx.currentTime;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1500, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + dur);
            gain.gain.setValueAtTime(1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + dur);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + dur);
            this.activeNodes.add(osc);
            osc.onended = () => {
                this.activeNodes.delete(osc);
                osc.disconnect();
                gain.disconnect();
            };
            return;
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;

        const gainNode = ctx.createGain();
        const now = ctx.currentTime;
        gainNode.gain.setValueAtTime(1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + dur);

        noiseNode.connect(gainNode);
        gainNode.connect(this.masterGain);

        noiseNode.start(now);
        noiseNode.stop(now + dur);

        this.activeNodes.add(noiseNode);
        noiseNode.onended = () => {
            this.activeNodes.delete(noiseNode);
            noiseNode.disconnect();
            gainNode.disconnect();
        };
    }

    setADSR (args) {
        this.adsr.attack = Math.max(0.001, Cast.toNumber(args.A));
        this.adsr.decay = Math.max(0.001, Cast.toNumber(args.D));
        this.adsr.sustain = Math.max(0, Math.min(1, Cast.toNumber(args.S)));
        this.adsr.release = Math.max(0.001, Cast.toNumber(args.R));
    }

    setFilter (args) {
        this._getAudioContext();
        if (!this.filterNode) return;

        const mode = Cast.toString(args.MODE);
        const freq = Math.max(20, Math.min(20000, Cast.toNumber(args.FREQ)));
        const q = Math.max(0.1, Math.min(20, Cast.toNumber(args.Q)));

        this.filterNode.type = mode;
        this.filterNode.frequency.value = freq;
        this.filterNode.Q.value = q;
    }

    setMasterVolume (args) {
        this._getAudioContext();
        if (!this.masterGain) return;
        const vol = Math.max(0, Math.min(100, Cast.toNumber(args.VOL))) / 100;
        this.masterGain.gain.setValueAtTime(vol, this.audioCtx ? this.audioCtx.currentTime : 0);
    }

    stopAllSounds () {
        for (const node of this.activeNodes) {
            try {
                node.stop();
                node.disconnect();
            } catch (e) {}
        }
        this.activeNodes.clear();
    }

    getBassEnergy () {
        this._getAudioContext();
        if (!this.analyser || !this.analyserData) return 0;

        this.analyser.getByteFrequencyData(this.analyserData);
        // Low frequency bins (0 to 10)
        let sum = 0;
        const count = Math.min(10, this.analyserData.length);
        for (let i = 0; i < count; i++) {
            sum += this.analyserData[i];
        }
        return Math.round((sum / (count * 255)) * 100);
    }

    getVolumeLevel () {
        this._getAudioContext();
        if (!this.analyser || !this.analyserData) return 0;

        this.analyser.getByteFrequencyData(this.analyserData);
        let sum = 0;
        for (let i = 0; i < this.analyserData.length; i++) {
            sum += this.analyserData[i];
        }
        return Math.round((sum / (this.analyserData.length * 255)) * 100);
    }

    getDominantFreq () {
        this._getAudioContext();
        if (!this.analyser || !this.analyserData || !this.audioCtx) return 0;

        this.analyser.getByteFrequencyData(this.analyserData);
        let maxVal = -1;
        let maxIndex = 0;
        for (let i = 0; i < this.analyserData.length; i++) {
            if (this.analyserData[i] > maxVal) {
                maxVal = this.analyserData[i];
                maxIndex = i;
            }
        }
        const nyquist = this.audioCtx.sampleRate / 2;
        return Math.round((maxIndex / this.analyserData.length) * nyquist);
    }
}

module.exports = Scratch3WebAudio;
