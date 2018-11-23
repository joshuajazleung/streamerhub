<template>
    <v-expansion-panel popout expand>
        <v-expansion-panel-content>
            <div slot="header">How do I start streaming files?</div>
            <v-card>
                <v-card-text>
                    <p>
                        Streaming files is easy; simply drag and drop files directly to this page
                        and share the link to people.
                    </p>
                    <p>
                        If you want to stream video files, make sure they are in fragmented MP4
                        format.
                    </p>
                </v-card-text>
            </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content>
            <div slot="header">How do I download files?</div>
            <v-card>
                <v-card-text>
                    <p>
                        To download files, you need an info hash, magnet URI, or a torrent file
                        because the our underlying technology is utilizing
                        <a
                            target="_blank"
                            href="https://en.wikipedia.org/wiki/BitTorrent"
                            ref="noopener noreferrer"
                            >BitTorrent</a
                        >.
                    </p>
                    <p>
                        If you have an info hash ore magnet URI, copy and paste the string into the
                        below input box. With a torrent file, drag and drop the file to this page.
                    </p>
                    <p>
                        Once the file(s) is downloaded (when the process is 100%), click the
                        "DOWNLOAD ALL" button.
                    </p>
                </v-card-text>
            </v-card>
        </v-expansion-panel-content>
    </v-expansion-panel>
</template>
