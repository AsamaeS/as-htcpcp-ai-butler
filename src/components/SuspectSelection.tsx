/**
 * Suspect Selection Component
 * Displays all suspects in a grid for selection and accusation
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Eye, Gavel, AlertTriangle, User, Target, Clock, MapPin, Fingerprint, Heart } from 'lucide-react';
import GradientText from './GradientText';
import DecryptedText from './DecryptedText';
import PixelCard from './PixelCard';
import type { Suspect } from '@/data/cases';

interface SuspectSelectionProps {
  suspects: Suspect[];
  selectedSuspect: string | null;
  onSelectSuspect: (suspectId: string) => void;
  onAccuse: () => void;
  disabled?: boolean;
}

// Enhanced Suspect Card Component
function SuspectCard({ 
  suspect, 
  isSelected, 
  onSelect, 
  onViewDetails, 
  disabled 
}: {
  suspect: Suspect;
  isSelected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
  disabled: boolean;
}) {
  const getIconForSuspect = (suspectId: string) => {
    // Different icons for different suspect types
    const iconMap: Record<string, any> = {
      'kunal-mehra': User,
      'dr-sameer': Heart,
      'rajiv-khanna': Target,
      'ramesh-caretaker': MapPin,
      'neha-rao': Heart,
      'aarav-assistant': User,
      'kapur-neighbor': MapPin,
      'shyam-cleaner': User,
      'priya-daughter': User,
      'mohan-butler': Clock,
      'sharma-lawyer': Target,
      'ravi-friend': User
    };
    return iconMap[suspectId] || User;
  };

  const getVariantForSuspect = (suspectId: string, isSelected: boolean) => {
    if (isSelected) return 'red';
    
    // Different variants for different suspect types
    const variantMap: Record<string, string> = {
      'kunal-mehra': 'blue',
      'dr-sameer': 'pink',
      'rajiv-khanna': 'purple',
      'ramesh-caretaker': 'yellow',
      'neha-rao': 'pink',
      'aarav-assistant': 'blue',
      'kapur-neighbor': 'yellow',
      'shyam-cleaner': 'default',
      'priya-daughter': 'pink',
      'mohan-butler': 'purple',
      'sharma-lawyer': 'purple',
      'ravi-friend': 'blue'
    };
    return variantMap[suspectId] || 'default';
  };

  const SuspectIcon = getIconForSuspect(suspect.id);
  const variant = getVariantForSuspect(suspect.id, isSelected);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="relative group w-full"
    >
      <PixelCard 
        variant={variant as any}
        className={`cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && onSelect()}
      >
        {/* Card Content */}
        <div className="absolute inset-4 flex flex-col justify-between h-full w-full">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-full ${
                isSelected 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-gray-700/50 text-gray-400 group-hover:text-gray-300'
              }`}>
                <SuspectIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">{suspect.name}</h3>
                <Badge variant="secondary" className="text-xs mt-1">
                  {suspect.title}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
            >
              <Eye className="h-3 w-3" />
            </Button>
          </div>

          {/* Avatar Area */}
          <div className="flex-1 flex items-center justify-center my-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-80 flex items-center justify-center">
                <SuspectIcon className="h-6 w-6 text-gray-300" />
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-gray-400/20 to-transparent rounded-full blur-sm" />
              
              {/* Fingerprint overlay for mystery effect */}
              <div className="absolute -top-1 -right-1 opacity-30">
                <Fingerprint className="h-3 w-3 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Motive Section */}
          <div className="text-xs">
            <div className="flex items-center space-x-1 mb-1">
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
              <span className="font-medium text-gray-300">Motive:</span>
            </div>
            <div className="text-gray-400 line-clamp-3 leading-relaxed text-xs">
              <DecryptedText
                text={suspect.motive.length > 80 ? suspect.motive.substring(0, 80) + '...' : suspect.motive}
                animateOn="hover"
                sequential={true}
                revealDirection="start"
                speed={40}
                maxIterations={15}
                characters="!@#$%^&*()_+-=[]{}|;:,.<>?"
                className="text-gray-400"
                encryptedClassName="text-gray-600"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
            <span className="flex items-center space-x-1">
              <Target className="h-3 w-3" />
              <span>{suspect.clues.length} clues</span>
            </span>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-1 text-red-400"
              >
                <Target className="h-3 w-3" />
                <span className="font-medium">SELECTED</span>
              </motion.div>
            )}
          </div>
        </div>
      </PixelCard>
    </motion.div>
  );
}

interface SuspectSelectionProps {
  suspects: Suspect[];
  selectedSuspect: string | null;
  onSelectSuspect: (suspectId: string) => void;
  onAccuse: () => void;
  disabled?: boolean;
}

export function SuspectSelection({ 
  suspects, 
  selectedSuspect, 
  onSelectSuspect, 
  onAccuse,
  disabled = false 
}: SuspectSelectionProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [viewingSuspect, setViewingSuspect] = useState<Suspect | null>(null);

  const handleAccuse = () => {
    if (selectedSuspect) {
      setShowConfirmation(true);
    }
  };

  const confirmAccusation = () => {
    setShowConfirmation(false);
    onAccuse();
  };

  const selectedSuspectData = suspects.find(s => s.id === selectedSuspect);

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <GradientText
          colors={['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FEE2E2']}
          animationSpeed={3}
          className="text-3xl font-bold mb-2"
        >
          Choose Your Suspect
        </GradientText>
        <p className="text-gray-300">
          Based on your investigation, who do you believe is the murderer?
        </p>
      </div>

      {/* Suspect Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 place-items-center">
        {suspects.map((suspect) => (
          <SuspectCard
            key={suspect.id}
            suspect={suspect}
            isSelected={selectedSuspect === suspect.id}
            onSelect={() => onSelectSuspect(suspect.id)}
            onViewDetails={() => setViewingSuspect(suspect)}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center space-y-4">
        {selectedSuspect && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-gray-300 mb-4">
              You have selected <span className="text-red-400 font-bold">{selectedSuspectData?.name}</span>
            </p>
            <Button
              onClick={handleAccuse}
              disabled={disabled}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
            >
              <Gavel className="mr-2 h-5 w-5" />
              Make Accusation
            </Button>
          </motion.div>
        )}
        
        {!selectedSuspect && (
          <p className="text-gray-500 text-center">
            Select a suspect above to make your accusation
          </p>
        )}
      </div>

      {/* Suspect Detail Modal */}
      <Dialog open={!!viewingSuspect} onOpenChange={() => setViewingSuspect(null)}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
          {viewingSuspect && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-white">
                  {viewingSuspect.name}
                </DialogTitle>
                <Badge variant="secondary" className="w-fit">
                  {viewingSuspect.title}
                </Badge>
              </DialogHeader>
              
              <ScrollArea className="max-h-96">
                <div className="space-y-6 pr-4">
                  {/* Appearance */}
                  <div>
                    <h4 className="font-semibold text-white mb-2">Appearance</h4>
                    <p className="text-gray-300">{viewingSuspect.appearance}</p>
                  </div>
                  
                  <Separator className="bg-gray-700" />
                  
                  {/* Alibi */}
                  <div>
                    <h4 className="font-semibold text-white mb-2">Alibi</h4>
                    <p className="text-gray-300">{viewingSuspect.alibi}</p>
                  </div>
                  
                  <Separator className="bg-gray-700" />
                  
                  {/* Motive */}
                  <div>
                    <h4 className="font-semibold text-white mb-2">Motive</h4>
                    <p className="text-gray-300">{viewingSuspect.motive}</p>
                  </div>
                  
                  <Separator className="bg-gray-700" />
                  
                  {/* Clues */}
                  <div>
                    <h4 className="font-semibold text-white mb-2">Evidence & Clues</h4>
                    <ul className="space-y-2">
                      {viewingSuspect.clues.map((clue, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                          <p className="text-gray-300">{clue}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollArea>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setViewingSuspect(null)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    onSelectSuspect(viewingSuspect.id);
                    setViewingSuspect(null);
                  }}
                  disabled={disabled}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Select This Suspect
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
              Confirm Your Accusation
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-300">
              You are about to accuse <span className="text-red-400 font-bold">{selectedSuspectData?.name}</span> of murder.
            </p>
            <p className="text-yellow-300 text-sm">
              This decision is final and will determine if you solve the case correctly.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAccusation}
              className="bg-red-600 hover:bg-red-700"
            >
              <Gavel className="mr-2 h-4 w-4" />
              Confirm Accusation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}