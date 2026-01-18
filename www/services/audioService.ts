

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { saveCustomDroneAudio, loadCustomDroneAudio, clearCustomDroneAudio } from './persistence';

class AudioService {
  private context: AudioContext | null = null;
  private isMuted: boolean = false;
  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private droneLfo: OscillatorNode | null = null;
  
  // Custom Audio State
  private customDroneBuffer: AudioBuffer | null = null;
  private customDroneSource: AudioBufferSourceNode | null = null;

  async init() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.context = new AudioContextClass();
        // Attempt to load custom drone audio on init
        const savedAudio = await loadCustomDroneAudio();
        if (savedAudio) {
            try {
                const arrayBuffer = this.base64ToArrayBuffer(savedAudio);
                const decoded = await this.context.decodeAudioData(arrayBuffer);
                this.customDroneBuffer = decoded;
                console.log("Loaded custom drone audio from persistence.");
            } catch (e) {
                console.error("Failed to decode saved custom drone audio, clearing it.", e);
                await clearCustomDroneAudio();
            }
        }
      }
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) this.stopDrone();
  }

  resume() {
    if (this.context && this.context.state === 'suspended') {
        this.context.resume();
    }
  }

  async setCustomDrone(file: File) {
      this.init();
      if (!this.context) return;
      try {
          const arrayBuffer = await file.arrayBuffer();
          const decoded = await this.context.decodeAudioData(arrayBuffer);
          this.customDroneBuffer = decoded;
          this.playSuccess(); // Confirmation chirp

          // Save to persistence
          const base64Audio = await this.arrayBufferToBase64(arrayBuffer);
          await saveCustomDroneAudio(base64Audio);

      } catch (e) {
          console.error("Audio Decode Failed", e);
      }
  }

  async clearCustomDrone() {
      this.stopDrone(); // Stop any active custom drone
      this.customDroneBuffer = null;
      await clearCustomDroneAudio();
      this.playClick(); // Confirmation chirp
  }

  // Helper to convert ArrayBuffer to Base64
  private arrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const blob = new Blob([buffer], { type: 'audio/webm' }); // Use a common audio type for blob conversion
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(blob);
    });
  }

  // Helper to convert Base64 to ArrayBuffer
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  playClick() {
    if (this.isMuted || !this.context) return;
    this.resume();
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    // High pass filter for crisp click
    const filter = this.context.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.context.destination);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.05, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.05);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.05);
  }

  playHover() {
    if (this.isMuted || !this.context) return;
    this.resume();
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.connect(gain);
    gain.connect(this.context.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.context.currentTime);
    
    gain.gain.setValueAtTime(0.01, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.03);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.03);
  }

  playSuccess() {
    if (this.isMuted || !this.context) return;
    this.resume();
    
    const now = this.context.currentTime;
    
    // Arpeggio
    [0, 0.1, 0.2].forEach((delay, i) => {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.connect(gain);
        gain.connect(this.context.destination);
        
        osc.type = 'triangle';
        const freq = 440 * Math.pow(1.5, i); // Fifth intervals
        osc.frequency.setValueAtTime(freq, now + delay);
        
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.1, now + delay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.6);
        
        osc.start(now + delay);
        osc.stop(now + delay + 0.6);
    });
  }

  startDrone() {
     if (this.isMuted || !this.context) return;
     if (this.droneOsc || this.customDroneSource) return; // Already playing

     this.resume();
     this.droneGain = this.context.createGain();
     this.droneGain.connect(this.context.destination);

     if (this.customDroneBuffer) {
         // Custom Sample Playback
         this.customDroneSource = this.context.createBufferSource();
         this.customDroneSource.buffer = this.customDroneBuffer;
         this.customDroneSource.loop = true;
         this.customDroneSource.connect(this.droneGain);
         
         // Custom samples usually need a bit more gain than the raw synth
         this.droneGain.gain.setValueAtTime(0.3, this.context.currentTime);
         this.customDroneSource.start();
     } else {
         // Default Synth Drone
         this.droneOsc = this.context.createOscillator();
         this.droneLfo = this.context.createOscillator();
         const lfoGain = this.context.createGain();

         this.droneOsc.connect(this.droneGain);
         
         // Setup Drone
         this.droneOsc.type = 'sawtooth';
         this.droneOsc.frequency.setValueAtTime(55, this.context.currentTime); // Low A

         // Setup LFO for pulsing effect
         this.droneLfo.frequency.setValueAtTime(0.5, this.context.currentTime); // 0.5 Hz pulse
         this.droneLfo.connect(this.droneGain.gain);

         // Initial volume
         this.droneGain.gain.setValueAtTime(0.02, this.context.currentTime);
         
         this.droneOsc.start();
         this.droneLfo.start();
     }
  }

  stopDrone() {
    const now = this.context?.currentTime || 0;
    
    if (this.droneGain) {
        this.droneGain.gain.cancelScheduledValues(now);
        this.droneGain.gain.linearRampToValueAtTime(0, now + 0.5);
    }

    setTimeout(() => {
        // Stop Synth
        if (this.droneOsc) {
            this.droneOsc.stop();
            this.droneLfo?.stop();
            this.droneOsc.disconnect();
            this.droneLfo?.disconnect();
            this.droneOsc = null;
            this.droneLfo = null;
        }

        // Stop Custom Sample
        if (this.customDroneSource) {
            this.customDroneSource.stop();
            this.customDroneSource.disconnect();
            this.customDroneSource = null;
        }

        if (this.droneGain) {
            this.droneGain.disconnect();
            this.droneGain = null;
        }
    }, 550);
  }
}

export const audioService = new AudioService();
