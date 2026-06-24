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
  isMuted?: boolean;
  onMuteToggle?: (muted: boolean) => void;
}

export function CallScreen({ 
  call, 
  isCaller, 
  onClose, 
  otherUserName = 'User', 
  otherUserAvatar = '',
  isMuted: propIsMuted,
  onMuteToggle
}: CallScreenProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localIsMuted, setLocalIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(call.type === 'audio');
  const [callStatus, setCallStatus] = useState<CallData['status']>(call.status);
  const [duration, setDuration] = useState(0);

  const isMuted = propIsMuted !== undefined ? propIsMuted : localIsMuted;

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const unsubsRef = useRef<Array<() => void>>([]);

  // Bind local stream reactively when elements mount or stream updates
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isVideoOff, callStatus]);

  // Bind remote stream reactively when elements mount or stream updates
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, isVideoOff, callStatus]);

  // Track connected call duration
  useEffect(() => {
    if (callStatus !== 'connected') return;
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

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
        // Apply current mute state immediately
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !isMuted;
        }
        setLocalStream(stream);
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

  // Synchronize mute status dynamically with localStream tracks
  useEffect(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMuted;
      }
    }
  }, [isMuted, localStream]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    if (onMuteToggle) {
      onMuteToggle(nextMuted);
    } else {
      setLocalIsMuted(nextMuted);
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
      
      {/* Remote Video Background - Always mounted in DOM so audio & video tracks can play continuously */}
      <video 
         ref={remoteVideoRef} 
         autoPlay 
         playsInline 
         className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
           call.type === 'video' && !isVideoOff && callStatus === 'connected' 
             ? 'opacity-100' 
             : 'opacity-0 pointer-events-none'
         }`} 
      />

      {/* Ringing or Audio Profile Overlay (Displayed when audio-only, video is off, or not yet fully connected) */}
      {(call.type !== 'video' || isVideoOff || callStatus !== 'connected') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-0">
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
                 {callStatus === 'connected' ? formatDuration(duration) : ''}
             </p>
          </div>
      )}

      {/* Local Video PIP - Always mounted so stream is bound, opacity/scale handles visibility */}
      <div 
        className={`absolute top-6 right-6 w-32 h-48 bg-slate-800 rounded-xl overflow-hidden shadow-2xl border-2 border-slate-700 z-10 transition-all duration-300 ${
          call.type === 'video' && !isVideoOff && callStatus === 'connected'
            ? 'opacity-100 scale-100' 
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
          <video 
             ref={localVideoRef} 
             autoPlay 
             playsInline 
             muted 
             className="w-full h-full object-cover -scale-x-100" 
          />
      </div>

      {/* Floating Duration for active Video call */}
      {call.type === 'video' && !isVideoOff && callStatus === 'connected' && (
          <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full z-10 font-mono text-sm">
              {formatDuration(duration)}
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
