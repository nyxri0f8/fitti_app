import { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Phone, MessageSquare } from 'lucide-react';

export default function CallControls({ onToggleMute, onToggleVideo, onEndCall }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const handleMute = () => {
    setIsMuted(!isMuted);
    onToggleMute();
  };

  const handleVideo = () => {
    setIsVideoOff(!isVideoOff);
    onToggleVideo();
  };

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black/60 backdrop-blur-lg px-8 py-4 rounded-full z-20">
      <button 
        onClick={handleMute}
        className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
      >
        {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
      </button>

      <button 
        onClick={handleVideo}
        className={`p-4 rounded-full transition-colors ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
      >
        {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
      </button>

      <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
        <MessageSquare className="h-6 w-6" />
      </button>

      <button 
        onClick={onEndCall}
        className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
      >
        <Phone className="h-6 w-6 transform rotate-[135deg]" />
      </button>
    </div>
  );
}
