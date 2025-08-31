package com.tales.of.the.magic.panda.music

import android.media.MediaPlayer
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class MusicModule(private val ctx: ReactApplicationContext)
  : ReactContextBaseJavaModule(ctx) {

  private var player: MediaPlayer? = null
  override fun getName() = "Music"

  private fun ensurePlayer() {
    if (player == null) {
      val resId = ctx.resources.getIdentifier("bgm", "raw", ctx.packageName)
      if (resId != 0) {
        player = MediaPlayer.create(ctx, resId).apply {
          isLooping = true
          setOnErrorListener { mp, _, _ ->
            try { mp.reset(); mp.release() } catch (_: Throwable) {}
            player = null
            false
          }
        }
      }
    }
  }

  @ReactMethod
  fun start() {
    ensurePlayer()
    player?.let { if (!it.isPlaying) it.start() }
  }

  @ReactMethod
  fun stop() {
    player?.let {
      try { if (it.isPlaying) it.pause(); it.stop() } catch (_: Throwable) {}
      it.reset()
      it.release()
    }
    player = null
  }

  @ReactMethod
  fun setEnabled(on: Boolean) {
    if (on) start() else stop()
  }
}
