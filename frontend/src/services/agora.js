import AgoraRTC from "agora-rtc-sdk-ng";

const AGORA_APP_ID = "70c810e5cdcb426d869ef82085c4b95f";

let rtc = {
  client: null,
  localAudioTrack: null,
  localVideoTrack: null,
};

export async function createAgoraClient() {
  if (rtc.client) return rtc.client;
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  rtc.client = client;
  return client;
}

export async function joinChannel(channelName, token = null) {
  await createAgoraClient();
  await rtc.client.join(AGORA_APP_ID, channelName, token, null);

  rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

  await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
}

export async function leaveChannel() {
  try {
    if (rtc.client) {
      await rtc.client.unpublish();
    }
  } catch {
    // ignore unpublish errors on leave
  }

  if (rtc.localAudioTrack) {
    rtc.localAudioTrack.close();
    rtc.localAudioTrack = null;
  }
  if (rtc.localVideoTrack) {
    rtc.localVideoTrack.close();
    rtc.localVideoTrack = null;
  }
  if (rtc.client) {
    rtc.client.removeAllListeners();
    await rtc.client.leave();
    rtc.client = null;
  }
}

export function getRTC() {
  return rtc;
}

export function getAppId() {
  return AGORA_APP_ID;
}
