import { useState, useEffect } from 'react';
import useWebRTC from '../../hooks/useWebRTC';
import VideoTile from './VideoTile';
import CallControls from './CallControls';
import { X } from 'lucide-react';

export default function VideoRoom({ roomCode, isHost, guestId, remoteName, onClose }) {
  const {
    localStream,
    remoteStream,
    error,
    endCall,
    toggleMute,
    toggleVideo
  } = useWebRTC(roomCode, isHost, guestId);

  const handleEndCall = () => {
    endCall();
    onClose();
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-8">
        <div className="bg-white p-8 rounded-2xl max-w-md text-center">
          <h2 className="text-red-500 font-bold text-xl mb-4">Connection Error</h2>
          <p className="text-fitti-text-dark mb-6">{error}</p>
          <button onClick={onClose} className="px-6 py-2 bg-fitti-green text-white rounded-xl font-bold">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 p-6 flex flex-col">
      <div className="flex justify-end mb-4 relative z-20">
        <button onClick={handleEndCall} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 relative rounded-3xl overflow-hidden bg-gray-900 border border-white/10">
        {/* Remote Video (Full Screen) */}
        <VideoTile stream={remoteStream} isLocal={false} name={remoteName} />
        
        {/* Local Video (PiP) */}
        <VideoTile stream={localStream} isLocal={true} />

        {/* Controls */}
        <CallControls 
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
          onEndCall={handleEndCall}
        />
      </div>
    </div>
  );
}
