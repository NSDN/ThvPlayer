package tv.thvideo.thvplayer;

import android.app.Application;

import com.android.volley.Cache;
import com.android.volley.Network;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.BasicNetwork;
import com.android.volley.toolbox.DiskBasedCache;
import com.android.volley.toolbox.HurlStack;

import java.io.File;

/**
 * Created by oxyflour on 2016/2/15.
 *
 */
public class ThisApp extends Application {
    private static RequestQueue requestQueue;
    public static RequestQueue getRequestQueue() {
        return requestQueue;
    }

    @Override
    public void onCreate() {
        super.onCreate();

        Cache cache = new DiskBasedCache(new File(getCacheDir(), "thvVolleyCache"), 1024 * 1024 * 32);
        Network network = new BasicNetwork(new HurlStack());
        requestQueue = new RequestQueue(cache, network);
        requestQueue.start();
    }
}
