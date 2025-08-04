<script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import bgpic from '@/assets/LoginBg.jpg'
  import logopic from '@/assets/HslLogo.jpg'
  import { cButton, cInput } from '@/components/common'
  import api from '@/api'
  import { baseCallApi } from '@/utils/uapi'
  import { login } from '@/utils/auth'
  import { useRouter } from 'vue-router'
  const router = useRouter()
  import { message } from '@/components/Message/service'

  const comp = ref<string>('')
  const username = ref<string>('')
  const password = ref<string>('')
  const check_code = ref<string>('')
  const check_code_id = ref<string>('')
  const check_code_jpg = ref<string>('')

  const getCheckCode = () => {
    baseCallApi({
      method: 'GET',
      url: api.Login.GetValidateCode
    }).then((response: any) => {
      if ('check_code' in response) check_code_jpg.value = response.check_code
      if ('check_code_id' in response) check_code_id.value = response.check_code_id
    })
  }

  const handleLogin = async () => {
    const res = await login(
      username.value,
      password.value,
      comp.value,
      check_code.value,
      check_code_id.value
    )
    if (res) {
      message.alert({
        type: 'success',
        message: '登入成功',
        autoClose: 1,
        onConfirm: () => {
          router.push('/menu')
        }
      })
    } else {
      message.alert({
        type: 'error',
        message: '登入失敗',
        autoClose: 2,
        onConfirm: () => {
          getCheckCode()
        }
      })
    }
  }

  onMounted(() => {
    getCheckCode()
  })
</script>

<template>
  <div class="login-wrapper">
    <div class="login-box">
      <v-container fluid class="pa-0 fill-height">
        <v-row no-gutters class="fill-height">
          <v-col class="pa-0">
            <v-img class="h-100" cover :src="bgpic" />
          </v-col>

          <!-- 右邊輸入表單區塊 -->
          <v-col cols="auto" class="right-area d-flex">
            <v-card variant="text" class="login-card">
              <v-card-text>
                <!--Logo-->
                <v-img class="logo-img" :src="logopic"></v-img>
                <div class="text-custom-title-1 text-center">工程業商用系統</div>

                <!--公司編號-->
                <c-input
                  v-model="comp"
                  class="mt-3"
                  label="公司編號"
                  icon="fa-solid fa-briefcase"
                />
                <!--帳號-->
                <c-input
                  v-model="username"
                  class="mt-2"
                  label="使用者帳號"
                  icon="fa-solid fa-user"
                />
                <!--密碼-->
                <c-input
                  v-model="password"
                  class="mt-2"
                  label="使用者密碼"
                  icon="fa-solid fa-unlock-keyhole"
                  type="password"
                />
                <!--驗證碼-->
                <v-row no-gutters class="mt-2 d-flex align-items-center">
                  <v-col class="me-1">
                    <c-input v-model="check_code" label="驗證碼" />
                  </v-col>
                  <v-col cols="auto" class="mx-1">
                    <v-img
                      v-show="check_code_jpg"
                      class="checkcode-img"
                      :src="check_code_jpg"
                    ></v-img>
                  </v-col>
                  <v-col cols="auto" class="ms-1">
                    <c-button icon="fa-solid fa-sync-alt" @click="getCheckCode" />
                  </v-col>

                  <v-col cols="12">
                    <c-button
                      value="登入"
                      icon="fa-solid fa-right-to-bracket"
                      kind="login"
                      class="mt-4"
                      @click="handleLogin"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<style scoped>
  .login-wrapper {
    position: absolute;
    inset: 10px; /* 四邊都距離 10px */
    display: flex;
    flex-direction: column;
  }

  .login-box {
    flex: 1; /* 撐滿剩下的高度 */
    height: 100%;
    background-color: #092b43;
    /* overflow: hidden; */
  }

  .right-area {
    width: 791px;
  }

  .login-card {
    width: 550px;
    margin: auto;
  }

  .logo-img {
    margin: auto;
    height: 12rem;
    width: 12rem;
    border-radius: 50%;
    object-fit: cover;
  }

  .checkcode-img {
    width: 100px;
    height: 40px;
  }
</style>
