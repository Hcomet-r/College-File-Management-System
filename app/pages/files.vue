<template>
    <v-layout class="rounded rounded-md border">
        <v-main>
             <v-card class="mx-auto">
                <v-container fluid>
                <v-row dense>
                 <v-col
                     v-for="card in cards"
                     :key="card.title"
                     :cols="card.flex"
                     >
              <v-card>
                <v-img
                 :src="card.src"
                 class="align-end"
                  gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                 height="200px"
                 cover
                >
                 <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
                <v-card-title class="text-white" v-text="card.title"/>
                </v-img>

            <v-card-actions>
              <v-spacer/>

              <v-btn
                color="medium-emphasis"
                icon="mdi-heart"
                size="small"
              />

              <v-btn
                color="medium-emphasis"
                icon="mdi-bookmark"
                size="small"
              />

              <v-btn
                color="medium-emphasis"
                icon="mdi-share-variant"
                size="small"
              />
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
            </v-main>
    </v-layout>
</template>

<script setup>
      const cards = [
    { title: 'Pre-fab homes', src: 'https://cdn.vuetifyjs.com/images/cards/house.jpg', flex: 12 },
    { title: 'Favorite road trips', src: 'https://cdn.vuetifyjs.com/images/cards/road.jpg', flex: 6 },
    { title: 'Best airlines', src: 'https://cdn.vuetifyjs.com/images/cards/plane.jpg', flex: 6 },
  ]
</script>
<style scoped>
  
</style>