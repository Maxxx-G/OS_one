import { createRedactedStream } from '../lib/videoRedactor';
import React, { useEffect, useRef, useState } from 'react';
import { useSeccomms } from '../state/SeccommsContext';

async function getJSON(u: string, headers: Record<string, string>) {
  const r = await fetch(u, { headers });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function postJSON(u: string, body: any, headers: Record<string, string>) {
  const r = await fetch(u, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export default function CallPanel() {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [room, setRoom] = useState('default');
  const [peer, setPeer] = useState('deadbeef');
  const { mode, pinnedPeer } = useSeccomms();
  const [redactVideo, setRedactVideo] = useState(true);
  const [maskAll, setMaskAll] = useState(false);

  const headers = {
    'x-os1-seccomms': mode === 'seccomms_on' ? 'on' : 'off',
    'x-os1-peer': (pinnedPeer || peer).toLowerCase(),
    'x-os1-redacted': 'true',
  };

  const startLocal = async () => {
    const ms = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    if (localRef.current) localRef.current.srcObject = ms;

    // create processed stream (video only) if enabled
    let outbound = ms;
    if (redactVideo) {
      const processed = await createRedactedStream(ms, { blur: true, maskAll });
      // replace video track in outbound stream, keep original audio
      const out = new MediaStream();
      const v = processed.getVideoTracks()[0];
      if (v) out.addTrack(v);
      const a = ms.getAudioTracks()[0];
      if (a) out.addTrack(a);
      outbound = out;
    }

    const pc = new RTCPeerConnection({ iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] });
    outbound.getTracks().forEach((t) => pc.addTrack(t, outbound));
    pc.ontrack = (e) => {
      if (remoteRef.current) remoteRef.current.srcObject = e.streams[0];
    };
    pcRef.current = pc;
    return pc;
  };

  const call = async () => {
    if (mode !== 'seccomms_on') {
      alert('Enable SEC-COMMS first');
      return;
    }
    const pc = await startLocal();
    const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
    await pc.setLocalDescription(offer);
    await postJSON(
      `/api/seccomms/sdp?room=${encodeURIComponent(room)}`,
      { type: 'offer', sdp: offer.sdp },
      headers,
    );
  };

  const answer = async () => {
    if (mode !== 'seccomms_on') {
      alert('Enable SEC-COMMS first');
      return;
    }
    const pc = await startLocal();
    const offer = await getJSON(
      `/api/seccomms/sdp?room=${encodeURIComponent(room)}&what=offer`,
      headers,
    );
    if (!offer) {
      alert('No offer found');
      return;
    }
    await pc.setRemoteDescription({ type: 'offer', sdp: offer.sdp });
    const ans = await pc.createAnswer();
    await pc.setLocalDescription(ans);
    await postJSON(
      `/api/seccomms/sdp?room=${encodeURIComponent(room)}`,
      { type: 'answer', sdp: ans.sdp },
      headers,
    );
  };

  const tryPullAnswer = async () => {
    if (!pcRef.current) return;
    const ans = await getJSON(
      `/api/seccomms/sdp?room=${encodeURIComponent(room)}&what=answer`,
      headers,
    );
    if (ans && !pcRef.current.currentRemoteDescription) {
      await pcRef.current.setRemoteDescription({ type: 'answer', sdp: ans.sdp });
    }
  };

  useEffect(() => {
    const id = setInterval(tryPullAnswer, 1500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, mode, pinnedPeer, peer]);

  const hangup = () => {
    pcRef.current?.getSenders()?.forEach((s) => s.track?.stop());
    pcRef.current?.close();
    pcRef.current = null;
    [localRef, remoteRef].forEach((r) => {
      const s = r.current?.srcObject as MediaStream | null;
      s?.getTracks().forEach((t) => t.stop());
      if (r.current) r.current.srcObject = null;
    });
  };

  return (
    <div className="grid gap-2 border rounded p-2">
      <div className="text-sm font-medium">SEC-COMMS A/V (LAN Pilot)</div>
      <div className="flex gap-2 items-center">
        <input
          className="border rounded px-2 py-1"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="room id"
        />
        <input
          className="border rounded px-2 py-1"
          value={peer}
          onChange={(e) => setPeer(e.target.value)}
          placeholder="peer fingerprint hex"
        />
        <button className="border rounded px-2 py-1" onClick={call}>
          Call
        </button>
        <button className="border rounded px-2 py-1" onClick={answer}>
          Answer
        </button>
        <button className="border rounded px-2 py-1" onClick={hangup}>
          Hang Up
        </button>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={redactVideo}
            onChange={(e) => setRedactVideo(e.target.checked)}
          />
          <span className="text-sm">redact video</span>
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={maskAll}
            onChange={(e) => setMaskAll(e.target.checked)}
            disabled={!redactVideo}
          />
          <span className="text-sm">mask-all</span>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <video ref={localRef} autoPlay muted playsInline className="bg-black rounded h-48" />
        <video ref={remoteRef} autoPlay playsInline className="bg-black rounded h-48" />
      </div>
      <div className="text-xs text-gray-500">
        Dev-only: in-memory signaling; SEC-COMMS guard enforced.
      </div>
    </div>
  );
}
