<template>
    <v-app id="inspire" dark>
        <v-toolbar app fixed clipped-left>
            <!-- <v-toolbar-side-icon @click.stop="drawer = !drawer;"></v-toolbar-side-icon> -->
            <v-toolbar-title>StreamerHub</v-toolbar-title>
        </v-toolbar>
        <v-content id="main">
            <v-container fluid>
                <v-layout justify-center align-center>
                    <v-flex shrink>
                        <router-view></router-view>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>
        <v-footer app fixed class="pl-4">
            <span>StreamerHub &copy; 2018</span>
        </v-footer>
    </v-app>
</template>

<script>
export default {
    props: {
        source: String
    }
};
</script>
