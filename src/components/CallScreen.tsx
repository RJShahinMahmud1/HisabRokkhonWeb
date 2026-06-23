import React, { useEffect, useRef, useState } from 'react';
import { Video, Phone, Mic, MicOff, VideoOff, PhoneOff, Camera } from 'lucide-react';
import { CallData, updateCallStatus, setCallOffer, setCallAnswer, addIceCandidate, subscribeToIceCandidates, subscribeToCall } from '../lib/callService';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

interface CallScreenProps {
  call: CallData;
  isCaller: boolean;
  onClose: () => void;
  otherUserName?: string;
  otherUserAvatar?: string;
}

export function CallScreen({ call, isCaller, onClose, otherUserName = 'User', otherUserAvatar = '' }: CallScreenProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(call.type === 'audio');
  const [callStatus, setCallStatus] = useState<CallData['status']>(call.status);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const unsubsRef = useRef<Array<() => void>>([]);

  // Initialize Media and Peer Connection
  useEffect(() => {
    const initCall = async () => {
      // 1. Setup local stream
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: call.type === 'video',
          audio: true,
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Failed to get local stream', err);
        alert('Could not access microphone/camera');
        handleEndCall();
        return;
      }

      // 2. Initialize PeerConnection
      pc.current = new RTCPeerConnection(servers);

      // Register remote stream
      const rStream = new MediaStream();
      setRemoteStream(rStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = rStream;
      }

      // Add local tracks to peer connection
      stream.getTracks().forEach((track) => {
        pc.current?.addTrack(track, stream);
      });

      // Listen for remote tracks
      pc.current.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          rStream.addTrack(track);
        });
      };

      // Handle ICE Candidates
      pc.current.onicecandidate = (event) => {
        if (event.candidate && call.id) {
          addIceCandidate(call.id, isCaller ? 'caller' : 'callee', event.candidate.toJSON());
        }
      };

      // 3. Connect Signaling
      if (call.id) {
        if (isCaller) {
          // Caller logic
          const offerDescription = await pc.current.createOffer();
          await pc.current.setLocalDescription(offerDescription);
          await setCallOffer(call.id, {
            type: offerDescription.type,
            sdp: offerDescription.sdp,
          });

          let answerHandled = false;
          let pendingCandidates: RTCIceCandidateInit[] = [];
          
          // Listen for answer
          const unsubCall = subscribeToCall(call.id, async (updatedCall) => {
            setCallStatus(updatedCall.status);
            if (updatedCall.status === 'ended' || updatedCall.status === 'rejected') {
               cleanup();
            }
            if (!answerHandled && updatedCall.answer) {
              answerHandled = true;
              const answerDescription = new RTCSessionDescription(updatedCall.answer);
              await pc.current?.setRemoteDescription(answerDescription);
              
              // Process pending candidates
              pendingCandidates.forEach(c => pc.current?.addIceCandidate(new RTCIceCandidate(c)));
              pendingCandidates = [];
            }
          });

          // Listen for remote ICE candidates
          const unsubIce = subscribeToIceCandidates(call.id, 'callee', (candidate) => {
            if (pc.current?.remoteDescription) {
              pc.current?.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
              pendingCandidates.push(candidate);
            }
          });
          
          unsubsRef.current.push(unsubCall, unsubIce);
        } else {
          // Callee logic (Answerer)
          let offerHandled = false;
          let pendingCandidates: RTCIceCandidateInit[] = [];
          
          const unsubCall = subscribeToCall(call.id, async (updatedCall) => {
            setCallStatus(updatedCall.status);
            if (updatedCall.status === 'ended' || updatedCall.status === 'missed') {
               cleanup();
            }
            // Once offer is available and we haven't set it yet
            if (!offerHandled && updatedCall.offer) {
              offerHandled = true;
              try {
                const offerDescription = new RTCSessionDescription(updatedCall.offer);
                await pc.current?.setRemoteDescription(offerDescription);
                
                // Process pending candidates
                pendingCandidates.forEach(c => pc.current?.addIceCandidate(new RTCIceCandidate(c)));
                pendingCandidates = [];

                const answerDescription = await pc.current?.createAnswer();
                if (answerDescription) {
                  await pc.current?.setLocalDescription(answerDescription);

                  await setCallAnswer(call.id!, {
                    type: answerDescription.type,
                    sdp: answerDescription.sdp,
                  });
                }
              } catch (e) {
                console.error("Error handling offer:", e);
              }
            }
          });

          // Listen for caller ICE candidates
          const unsubIce = subscribeToIceCandidates(call.id, 'caller', (candidate) => {
            if (pc.current?.remoteDescription) {
              pc.current?.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
              pendingCandidates.push(candidate);
            }
          });
          
          unsubsRef.current.push(unsubCall, unsubIce);
        }
      }
    };

    if (callStatus === 'ringing' || callStatus === 'connected') {
        initCall();
    }

    return () => {
      cleanup();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanup = () => {
    unsubsRef.current.forEach(unsub => unsub());
    unsubsRef.current = [];
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }
    onClose();
  };

  const handleEndCall = async () => {
    if (call.id && callStatus !== 'ended') {
      await updateCallStatus(call.id, 'ended');
    }
    cleanup();
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 text-white flex items-center justify-center animate-in fade-in duration-300">
      
      {/* Remote Video Background */}
      {(call.type === 'video' && !isVideoOff) ? (
          <video 
             ref={remoteVideoRef} 
             autoPlay 
             playsInline 
             className={`absolute inset-0 w-full h-full object-cover ${callStatus !== 'connected' ? 'opacity-0' : 'opacity-100'}`} 
          />
      ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
             <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mb-6 overflow-hidden border-4 border-slate-700">
                {otherUserAvatar ? (
                    <img src={otherUserAvatar} alt={otherUserName} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-4xl font-bold text-slate-500">{otherUserName.charAt(0)}</span>
                )}
             </div>
             <h2 className="text-3xl font-semibold mb-2">{otherUserName}</h2>
             <p className="text-slate-400">
                 {callStatus === 'ringing' && isCaller ? 'Calling...' : ''}
                 {callStatus === 'ringing' && !isCaller ? 'Connecting...' : ''}
                 {callStatus === 'connected' ? '0:00' : ''}
             </p>
          </div>
      )}

      {/* Local Video PIP */}
      {(call.type === 'video' && !isVideoOff) && (
          <div className="absolute top-6 right-6 w-32 h-48 bg-slate-800 rounded-xl overflow-hidden shadow-2xl border-2 border-slate-700 z-10">
              <video 
                 ref={localVideoRef} 
                 autoPlay 
                 playsInline 
                 muted 
                 className="w-full h-full object-cover mirror" 
              />
          </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-slate-900/80 backdrop-blur-xl p-4 rounded-full border border-slate-800 z-10">
          <button 
             onClick={toggleMute}
             className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-slate-100 text-slate-900' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
          >
             {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          {call.type === 'video' && (
              <button 
                onClick={toggleVideo}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-slate-100 text-slate-900' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
          )}

          <button 
             onClick={handleEndCall}
             className="w-16 h-16 rounded-full flex items-center justify-center bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-lg shadow-rose-900/50"
          >
             <PhoneOff className="w-7 h-7" />
          </button>
      </div>

    </div>
  );
}
