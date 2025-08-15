import { useState, useEffect } from "react";
import VideoCall from "./components/VideoCall";
import Chat from "./components/Chat";
import Controls from "./components/Controls";
import UserList from "./components/UserList";
import type { User, Message } from "./types/types";
import useWebRTC from "./hooks/useWebRTC";

export default function App() {
  const {
    localStream,
    remoteStream,
    initializeCall,
    startCall,
    answerCall,
    endCall,
    isCallActive,
    callId,
  } = useWebRTC();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    initializeCall();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Video Chat App</h1>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Видео и управление звонком */}
        <div className="flex-1 flex flex-col">
          <VideoCall localStream={localStream} remoteStream={remoteStream} />

          <Controls
            isCallActive={isCallActive}
            callId={callId}
            onStartCall={startCall}
            onEndCall={endCall}
            onJoinCall={answerCall}
          />
        </div>

        {/* Боковая панель с чатом и пользователями */}
        <div className="w-80 bg-white border-l flex flex-col">
          <UserList
            users={users}
            onUserSelect={(user) => {
              /* ToDo: Initiate call with user */
            }}
          />

          <Chat
            messages={messages}
            onSendMessage={(message) => {
              /* ToDo: Send message logic */
            }}
          />
        </div>
      </main>
    </div>
  );
}
