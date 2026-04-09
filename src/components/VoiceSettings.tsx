import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Settings, Volume2, Mic } from 'lucide-react';
import { getAvailableVoices } from '@/services/elevenlabs';
import { voiceManager } from '@/services/voiceInteraction';

interface VoiceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceSettings({ isOpen, onClose }: VoiceSettingsProps) {
  const [voices, setVoices] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedVoice, setSelectedVoice] = useState('mysterious-orb');
  const [speechVolume, setSpeechVolume] = useState([0.8]);
  const [speechSpeed, setSpeechSpeed] = useState([1.0]);
  const [autoPlay, setAutoPlay] = useState(true);
  const [continuousListening, setContinuousListening] = useState(false);
  const [isSupported] = useState(voiceManager.isSupported());

  useEffect(() => {
    if (isOpen) {
      loadVoices();
    }
  }, [isOpen]);

  const loadVoices = async () => {
    try {
      const availableVoices = await getAvailableVoices();
      setVoices(availableVoices);
    } catch (error) {
      console.error('Failed to load voices:', error);
    }
  };

  const testVoice = async () => {
    // Test the selected voice with a sample phrase
    const testText = "The shadows whisper of secrets yet to be revealed...";
    // This would use the voice synthesis service
    console.log('Testing voice:', selectedVoice, 'with text:', testText);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/95 backdrop-blur border-border/50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-accent" />
              <h2 className="font-cinzel text-lg text-foreground">Voice Settings</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          {!isSupported && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">
                Voice features are not supported in this browser. Please use Chrome, Edge, or Safari for the full experience.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Voice Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Orb Voice
              </Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={testVoice} className="w-full">
                Test Voice
              </Button>
            </div>

            {/* Volume Control */}
            <div className="space-y-2">
              <Label>Speech Volume</Label>
              <Slider
                value={speechVolume}
                onValueChange={setSpeechVolume}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Quiet</span>
                <span>{Math.round(speechVolume[0] * 100)}%</span>
                <span>Loud</span>
              </div>
            </div>

            {/* Speech Speed */}
            <div className="space-y-2">
              <Label>Speech Speed</Label>
              <Slider
                value={speechSpeed}
                onValueChange={setSpeechSpeed}
                max={2}
                min={0.5}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Slow</span>
                <span>{speechSpeed[0]}x</span>
                <span>Fast</span>
              </div>
            </div>

            {/* Auto-play Responses */}
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Auto-play Responses
              </Label>
              <Switch checked={autoPlay} onCheckedChange={setAutoPlay} />
            </div>

            {/* Continuous Listening */}
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Continuous Listening
              </Label>
              <Switch 
                checked={continuousListening} 
                onCheckedChange={setContinuousListening}
                disabled={!isSupported}
              />
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
              <Label>Recognition Language</Label>
              <Select defaultValue="en-US">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="es-ES">Spanish</SelectItem>
                  <SelectItem value="fr-FR">French</SelectItem>
                  <SelectItem value="de-DE">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={onClose} className="flex-1">
              Save Settings
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}