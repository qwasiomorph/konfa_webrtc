import { useState, useRef, useEffect } from "react";
// import type { User, Signal } from "../types/types";
// import { initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  addDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
};

// Initialize Firebase

firebase.initializeApp(firebaseConfig);

const firestore = firebase.firestore();

const servers = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun.l.google.com:5349",
        "stun:stun1.l.google.com:3478",
      ],
    },
  ],
  iseCandidatePoolSize: 10,
};

export default function useWebRTC() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(new RTCPeerConnection(servers));
  const [callId, setCallId] = useState<string | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);

  const unsubscribeRefs = useRef<(() => void)[]>([]);

  // Инициализация PeerConnection
  useEffect(() => {
    console.log("Инициализация pc");
    // const pc = new RTCPeerConnection(servers);
    // setPeerConnection(pc);
    return () => {
      peerConnection?.close();
      unsubscribeRefs.current.forEach((unsub) => unsub());
    };
  }, []);

  const initializeCall = async () => {
    console.log("Инициализация звонка");
    try {
      if (!peerConnection || peerConnection.connectionState === "closed") {
        setPeerConnection(new RTCPeerConnection(servers));
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);

      const remoteStream = new MediaStream();
      setRemoteStream(remoteStream);

      // Добавляем треки в PeerConnection
      stream.getTracks().forEach((track) => {
        peerConnection?.addTrack(track, stream);
      });

      // Обработка входящих треков
      peerConnection!.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
      };

      return true;
    } catch (error) {
      console.error("Error initializing call:", error);
      return false;
    }
  };

  const startCall = async () => {
    if (!peerConnection) return;

    try {
      const callDocRef = doc(collection(firestore, "calls"));
      const offerCandidates = collection(callDocRef, "offerCandidates");
      const answerCandidates = collection(callDocRef, "answerCandidates");

      setCallId(callDocRef.id);
      setIsCallActive(true);

      // Собираем ICE кандидаты
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          addDoc(offerCandidates, event.candidate.toJSON());
        }
      };

      // Создаем offer
      const offerDescription = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offerDescription);

      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      };

      await setDoc(callDocRef, {
        offer,
      });

      // Слушаем ответ
      const unsubAnswer = onSnapshot(callDocRef, (snapshot) => {
        const data = snapshot.data();
        if (!peerConnection.currentRemoteDescription && data?.answer) {
          const answerDescription = new RTCSessionDescription(data.answer);
          peerConnection.setRemoteDescription(answerDescription);
        }
      });

      // Слушаем ICE кандидаты от отвечающего
      const unsubCandidates = onSnapshot(answerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const candidate = new RTCIceCandidate(change.doc.data());
            peerConnection.addIceCandidate(candidate);
          }
        });
      });

      unsubscribeRefs.current.push(unsubAnswer, unsubCandidates);
    } catch (error) {
      console.error("Error starting call:", error);
      endCall();
    }
  };

  const answerCall = async (callId: string) => {
    if (!peerConnection || !callId) return;

    try {
      const callDocRef = doc(firestore, "calls", callId);
      const answerCandidates = collection(callDocRef, "answerCandidates");
      const offerCandidates = collection(callDocRef, "offerCandidates");

      setCallId(callId);
      setIsCallActive(true);

      // Собираем ICE кандидаты
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          addDoc(answerCandidates, event.candidate.toJSON());
        }
      };

      // Получаем offer
      const callData = (await getDoc(callDocRef)).data();
      if (!callData?.offer) throw new Error("No offer found");

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(callData.offer)
      );

      // Создаем answer
      const answerDescription = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answerDescription);

      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      };

      await updateDoc(callDocRef, { answer });

      // Слушаем ICE кандидаты от вызывающего
      const unsubCandidates = onSnapshot(offerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const candidate = new RTCIceCandidate(change.doc.data());
            peerConnection.addIceCandidate(candidate);
          }
        });
      });

      unsubscribeRefs.current.push(unsubCandidates);
    } catch (error) {
      console.error("Error answering call:", error);
      endCall();
    }
  };

  const endCall = () => {
    if (peerConnection) {
      peerConnection.onicecandidate = null;
      peerConnection.ontrack = null;
      peerConnection.close();
      setPeerConnection(new RTCPeerConnection(servers));
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }

    // Очищаем подписки
    unsubscribeRefs.current.forEach((unsub) => unsub());
    unsubscribeRefs.current = [];

    // Удаляем данные вызова из Firebase
    if (callId) {
      deleteCallData(callId);
      setCallId(null);
    }

    setIsCallActive(false);
    initializeCall();
  };

  const deleteCallData = async (callId: string) => {
    try {
      const callDocRef = doc(firestore, "calls", callId);
      await deleteDoc(callDocRef);
    } catch (error) {
      console.error("Error deleting call data:", error);
    }
  };

  return {
    localStream,
    remoteStream,
    callId,
    isCallActive,
    initializeCall,
    startCall,
    answerCall,
    endCall,
  };
}
