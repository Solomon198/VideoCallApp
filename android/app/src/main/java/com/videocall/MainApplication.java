package com.videocall;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.rnaudiotranscoder.RNAudioTranscoderPackage;
import com.dooboolab.RNAudioRecorderPlayerPackage;
import com.rnfs.RNFSPackage;
import com.inprogress.reactnativeyoutube.ReactNativeYouTube;
import com.agontuk.RNFusedLocation.RNFusedLocationPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import io.invertase.firebase.fabric.crashlytics.RNFirebaseCrashlyticsPackage; // <-- Add this line
import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage; // <-- Add this line
import android.content.Intent;
import com.soundapp.SoundModulePackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.syan.agora.AgoraPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.auth.RNFirebaseAuthPackage; // <-- Add this line
import io.invertase.firebase.firestore.RNFirebaseFirestorePackage; // <-- Add this line
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage; // <-- Add this line
import io.invertase.firebase.database.RNFirebaseDatabasePackage; // <-- Add this line
import io.invertase.firebase.storage.RNFirebaseStoragePackage; // <-- Add this line
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage; // <-- Add this line
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNAudioTranscoderPackage(),
            new RNAudioRecorderPlayerPackage(),
            new RNFSPackage(),
            new ReactNativeYouTube(),
            new SplashScreenReactPackage(),
            new SoundModulePackage(),
            new VectorIconsPackage(),
            new AgoraPackage(),
            new RNFusedLocationPackage(),
            new PickerPackage(),
          new RNFirebasePackage(),
          new RNFirebaseAuthPackage(), // <-- Add this line
          new RNFirebaseFirestorePackage(), // <-- Add this line
          new RNFirebaseMessagingPackage(), // <-- Add this li
          new RNFirebaseDatabasePackage(),// <-- Add this line
          new RNFirebaseStoragePackage(), // <-- Add this line
          new RNFirebaseNotificationsPackage(), // <-- Add this line,
          new RNFirebaseCrashlyticsPackage(), // <-- Add this line
          new RNFirebaseAnalyticsPackage() // <-- Add this line


      

      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
