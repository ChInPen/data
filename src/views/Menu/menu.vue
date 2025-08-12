<script lang="ts" setup>
  import { ref } from 'vue'
  import { logout } from '@/utils/auth'
  import { useRouter } from 'vue-router'
  const router = useRouter()
  import { cIcon } from '@/components/Common'
  import layout from './layout.vue'
  import { message } from '@/components/Message/service'
  import { getMenuGroup } from '@/router/menu'

  const handleLogout = () => {
    logout()
    message.alert({
      type: 'success',
      message: '已登出',
      autoClose: 1,
      onConfirm: () => {
        router.push('/login')
      }
    })
  }

  const menu = getMenuGroup()

  const selectedItem = ref({
    title1: '',
    title2: '',
    title3: ''
  })

  const navigateTo = (path: string, title1: string, title2: string, title3: string) => {
    selectedItem.value = { title1, title2, title3 }
    router.push(`/menu/${path}`)
  }
</script>

<template>
  <v-app-bar class="header" density="compact" app>
    <v-app-bar-title class="header-title">工程商用系統</v-app-bar-title>

    <template v-slot:append>
      <div class="d-flex align-items-center px-2">
        <div class="text-custom-1 me-2">HS人員</div>
        <v-menu offset-y>
          <template #activator="{ props }">
            <v-btn v-bind="props" density="comfortable" icon>
              <!-- <v-icon>fa-solid fa-circle-user</v-icon> -->
              <c-icon icon="fa-solid fa-circle-user"></c-icon>
            </v-btn>
          </template>

          <v-list class="user-menu-list">
            <v-list-item>
              <v-btn variant="text" @click="handleLogout">登出</v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn variant="text" disabled>其他</v-btn>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </template>
  </v-app-bar>

  <v-navigation-drawer permanent class="sidebar" width="192">
    <v-list class="sidebar-list">
      <v-list-group v-for="(list1, i) in menu" :key="i">
        <template #activator="{ isOpen, props }">
          <v-list-item class="text-custom-1" min-height="40" v-bind="props">
            <template v-slot:append>
              <c-icon size="20" :icon="isOpen ? 'mdi-menu-down' : 'mdi-menu-right'" />
            </template>
            {{ list1.title }}
          </v-list-item>
        </template>

        <template v-if="'children' in list1">
          <v-list-group v-for="(list2, j) in list1.children" :key="j">
            <template #activator="{ isOpen, props }">
              <v-list-item class="text-custom-1 layer2" min-height="40" v-bind="props">
                <template v-slot:append>
                  <c-icon size="20" :icon="isOpen ? 'mdi-menu-down' : 'mdi-menu-right'" />
                </template>
                {{ list2.title }}
              </v-list-item>
            </template>

            <template v-if="'children' in list2">
              <template v-for="(item, k) in list2.children" :key="k">
                <v-list-item
                  v-if="'path' in item"
                  class="text-custom-1 layer3 clickable-item"
                  min-height="40"
                  :class="{
                    'selected-item':
                      selectedItem.title1 === list1.title &&
                      selectedItem.title2 === list2.title &&
                      selectedItem.title3 === item.title
                  }"
                  @click="navigateTo(item.path, list1.title, list2.title, item.title)"
                >
                  {{ item.title }}
                </v-list-item>
              </template>
            </template>
            <template v-else></template>
          </v-list-group>
        </template>
        <template v-else></template>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>

  <v-main>
    <layout>
      <router-view />
    </layout>
  </v-main>
</template>

<style scoped>
  .header {
    background: #092b43;
    border-bottom-color: #1e5a7a;
    border-bottom-style: solid;
    border-bottom-width: 1px;
    i {
      font-size: 36px;
    }
  }
  .header-title {
    font-size: 24px;
    font-weight: bold;
  }
  .v-list.user-menu-list {
    background-color: #1b2b36;

    .v-list-item {
      padding: 0;
      min-height: 0;
      min-width: 100px;

      .v-btn {
        font-weight: bold;
        font-size: 18px;
        width: 100%;
      }
    }
  }
  .sidebar {
    background-color: #092b43;
  }
  .sidebar-list {
    background-color: #092b43;
    padding: 0;

    .layer2 {
      color: #b3e5fc;
    }
    .layer3 {
      color: #ffccbc;
    }
  }

  .v-list-item {
    padding-inline-end: 12px !important;
  }

  .v-list-group {
    --list-indent-size: 8px;
  }

  .v-list-item:hover {
    background-color: #134666;
  }

  /* 滑鼠變 pointer */
  .clickable-item {
    cursor: pointer;
  }

  /* 被點選項目的背景色 */
  .selected-item {
    background-color: #1e5a7a !important;
  }
</style>
