// import { MediaStream } from 'react-webrtc';

// type VideoCallProps = {
//   localStream: MediaStream | null;
//   remoteStream: MediaStream | null;
// };

export default function VideoCall({ localStream, remoteStream }: any) {
  return (
    <div className="flex-1 bg-black relative">
      {/* Удаленное видео */}
      {remoteStream && (
        <video
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          ref={(video) => {
            if (video && remoteStream) video.srcObject = remoteStream;
          }}
        />
      )}

      {/* Локальное видео (пип-режим) */}
      {localStream && (
        <div className="absolute bottom-4 right-4 w-1/4 h-1/4 rounded-lg overflow-hidden shadow-lg">
          <video
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            ref={(video) => {
              if (video && localStream) video.srcObject = localStream;
            }}
          />
        </div>
      )}

      {/* Состояние, когда нет активного звонка */}
      {!remoteStream && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center p-6 bg-black bg-opacity-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">No active call</h2>
            <p>Start a call with a user from the list</p>
          </div>
        </div>
      )}
    </div>
  );
}
