import { useEffect, useRef, useState } from "react";

const SCRIPT_ID = "jitsi-external-api";

const loadJitsiScript = (domain = "meet.jit.si") => {
  if (window.JitsiMeetExternalAPI) {
    return Promise.resolve();
  }

  const existing = document.getElementById(SCRIPT_ID);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

const getRoomName = (meetingLink) => {
  try {
    const url = new URL(meetingLink);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts.join("/");
  } catch (err) {
    return String(meetingLink || "").replace(/^https:\/\/meet\.jit\.si\//, "");
  }
};

const getMeetingDomain = (meetingLink) => {
  try {
    return new URL(meetingLink).hostname || "meet.jit.si";
  } catch (err) {
    return "meet.jit.si";
  }
};

function JitsiMeeting({
  meetingLink,
  jwt,
  displayName,
  userEmail,
  allowSpeaking = true,
  onJoin,
  onLeave,
  onParticipantJoined,
  onParticipantLeft,
  height = 520
}) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const trackedJoinRef = useRef(false);
  const onJoinRef = useRef(onJoin);
  const onLeaveRef = useRef(onLeave);
  const onParticipantJoinedRef = useRef(onParticipantJoined);
  const onParticipantLeftRef = useRef(onParticipantLeft);
  const allowSpeakingRef = useRef(allowSpeaking);
  const [error, setError] = useState("");

  useEffect(() => {
    onJoinRef.current = onJoin;
    onLeaveRef.current = onLeave;
    onParticipantJoinedRef.current = onParticipantJoined;
    onParticipantLeftRef.current = onParticipantLeft;
  }, [onJoin, onLeave, onParticipantJoined, onParticipantLeft]);

  useEffect(() => {
    allowSpeakingRef.current = allowSpeaking;
  }, [allowSpeaking]);

  useEffect(() => {
    let cancelled = false;

    const setAudioMuted = async (muted) => {
      const api = apiRef.current;
      if (!api) return;

      try {
        const isMuted = typeof api.isAudioMuted === "function" ? await api.isAudioMuted() : null;
        if (isMuted !== muted && typeof api.executeCommand === "function") {
          api.executeCommand("toggleAudio");
        }
      } catch (err) {
        if (muted && typeof api.executeCommand === "function") {
          api.executeCommand("toggleAudio");
        }
      }
    };

    const startMeeting = async () => {
      if (!meetingLink || !containerRef.current) return;

      try {
        const domain = getMeetingDomain(meetingLink);
        await loadJitsiScript(domain);
        if (cancelled || !containerRef.current) return;

        const roomName = getRoomName(meetingLink);
        if (!roomName) {
          setError("Meeting link is not valid");
          return;
        }

        const api = new window.JitsiMeetExternalAPI(domain, {
          roomName,
          jwt,
          parentNode: containerRef.current,
          width: "100%",
          height,
          userInfo: {
            displayName: displayName || "UniElect participant",
            email: userEmail || undefined
          },
          configOverwrite: {
            prejoinPageEnabled: true,
            startWithAudioMuted: !allowSpeakingRef.current
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false
          }
        });

        apiRef.current = api;

        api.addEventListener("videoConferenceJoined", async () => {
          trackedJoinRef.current = true;
          await setAudioMuted(!allowSpeakingRef.current);
          onJoinRef.current?.();
        });

        api.addEventListener("videoConferenceLeft", () => {
          if (trackedJoinRef.current) {
            trackedJoinRef.current = false;
            onLeaveRef.current?.();
          }
        });

        api.addEventListener("participantJoined", (participant) => {
          onParticipantJoinedRef.current?.(participant);
        });

        api.addEventListener("participantLeft", (participant) => {
          onParticipantLeftRef.current?.(participant);
        });

        api.addEventListener("audioMuteStatusChanged", async ({ muted }) => {
          if (!allowSpeakingRef.current && muted === false) {
            await setAudioMuted(true);
          }
        });
      } catch (err) {
        setError("Unable to load the Jitsi meeting");
      }
    };

    startMeeting();

    return () => {
      cancelled = true;
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [displayName, height, jwt, meetingLink, userEmail]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api || typeof api.isAudioMuted !== "function") return;

    api.isAudioMuted().then((muted) => {
      if (!allowSpeaking && !muted) {
        api.executeCommand("toggleAudio");
      }
    }).catch(() => {});
  }, [allowSpeaking]);

  if (error) {
    return <p style={{ color: "#b91c1c" }}>{error}</p>;
  }

  return <div ref={containerRef} style={{ width: "100%", minHeight: height, background: "#111827" }} />;
}

export default JitsiMeeting;
