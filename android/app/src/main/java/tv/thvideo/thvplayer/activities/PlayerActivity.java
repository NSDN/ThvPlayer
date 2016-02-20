package tv.thvideo.thvplayer.activities;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;

import org.w3c.dom.CharacterData;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import master.flame.danmaku.controller.DrawHandler;
import master.flame.danmaku.danmaku.model.BaseDanmaku;
import master.flame.danmaku.danmaku.model.DanmakuTimer;
import master.flame.danmaku.danmaku.model.IDisplayer;
import master.flame.danmaku.danmaku.model.android.DanmakuContext;
import master.flame.danmaku.danmaku.parser.BaseDanmakuParser;
import master.flame.danmaku.danmaku.parser.android.AndroidFileSource;
import master.flame.danmaku.danmaku.parser.android.BiliDanmukuParser;
import master.flame.danmaku.ui.widget.DanmakuView;
import tv.danmaku.ijk.media.player.IMediaPlayer;
import tv.danmaku.ijk.media.player.IjkMediaPlayer;
import tv.danmaku.ijk.media.sample.widget.media.IjkVideoView;
import tv.thvideo.thvplayer.R;
import tv.thvideo.thvplayer.ThisApp;

public class PlayerActivity extends Activity {
    IjkVideoView mVideoView;
    DanmakuView mDanmakuView;
    TextView mStatusText;

    DanmakuContext mContext;

