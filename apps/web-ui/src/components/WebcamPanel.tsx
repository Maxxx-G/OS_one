import React, { useEffect, useRef, useState } from 'react';

export const WebcamPanel: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ok, setOk] = useState<boolean>(false);
  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setOk(true);
      } catch { setOk(false); }
    })();
    return () => {
      const v = videoRef.current as any;
      const s: MediaStream | undefined = v?.srcObject;
      s?.getTracks()?.forEach(t => t.stop());
    };
  }, []);
  return (
    <div className="border rounded p-2">
      <div className="text-sm font-medium">Webcam</div>
      {ok ? <video ref={videoRef} autoPlay playsInline className="mt-2 w-64 h-48 bg-black rounded"/> :
        <div className="text-xs text-gray-500 mt-2">Camera permission denied or unavailable</div>}
    </div>
  );
};
