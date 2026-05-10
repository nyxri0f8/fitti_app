import { useEffect, useRef } from 'react';

export default function VideoTile({ stream, isLocal, name }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) {
    return (
      <div className={`bg-gray-900 rounded-3xl flex items-center justify-center ${isLocal ? 'w-48 h-32 absolute bottom-24 right-8 border-2 border-fitti-green shadow-xl z-10' : 'w-full h-full'}`}>
        <p className="text-white text-sm">Waiting for video...</p>
      </div>
    );
  }

  return (
    <div className={`${isLocal ? 'w-48 h-32 absolute bottom-24 right-8 border-2 border-fitti-green shadow-xl rounded-2xl overflow-hidden z-10' : 'w-full h-full rounded-3xl overflow-hidden relative bg-black'}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className="w-full h-full object-cover"
      />
      {!isLocal && name && (
        <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl">
          <p className="text-white font-bold">{name}</p>
        </div>
      )}
    </div>
  );
}
