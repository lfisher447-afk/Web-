var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
window.WebSocket = (function (_super) {
    function __IB_WebSocket() {
        const args = Array.prototype.slice.call(arguments);

        var videoInfo = new Object();
        videoInfo.type = "wss";
        videoInfo.from = self.document.location.href;
        videoInfo.wssAddress = args[0];
        var videos = self.document.getElementsByTagName('video');

        ibFindAllVideos();

        if (typeof jwplayer == 'function') {
            try {
                var playlists = jwplayer().getPlaylist();

                for (var p = 0; p < playlists.length; p++) {
                    var playlist = playlists[p];

                    var jSources = playlist.sources;
                    for (var i = 0; i < jSources.length; i++) {
                        var jSource = jSources[i];
                        videoInfo.videoSource = jSource.file;
                    }
                }
            } catch (jwe) {
                //  ibLog("Error with jw player "+jwe);
            }
        }
        ibSend(videoInfo);
        return new _super(...args);
    }
    return __IB_WebSocket;
}(window.WebSocket));
window.WebSocket = IBWebSocket
