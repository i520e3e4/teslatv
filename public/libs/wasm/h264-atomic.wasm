<!DOCTYPE html>
<html lang="zh-cn">

<head>
    <meta charset="UTF-8">
    <title>火狐解析播放器</title>
    <meta name="referrer" content="never">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"><!-- IE内核 强制使用最新的引擎渲染网页 -->
    <meta name="renderer" content="webkit"> <!-- 启用360浏览器的极速模式(webkit) -->
    <meta name="viewport"
        content="width=device-width,initial-scale=1.0,minimum-scale=1.0 ,maximum-scale=1.0, user-scalable=no">
    <meta name="x5-fullscreen" content="true"> <!-- 手机H5兼容模式 -->
    <meta name="x5-page-mode" content="app"> <!-- X5  全屏处理 -->
    <meta name="full-screen" content="yes">
    <meta name="browsermode" content="application"> <!-- UC 全屏应用模式 -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" /> <!--  苹果全屏应用模式 -->
    <!-- <script src="https://hd.ijycnd.com/js/1.25.1/DPlayer.min.js"></script>-->
    <!--<script src="https://hd.ijycnd.com/js/1.1.5/hls.js"></script>-->
    <!--<script src="/js/1.25.1/DPlayer.min.js"></script>-->
    <!--<script src="/js/1.1.5/hls.min.js"></script>-->
      <!--<script src="//lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/hls.js/1.1.5/hls.js"></script>-->
      <!--<script src="//lf6-cdn-tos.bytecdntp.com/cdn/expire-1-y/dplayer/1.26.0/DPlayer.min.js"></script>-->
      <script src="https://s2.pstatp.com/cdn/expire-1-M/hls.js/1.1.5/hls.js"></script>
      <script src="https://s2.pstatp.com/cdn/expire-1-M/dplayer/1.25.1/DPlayer.min.js"></script>
      
      
      
</head>

<style>
    :root {
        --plyr-color-main: #00b2ff;
    }

    body,
    html {
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        overflow-x: hidden;
        overflow-y: hidden;
        background-color: black;
    }

    #dplayer {
        width: 100%;
        height: 100%;
    }

    .plyr--video {
        height: 100%;
    }
</style>

<body>
    <div id="dplayer"></div>

    <script>
        window.onload = () => {
            const vid = window.location.href.split("url=")[1];

            new DPlayer({
                container: document.getElementById('dplayer'),
                autoplay: true,
                video: {
                    url: vid,
                    type: 'hls',
                },
                // lang:"en",
                pluginOptions: {
                    hls: {
                    maxBufferLength: 120,           // 最大缓冲秒数
                    maxMaxBufferLength: 120,        // 最大允许的缓冲秒数
                    // startFragPrefetch: true,         // 启用预取下一个分片
                    // autoStartLoad: true,             // 页面加载自动播放
                    // startLoad: 0,                    // 从0开始加载
                    // maxBufferSize: 1024 * 1024 * 1024 // 最大缓冲区大小：1GB
                    },
                },
            });
        }
    </script>
<!--    <script charset="UTF-8" id="LA_COLLECT" src="//sdk.51.la/js-sdk-pro.min.js"></script>-->
<!--<script>LA.init({id:"KGj5hgKuNt1vypZd",ck:"KGj5hgKuNt1vypZd"})</script>-->
</body>