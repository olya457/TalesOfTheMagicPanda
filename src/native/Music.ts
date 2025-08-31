
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  RepeatMode,
  IOSCategory,
  IOSCategoryMode,
  IOSCategoryOptions,
} from 'react-native-track-player';

let initialized = false;
let preparing: Promise<void> | null = null;

async function setupOnce() {
  if (initialized) return;
  if (preparing) return preparing;
  preparing = (async () => {
    await TrackPlayer.setupPlayer({
      iosCategory: IOSCategory.Playback,
      iosCategoryMode: IOSCategoryMode.Default,
      iosCategoryOptions: [IOSCategoryOptions.MixWithOthers],
    });
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior:
          AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        stopForegroundGracePeriod: 5,
      },
      capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
      compactCapabilities: [Capability.Play, Capability.Pause],
    });
    initialized = true;
  })();
  await preparing;
}

async function ensureQueue() {
  const q = await TrackPlayer.getQueue();
  if (q.length === 0) {
    await TrackPlayer.add([
      { id: 'bgm', url: require('../assets/bgm.mp3'), title: 'BGM' },
    ]);
    await TrackPlayer.setRepeatMode(RepeatMode.Queue);
  }
}

export const Music = {
  async start() {
    await setupOnce();
    await ensureQueue();
    await TrackPlayer.play();
  },
  async stop() {
    try {
      await TrackPlayer.stop();
    } finally {
      await TrackPlayer.reset();
    }
  },
  async setEnabled(on: boolean) {
    if (on) await this.start();
    else await this.stop();
  },
};

export default Music;
