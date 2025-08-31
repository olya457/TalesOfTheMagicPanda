package com.tales.of.the.magic.panda.music

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class MusicPackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext)
    = listOf<NativeModule>(MusicModule(reactContext))

  override fun createViewManagers(reactContext: ReactApplicationContext)
    = emptyList<ViewManager<*, *>>()
}
