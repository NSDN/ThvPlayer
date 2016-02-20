package tv.thvideo.thvplayer;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.github.xinthink.rnmk.ReactMaterialKitPackage;

import java.util.Arrays;
import java.util.List;

import me.neo.react.StatusBarPackage;

public class MainActivity extends ReactActivity {
    @Override
    protected String getMainComponentName() {
        if (getIntent().getData() != null)
            return getIntent().getData().getHost();
        return "main";
    }

    @Override
    protected boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
              new MainReactPackage(),
              new ReactMaterialKitPackage(),
              new StatusBarPackage(this)
      );
    }
}
