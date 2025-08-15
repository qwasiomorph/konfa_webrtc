import { useState } from "react";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";

type ControlsProps = {
  isCallActive: boolean;
  callId: string | null;
  onStartCall: () => Promise<void>;
  onEndCall: () => void;
  onJoinCall: (callId: string) => void;
};

export default function Controls({
  isCallActive,
  callId,
  onStartCall,
  onEndCall,
  onJoinCall,
}: ControlsProps) {
  const [remoteCallId, setRemoteCallId] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const handleJoinCall = () => {
    if (remoteCallId.trim()) {
      onJoinCall(remoteCallId.trim());
      setRemoteCallId("");
    }
  };

  const copyToClipboard = () => {
    if (callId) {
      navigator.clipboard.writeText(callId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gray-800 p-4 flex justify-center space-x-4">
      {!isCallActive ? (
        <>
          <div className="flex flex-col space-y-2 w-full md:w-auto md:flex-row md:space-y-0 md:space-x-2">
            <input
              type="text"
              value={remoteCallId}
              onChange={(e) => setRemoteCallId(e.target.value)}
              placeholder="Enter Call ID"
              className="px-4 py-2 rounded md:rounded-r-none focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
            />
            <button
              onClick={handleJoinCall}
              disabled={!remoteCallId.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded md:rounded-l-none hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              Join Call
            </button>
          </div>

          <span className="text-white mx-2 hidden md:inline">or</span>
          <button
            onClick={onStartCall}
            className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 flex items-center"
          >
            <span className="mr-2">Start New Call</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center space-y-3 w-full md:flex-row md:space-y-0 md:space-x-4">
          {callId && (
            <div className="flex items-center bg-gray-700 px-3 py-2 rounded">
              <span className="text-white mr-2">Call ID:</span>
              <span className="font-mono text-blue-300 mr-2">{callId}</span>
              <button
                onClick={copyToClipboard}
                className="text-gray-300 hover:text-white transition-colors"
                title="Copy to clipboard"
              >
                <ClipboardDocumentIcon className="w-5 h-5" />
              </button>
              {isCopied && (
                <span className="ml-2 text-green-400 text-sm">Copied!</span>
              )}
            </div>
          )}
          <button
            onClick={onEndCall}
            className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 flex items-center"
          >
            <span className="mr-2">End Call</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
