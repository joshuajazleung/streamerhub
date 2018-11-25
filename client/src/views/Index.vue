<template>
    <div>
        <v-alert v-if="!isBrowserSupported" :value="true" type="error" class="mb-5">
            This browser is unsupported. Please use the latest modern browsers such as Google Chrome
            or Firefox.
        </v-alert>
        <h1>What is StreamerHub?</h1>
        <p>
            StreamerHub is a Peer-to-Peer file streaming service. It allows users to directly stream
            files to other users.
        </p>
        <p>
            The more people are downloading the same file, the faster the streaming speed will be.
            So, share the link to other people as much as you can if you want fast streaming speed.
        </p>
        <fqa></fqa>
        <Adsense data-ad-client="ca-pub-4679085340013866" data-ad-slot="6511749031"></Adsense>
        <div v-if="loading" class="mt-5">
            <p class="text-center text-2xl text-white">
                File is being loaded from the server. Please wait.
            </p>
            <v-progress-linear :indeterminate="true"></v-progress-linear>
        </div>
        <div class="mt-5" v-if="isSeeding">
            <h2>Seeding</h2>
            <p>
                You are seeding the files. Open this browser window as long as possible until the
                "ratio" reach 1.00 or higher. Otherwise other people won't be able to download.
            </p>
            <div v-for="(perSeed, i) in seedInfo" :key="i">
                <p>
                    Share this link to people:
                    <a target="_blank" class="text-white" :href="'/#' + perSeed.infoHash"
                        >{{ appURL }}#{{ perSeed.infoHash }}</a
                    >
                </p>
                <p>
                    <a :href="perSeed.magnetURI" class="text-white">Magnet URI</a>|
                    <a
                        :href="perSeed.torrentFileBlobURL"
                        :download="perSeed.torrentFileName"
                        class="text-white"
                        target="_blank"
                        >Torrent File</a
                    >
                </p>
                <p>
                    File Size: {{ perSeed.info.length | humanBytes }} Peers:
                    {{ perSeed.info.peers }}, UploadSpeed: {{ perSeed.info.uploadSpeed }}, Ratio:
                    {{ perSeed.info.ratio }}
                </p>
                <ul>
                    <li v-for="(file, i) in perSeed.fileList" :key="i">{{ file.name }}</li>
                </ul>
            </div>
        </div>
        <div class="text-center mt-3">
            <v-btn
                v-if="typeOfDownload === 'magnet'"
                target="_blank"
                :href="magnetURI"
                depressed
                large
                color="success"
                >DOWNLOAD FILE</v-btn
            >
        </div>
        <div id="videoList" class="videoList mt-5" ref="videoList"></div>
        <Adsense data-ad-client="ca-pub-4679085340013866" data-ad-slot="6511749031"></Adsense>
        <div v-if="typeOfDownload !== 'magnet' && addedFiles" class="mt-5">
            <h2>Info</h2>
            <p class="mb-5">
                File size: {{ torrentInfo.length | humanBytes }}, Progress:
                {{ torrentInfo.progress }}, Peers: {{ torrentInfo.peers }}, Download Speed:
                {{ torrentInfo.downloadSpeed }}, Upload Speed: {{ torrentInfo.uploadSpeed }}, ETA:
                {{ torrentInfo.remaining }}, Ratio: {{ torrentInfo.ratio }}
            </p>
            <h2>File List</h2>
            <v-btn
                :disabled="!downloadURLs.direct"
                :download="filename"
                :href="downloadURLs.direct"
                depressed
                large
            >
                DOWNLOAD ALL
                <span class="pl-2" v-if="torrentInfo.progress != '100%'"
                    >( {{ torrentInfo.progress }} )</span
                >
            </v-btn>
            <v-btn
                :download="torrentFilename"
                target="_blank"
                :href="downloadURLs.torrent"
                depressed
                large
                >DOWNLOAD TORRENT</v-btn
            >
            <v-btn :href="shareURL" depressed large @click.prevent="onShare">SHARE</v-btn>
            <Adsense data-ad-client="ca-pub-4679085340013866" data-ad-slot="6511749031"></Adsense>
            <v-list>
                <v-list-tile v-for="file in files" :key="file.name">
                    <v-list-tile-content>
                        <v-list-tile-title>{{ file.name }}</v-list-tile-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <v-flex>
                            <v-btn
                                v-if="file.name.endsWith('.mp4')"
                                depressed
                                small
                                @click="stream(file);"
                                >Stream</v-btn
                            >
                            <v-btn
                                :download="file.name"
                                v-if="file.url"
                                :href="file.url"
                                class="ml-3"
                                depressed
                                small
                                >Download</v-btn
                            >
                        </v-flex>
                    </v-list-tile-action>
                </v-list-tile>
            </v-list>
        </div>
        <h2 class="mt-5">Start streaming</h2>
        <p>
            Drag-and-drop files to begin seeding. Or choose files from your computer:
            <input type="file" ref="seedFiles" @change="onFilesChange" multiple />
        </p>
        <h2 class="mt-5">Start downloading/watching</h2>
        <p>
            Download from a magnet link or info hash
            <v-form>
                <v-text-field v-model="torrentId" solo :hide-details="true" required></v-text-field>
                <v-btn color="info" class="mt-3" @click="onDownload">Download</v-btn>
            </v-form>
        </p>
    </div>