    List<PlayPart> mPlayParts = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_player);

        // http://stackoverflow.com/questions/18512688/full-screen-application-android
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
            View.SYSTEM_UI_FLAG_FULLSCREEN);
        // http://stackoverflow.com/questions/2150287/force-an-android-activity-to-always-use-landscape-mode
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);

        IjkMediaPlayer.loadLibrariesOnce(null);
        IjkMediaPlayer.native_profileBegin("libijkplayer.so");

        mVideoView = (IjkVideoView) findViewById(R.id.player);
        mDanmakuView = (DanmakuView) findViewById(R.id.danmaku);
        mStatusText = (TextView) findViewById(R.id.status);

        mVideoView.setOnErrorListener(new IMediaPlayer.OnErrorListener() {
            @Override
            public boolean onError(IMediaPlayer mp, int what, int extra) {
                Toast.makeText(getApplicationContext(), "play video failed", Toast.LENGTH_SHORT).show();
                return false;
            }
        });

        mContext = DanmakuContext.create();
        mContext.setDanmakuStyle(IDisplayer.DANMAKU_STYLE_STROKEN, 3)
                .setDuplicateMergingEnabled(false)
                .setScrollSpeedFactor(1.2f)
                .setScaleTextSize(1.2f);

        int cid = 0;
        final String code;
        if (getIntent().getData() != null) {
            code = getIntent().getData().getPath().substring(1);
            Matcher matcher = Pattern.compile("cid=(\\d+)").matcher(code);
            if (matcher.find()) {
                try { cid = Integer.parseInt(matcher.group(1)); }
                catch (NumberFormatException e) { }
            }
        }
        else {
            code = null;
        }

        if (cid > 0) loadThvInfo(cid, new Response.Listener<List<PlayPart>>() {
            @Override
            public void onResponse(List<PlayPart> response) {
                playVideo(code != null ? code : mPlayParts.get(0).code);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Toast.makeText(getApplicationContext(), error.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
        else {
            Toast.makeText(this, "invalid video id", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        mVideoView.stopPlayback();
        mVideoView.release(true);

        mDanmakuView.release();

        IjkMediaPlayer.native_profileEnd();
    }

    static class PlayPart {
        String code;
        String title;
    }
    static Pattern playPartsPattern = Pattern.compile("<ul id=\"player_code\" mid=\"[^\"]+\"><li>(.*?)<\\/li>");
    void loadThvInfo(int cid, final Response.Listener<List<PlayPart>> resp, final Response.ErrorListener err) {
        mStatusText.setText("loading video info...");
        ThisApp.getRequestQueue().add(new StringRequest("http://thvideo.tv/v/th" + cid, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                mStatusText.setText("");
                mPlayParts.clear();
                Matcher matcher = playPartsPattern.matcher(response);
                if (matcher.find()) {
                    String content = matcher.group(1);
                    for (String sp : content.split("\\*\\*")) {
                        final String[] sk = sp.split("\\|");
                        if (sk.length > 0) mPlayParts.add(new PlayPart(){{
                            code = sk[0];
                            title = sk.length > 1 ? sk[1] : "";
                        }});
                    }
                }
                if (mPlayParts.size() > 0)
                    resp.onResponse(mPlayParts);
                else
                    err.onErrorResponse(new VolleyError("no parts found"));
            }
        }, err));
    }

    static class PlayUrl {
        String url;
    }
    void loadPlayUrl(String code, final Response.Listener<PlayUrl> resp, final Response.ErrorListener err) {
        mStatusText.setText("loading video content " + code + "...");
        ThisApp.getRequestQueue().add(new StringRequest("http://thvideo.tv/api/playurl.php?" + code, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                try {
                    mStatusText.setText("");
                    ByteArrayInputStream input = new ByteArrayInputStream(response.getBytes());
                    Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(input);
                    NodeList elems = doc.getDocumentElement().getElementsByTagName("url");
                    Node urlNode = elems.getLength() == 1 ? elems.item(0) : null;
                    if (urlNode != null && urlNode.getFirstChild() instanceof CharacterData) {
                        final String curl = ((CharacterData) urlNode.getFirstChild()).getData();
                        resp.onResponse(new PlayUrl() {{ url = curl; }});
                    }
                }
                catch (SAXException e) {
                    e.printStackTrace();
                    err.onErrorResponse(new VolleyError(e));
                }
                catch (ParserConfigurationException e) {
                    e.printStackTrace();
                    err.onErrorResponse(new VolleyError(e));
                }
                catch (IOException e) {
                    e.printStackTrace();
                    err.onErrorResponse(new VolleyError(e));
                }
            }
        }, err));
    }

    void loadComments(String code, final Response.Listener<BaseDanmakuParser> resp, final Response.ErrorListener err) {
        mStatusText.setText("loading comments " + code + "...");
        ThisApp.getRequestQueue().add(new StringRequest("http://thvideo.tv/comment?" + code, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                mStatusText.setText("");
                try {
                    // Note: default volley encoding is iso-8859-1
                    ByteArrayInputStream input = new ByteArrayInputStream(response.getBytes("ISO-8859-1"));
                    BiliDanmukuParser parser = new BiliDanmukuParser();
                    parser.load(new AndroidFileSource(input));
                    resp.onResponse(parser);
                }
                catch (Exception e) {
                    e.printStackTrace();
                    err.onErrorResponse(new VolleyError(e));
                }
            }
        }, err));
    }

    void playVideo(final String code) {
        loadPlayUrl(code, new Response.Listener<PlayUrl>() {
            @Override
            public void onResponse(final PlayUrl playUrl) {
                mVideoView.setVideoPath(playUrl.url);

                loadComments(code, new Response.Listener<BaseDanmakuParser>() {
                    @Override
                    public void onResponse(BaseDanmakuParser response) {
                        mDanmakuView.setCallback(new DrawHandler.Callback() {
                            @Override
                            public void prepared() {
                                mDanmakuView.start();
                                mVideoView.start();
                            }

                            @Override
                            public void updateTimer(DanmakuTimer timer) {
                            }

                            @Override
                            public void danmakuShown(BaseDanmaku danmaku) {
                            }

                            @Override
                            public void drawingFinished() {
                            }
                        });
                        mDanmakuView.prepare(response, mContext);
                        mDanmakuView.enableDanmakuDrawingCache(true);
                    }
                }, new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Toast.makeText(getApplicationContext(), "load comments failed", Toast.LENGTH_SHORT).show();

                        mVideoView.start();
                    }
                });
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Toast.makeText(getApplicationContext(), error.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

}
