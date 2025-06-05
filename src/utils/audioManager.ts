class AudioManager {
  private audioContext: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private initialized = false;
  
  async init() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.initialized = true;
      
      // Create synthetic sounds
      await this.createSyntheticSounds();
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }
  
  private async createSyntheticSounds() {
    if (!this.audioContext) return;
    
    // Mechanical tick sound
    const tickBuffer = this.audioContext.createBuffer(1, 4410, 44100);
    const tickData = tickBuffer.getChannelData(0);
    for (let i = 0; i < tickData.length; i++) {
      tickData[i] = (Math.random() - 0.5) * 0.5 * Math.exp(-i / 1000);
    }
    this.buffers.set('tick', tickBuffer);
    
    // Needle snap sound
    const snapBuffer = this.audioContext.createBuffer(1, 2205, 44100);
    const snapData = snapBuffer.getChannelData(0);
    for (let i = 0; i < snapData.length; i++) {
      const envelope = Math.exp(-i / 500);
      snapData[i] = Math.sin(2 * Math.PI * 2000 * i / 44100) * envelope * 0.3;
    }
    this.buffers.set('snap', snapBuffer);
    
    // Ambient hum
    const humBuffer = this.audioContext.createBuffer(1, 44100, 44100);
    const humData = humBuffer.getChannelData(0);
    for (let i = 0; i < humData.length; i++) {
      humData[i] = (Math.random() - 0.5) * 0.05 +
                   Math.sin(2 * Math.PI * 60 * i / 44100) * 0.02 +
                   Math.sin(2 * Math.PI * 120 * i / 44100) * 0.01;
    }
    this.buffers.set('hum', humBuffer);
  }
  
  playSound(soundName: string, volume: number = 0.5, pitch: number = 1) {
    if (!this.audioContext || !this.buffers.has(soundName)) return;
    
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = this.buffers.get(soundName)!;
    source.playbackRate.value = pitch;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    gainNode.gain.value = volume;
    source.start();
  }
  
  async playTickSequence(count: number = 5, interval: number = 100) {
    for (let i = 0; i < count; i++) {
      this.playSound('tick', 0.3, 1 + Math.random() * 0.2);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  
  playAmbientHum(volume: number = 0.1) {
    if (!this.audioContext || !this.buffers.has('hum')) return;
    
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = this.buffers.get('hum')!;
    source.loop = true;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    gainNode.gain.value = 0;
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 1);
    
    source.start();
    
    return () => {
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext!.currentTime + 0.5);
      setTimeout(() => source.stop(), 500);
    };
  }
}

export const audioManager = new AudioManager();