</template>

<script>
import dragDrop from 'drag-drop';
import WebTorrent from 'webtorrent/webtorrent.min';
import { throttle } from 'lodash';
import prettierBytes from 'prettier-bytes';
import moment from 'moment';
import path from 'path';
import JSZip from 'jszip';
import createTorrent from 'create-torrent';
import parseTorrent from 'parse-torrent';

import FQA from '../components/FQA.vue';

export default {
    metaInfo() {
        return {
            title: this.$route.meta.title
        };
    },
    components: { fqa: FQA },
    filters: {
        humanBytes(value) {
            return prettierBytes(value);
        }
    },
    computed: {
        appURL() {
            return `${window.location.protocol}//${window.location.host}/`;
        },
        shareURL() {
            return `${this.appURL}#${this.torrentInfo.infoHash}`;
        }
    },
    data: () => ({
        loading: '',
        typeOfDownload: '',
        magnetURI: '',
        isBrowserSupported: WebTorrent.WEBRTC_SUPPORT,
        client: {},
        torrentId: '',
        addedFiles: false,
        files: [],
        torrentInfo: {
            progress: '',
            peers: '',
            downloadSpeed: '',
            uploadSpeed: '',
            remaining: '',
            ratio: '',
            length: '',
            infoHash: ''
        },
        downloadURLs: {
            torrent: '',
            direct: ''
        },
        filename: '',
        torrentFilename: '',
        isSeeding: false,
        seedInfo: []
    }),
    mounted() {
        this.setTrackers();

        this.client = new WebTorrent({
            tracker: {
                rtcConfig: {
                    iceServers: [
                        {
                            urls: 'stun:global.stun.twilio.com:3478?transport=udp'
                        },
                        {
                            username:
                                '0d9ae041f0ed80742ab4a85be7c8ccf876ee777f7f4cb6074f3870506ac3e512',
                            credential: 'oK3Ick8teo0E5JxlIq91frF/7060U/6Y5gER1HYnYAc=',
                            urls: 'turn:global.turn.twilio.com:3478?transport=udp'
                        },
                        {
                            username:
                                '0d9ae041f0ed80742ab4a85be7c8ccf876ee777f7f4cb6074f3870506ac3e512',
                            credential: 'oK3Ick8teo0E5JxlIq91frF/7060U/6Y5gER1HYnYAc=',
                            urls: 'turn:global.turn.twilio.com:3478?transport=tcp'
                        },
                        {
                            username:
                                '0d9ae041f0ed80742ab4a85be7c8ccf876ee777f7f4cb6074f3870506ac3e512',
                            credential: 'oK3Ick8teo0E5JxlIq91frF/7060U/6Y5gER1HYnYAc=',
                            urls: 'turn:global.turn.twilio.com:443?transport=tcp'
                        }
                    ]
                }
            }
        });

        if (location.hash) {
            this.loading = true;
            const infoHash = location.hash.substr(1);
            this.magnetURI = parseTorrent.toMagnetURI({
                infoHash
            });

            this.download(infoHash);

            setTimeout(() => {
                if (this.loading) {
                    this.typeOfDownload = 'magnet';
                    this.loading = false;
                }
            }, 3000);
        }

        dragDrop('#main', {
            onDrop: files => {
                // .torrent file = start downloading the torrent
                files.filter(this.isTorrentFile).forEach(this.downloadTorrentFile);

                // everything else = seed these files
                this.seed(files.filter(this.isNotTorrentFile));
            }
        });
    },
    methods: {
        onFilesChange() {
            const files = [...this.$refs.seedFiles.files];

            // .torrent file = start downloading the torrent
            files.filter(this.isTorrentFile).forEach(this.downloadTorrentFile);

            // everything else = seed these files
            this.seed(files.filter(this.isNotTorrentFile));
        },

        isTorrentFile(file) {
            const extname = path.extname(file.name).toLowerCase();
            return extname === '.torrent';
        },

        isNotTorrentFile(file) {
            return !this.isTorrentFile(file);
        },

        onDownload() {
            this.download(this.torrentId.trim());
        },

        downloadTorrentFile(file) {
            this.download(file);
        },

        seed(files) {
            if (files.length === 0) {
                return;
            }

            this.client.seed(files, torrent => {
                this.isSeeding = true;

                const info = {
                    peers: torrent.numPeers,
                    uploadSpeed: `${prettierBytes(torrent.uploadSpeed)}/s`,
                    ratio: (torrent.ratio / torrent.length).toFixed(2),
                    length: torrent.length
                };

                const torrentFileName =
                    path.basename(torrent.name, path.extname(torrent.name)) + '.torrent';

                this.seedInfo.push({
                    info,
                    fileList: torrent.files,
                    infoHash: torrent.infoHash,
                    magnetURI: torrent.magnetURI,
                    torrentFileBlobURL: torrent.torrentFileBlobURL,
                    torrentFileName
                });

                const updateSeedInfo = () => {
                    info.peers = torrent.numPeers;
                    info.uploadSpeed = `${prettierBytes(torrent.uploadSpeed)}/s`;
                    info.ratio = (torrent.ratio / torrent.length).toFixed(2);
                };

                torrent.on('upload', throttle(updateSeedInfo, 250));
                setInterval(updateSeedInfo, 5000);
            });
        },

        download(torrentId) {
            let downloadedFiles = 0;

            this.client.add(torrentId, torrent => {
                this.torrentId = '';
                this.filename = path.basename(torrent.name, path.extname(torrent.name)) + '.zip';
                let zip = new JSZip();
                this.addedFiles = true;
                let hasVideoPlayed = false;

                this.downloadURLs.torrent = torrent.torrentFileBlobURL;
                this.torrentFilename =
                    path.basename(torrent.name, path.extname(torrent.name)) + '.torrent';

                torrent.files.forEach(file => {
                    this.files.push(file);

                    if (file.name.endsWith('.mp4') && !hasVideoPlayed) {
                        file.appendTo('#videoList', { autoplay: true, muted: true }, function(err) {
                            if (err) {
                                console.log(err);
                            }
                        });
                        hasVideoPlayed = true;
                    }
                });

                this.torrentInfo.infoHash = torrent.infoHash;
                this.torrentInfo.length = torrent.length;

                const updateTorrentInfo = () => {
                    this.torrentInfo.progress = (torrent.progress * 100).toFixed(1) + '%';
                    this.torrentInfo.peers = torrent.numPeers;
                    this.torrentInfo.downloadSpeed = `${prettierBytes(torrent.downloadSpeed)}/s`;
                    this.torrentInfo.uploadSpeed = `${prettierBytes(torrent.uploadSpeed)}/s`;
                    this.torrentInfo.ratio = torrent.ratio.toFixed(2);

                    if (torrent.done) {
                        this.torrentInfo.remaining = 'Done.';
                    } else {
                        this.torrentInfo.remaining = moment
                            .duration(torrent.timeRemaining / 1000, 'seconds')
                            .humanize();
                        this.torrentInfo.remaining =
                            this.torrentInfo.remaining[0].toUpperCase() +
                            this.torrentInfo.remaining.substring(1) +
                            ' remaining.';
                    }
                };

                torrent.on('download', throttle(updateTorrentInfo, 250));
                torrent.on('upload', throttle(updateTorrentInfo, 250));
                setInterval(updateTorrentInfo, 5000);
                updateTorrentInfo();

                this.client.on('torrent', () => {
                    this.loading = false;
                });

                torrent.on('done', () => {
                    torrent.files.forEach(file => {
                        file.getBlobURL(function callback(err, url) {
                            if (err)
                                console.log('Error on getting torrent-file: ', torrent.file.name);
                            file.url = url;
                        });

                        file.getBlob((err, blob) => {
                            downloadedFiles += 1;
                            console.log(downloadedFiles);
                            if (err) {
                                console.log(err);
                                return;
                            }

                            // add file to zip
                            zip.file(file.path, blob);

                            // start the download when all files have been added
                            if (downloadedFiles === torrent.files.length) {
                                if (torrent.files.length > 1) {
                                    // generate the zip relative to the torrent folder
                                    zip = zip.folder(torrent.name);
                                }
                                zip.generateAsync({ type: 'blob' }).then(blob => {
                                    this.downloadURLs.direct = URL.createObjectURL(blob);
                                    console.log('direct: ' + this.downloadURLs.direct);
                                    setTimeout(() => {
                                        URL.revokeObjectURL(this.downloadURLs.direct);
                                        this.downloadURLs.direct = '';
                                    }, 3600 * 1000);
                                }, console.error);
                            }
                        });
                    });
                });
            });
        },

        stream(file) {
            this.$refs.videoList.innerHTML = '';
            file.appendTo('#videoList');
        },

        setTrackers() {
            global.WEBTORRENT_ANNOUNCE = createTorrent.announceList
                .map(function(arr) {
                    return arr[0];
                })
                .filter(function(url) {
                    return url.indexOf('wss://') === 0 || url.indexOf('ws://') === 0;
                });
        },

        onShare() {
            prompt('Share this link with anyone you want to download this file:', this.shareURL);
        }
    }
};
</script>

<style lang="scss">
a {
    color: white;
}

video {
    width: 100%;
}

.drag {
    &:before {
        content: '';
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        border: 5px red dashed;
        background: rgba(229, 56, 29, 0.6);
        z-index: 100;
    }
}

.videoList {
    video {
        width: 100%;
    }
}
</style>
