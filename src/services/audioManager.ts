/**
 * Audio Manager Service
 * Manages generated audio URLs and cleanup
 */

class AudioManager {
  private generatedAudioUrls: Set<string> = new Set();
  private currentAudio: HTMLAudioElement | null = null;

  /**
   * Create and track a generated audio URL
   */
  createAudioUrl(audioBuffer: ArrayBuffer): string {
    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(blob);
    
    // Track this URL for cleanup
    this.generatedAudioUrls.add(audioUrl);
    
    return audioUrl;
  }

  /**
   * Play audio and track the audio element
   */
  async playAudio(audioUrl: string): Promise<HTMLAudioElement> {
    // Stop any currently playing audio
    this.stopCurrentAudio();
    
    const audio = new Audio(audioUrl);
    this.currentAudio = audio;
    
    // Auto-cleanup when audio ends
    audio.onended = () => {
      if (this.currentAudio === audio) {
        this.currentAudio = null;
      }
    };
    
    audio.onerror = () => {
      if (this.currentAudio === audio) {
        this.currentAudio = null;
      }
    };
    
    await audio.play();
    return audio;
  }

  /**
   * Stop currently playing audio
   */
  stopCurrentAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  /**
   * Clean up a specific audio URL
   */
  cleanupAudioUrl(audioUrl: string): void {
    if (this.generatedAudioUrls.has(audioUrl)) {
      URL.revokeObjectURL(audioUrl);
      this.generatedAudioUrls.delete(audioUrl);
    }
  }

  /**
   * Clean up all generated audio URLs
   * Call this on page refresh/unload
   */
  cleanupAllGeneratedAudio(): void {
    console.log('[AudioManager] 🧹 Cleaning up', this.generatedAudioUrls.size, 'generated audio URLs');
    
    // Stop any playing audio
    this.stopCurrentAudio();
    
    // Revoke all generated URLs
    this.generatedAudioUrls.forEach(url => {
      URL.revokeObjectURL(url);
    });
    
    // Clear the tracking set
    this.generatedAudioUrls.clear();
    
    console.log('[AudioManager] ✅ All generated audio cleaned up');
  }

  /**
   * Get current audio element
   */
  getCurrentAudio(): HTMLAudioElement | null {
    return this.currentAudio;
  }

  /**
   * Check if audio is currently playing
   */
  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }
}

// Global audio manager instance
export const audioManager = new AudioManager();

// Clean up on page unload/refresh
window.addEventListener('beforeunload', () => {
  audioManager.cleanupAllGeneratedAudio();
});

// Clean up on page visibility change (when tab becomes hidden)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    audioManager.stopCurrentAudio();
  }
});