<script setup lang="ts">
import HanziWriter from 'hanzi-writer'

definePage({
  name: 'stroke-order',
  style: {
    navigationBarTitleText: '汉字笔画顺序',
  },
})

// 常用汉字列表（按年级分组）
const commonChars = ref([
  { label: '一年级', chars: '一二三四五六七八九十上下大小多少左右前后天地人' },
  { label: '二年级', chars: '春夏秋冬风雨雪花草树江河湖海山林田土' },
  { label: '三年级', chars: '读写画说听看想念思考学习问答题课文' },
])

// 状态
const inputChar = ref('')
const currentChar = ref('')
const strokeCount = ref(0)
const isLoading = ref(false)
const loadError = ref('')
const isAnimating = ref(false)
const isQuizzing = ref(false)
const quizMistakes = ref(0)
const quizComplete = ref(false)
const showCharGrid = ref(false)

// hanzi-writer 实例
let writerInstance: any = null
let writerContainer: HTMLElement | null = null

// 判断是否为汉字
function isChineseChar(char: string): boolean {
  return /^[\u4E00-\u9FFF]$/.test(char)
}

// 加载汉字
async function loadCharacter(char: string) {
  if (!isChineseChar(char)) {
    loadError.value = '请输入一个有效的汉字'
    return
  }

  loadError.value = ''
  isLoading.value = true
  currentChar.value = char
  strokeCount.value = 0
  isAnimating.value = false
  isQuizzing.value = false
  quizMistakes.value = 0
  quizComplete.value = false

  // 销毁旧实例
  destroyWriter()

  try {
    // 使用 nextTick 等待 DOM 更新
    await nextTick()

    writerContainer = document.getElementById('writer-target')
    if (!writerContainer) {
      loadError.value = '渲染容器未找到'
      isLoading.value = false
      return
    }

    // 清空容器
    writerContainer.innerHTML = ''

    writerInstance = HanziWriter.create('writer-target', char, {
      width: 280,
      height: 280,
      padding: 20,
      showOutline: true,
      showCharacter: true,
      strokeColor: '#333333',
      outlineColor: '#DDDDDD',
      delayBetweenStrokes: 300,
      strokeAnimationSpeed: 1,
      highlightOnComplete: true,
      onLoadCharDataSuccess: (data: any) => {
        strokeCount.value = data.strokes.length
        isLoading.value = false
        showCharGrid.value = true
      },
      onLoadCharDataError: (reason?: string | Error) => {
        loadError.value = `加载汉字数据失败: ${reason}`
        isLoading.value = false
      },
    })
  }
  catch (err: any) {
    loadError.value = `加载失败: ${err.message || '未知错误'}`
    isLoading.value = false
  }
}

// 销毁 writer 实例
function destroyWriter() {
  if (writerInstance) {
    try {
      writerInstance.cancelQuiz?.()
    }
    catch {}
    writerInstance = null
  }
  if (writerContainer) {
    writerContainer.innerHTML = ''
    writerContainer = null
  }
  showCharGrid.value = false
}

// 播放笔画动画
function animateCharacter() {
  if (!writerInstance || isAnimating.value) {
    return
  }
  isAnimating.value = true
  isQuizzing.value = false
  quizComplete.value = false
  try {
    writerInstance.cancelQuiz?.()
  }
  catch {}
  writerInstance.animateCharacter({
    onComplete: () => {
      isAnimating.value = false
    },
  })
}

// 循环播放动画
function loopAnimation() {
  if (!writerInstance) {
    return
  }
  isAnimating.value = true
  isQuizzing.value = false
  quizComplete.value = false
  try {
    writerInstance.cancelQuiz?.()
  }
  catch {}
  writerInstance.loopCharacterAnimation({
    delayBetweenLoops: 2000,
  })
}

// 停止动画
function stopAnimation() {
  if (!writerInstance) {
    return
  }
  isAnimating.value = false
  try {
    writerInstance.cancelQuiz?.()
    writerInstance.setCharacter(currentChar.value)
  }
  catch {}
}

// 开始测验
function startQuiz() {
  if (!writerInstance || isQuizzing.value) {
    return
  }
  isQuizzing.value = true
  isAnimating.value = false
  quizMistakes.value = 0
  quizComplete.value = false
  try {
    writerInstance.cancelQuiz?.()
  }
  catch {}

  // 清理旧实例，但保持 showCharGrid 为 true（不隐藏田字格容器）
  writerInstance = null
  if (writerContainer) {
    writerContainer.innerHTML = ''
  }

  nextTick(() => {
    writerContainer = document.getElementById('writer-target')
    if (!writerContainer) {
      return
    }
    writerContainer.innerHTML = ''

    writerInstance = HanziWriter.create('writer-target', currentChar.value, {
      width: 280,
      height: 280,
      padding: 20,
      showCharacter: false,
      showOutline: true,
      outlineColor: '#DDDDDD',
      showHintAfterMisses: 3,
      highlightOnComplete: true,
      onLoadCharDataSuccess: () => {
        showCharGrid.value = true
        writerInstance.quiz({
          onMistake: (strokeData: any) => {
            quizMistakes.value = strokeData.totalMistakes
          },
          onCorrectStroke: () => {},
          onComplete: (summaryData: any) => {
            quizMistakes.value = summaryData.totalMistakes
            quizComplete.value = true
            isQuizzing.value = false
          },
        })
      },
    })
  })
}

// 输入处理
function handleInput(e: any) {
  const val = e.detail.value || e.target.value || ''
  inputChar.value = val
}

// 确认查询
function handleSearch() {
  const char = inputChar.value.trim().slice(-1) // 取最后一个字符
  if (char) {
    loadCharacter(char)
  }
}

// 点击常用字
function handleCharClick(char: string) {
  inputChar.value = char
  loadCharacter(char)
}

// 组件卸载时清理
onUnmounted(() => {
  destroyWriter()
})
</script>

<template>
  <view class="min-h-screen pb-6">
    <!-- 顶部介绍 -->
    <view class="mx-3 mt-3 mb-4">
      <view class="rounded-3 px-5 py-6 text-center wot-bg-filled-oppo">
        <view class="mb-2 text-10">
          ✍️
        </view>
        <view class="mb-2 text-6 font-bold wot-text-text-main">
          汉字笔画顺序
        </view>
        <view class="text-3 leading-relaxed wot-text-text-secondary">
          输入汉字，查看笔画顺序动画，还可以进行书写练习
        </view>
      </view>
    </view>

    <!-- 搜索区域 -->
    <view class="mx-3 mb-4">
      <view class="rounded-2 p-4 wot-bg-filled-oppo">
        <view class="mb-3 text-4 font-bold wot-text-text-main">
          输入汉字
        </view>
        <view class="flex items-center gap-3">
          <input
            class="flex-1 rounded-2 border px-4 py-3 text-4 wot-border-border-main wot-bg-bg wot-text-text-main"
            type="text"
            placeholder="请输入一个汉字，如：永"
            :maxlength="1"
            :value="inputChar"
            @input="handleInput"
            @confirm="handleSearch"
          >
          <wd-button
            type="primary"
            size="small"
            @click="handleSearch"
          >
            查询
          </wd-button>
        </view>
        <view v-if="loadError" class="mt-2 text-3 text-red-500">
          {{ loadError }}
        </view>
      </view>
    </view>

    <!-- 常用汉字 -->
    <view class="mx-3 mb-4">
      <view class="rounded-2 p-4 wot-bg-filled-oppo">
        <view class="mb-3 text-4 font-bold wot-text-text-main">
          常用汉字
        </view>
        <view
          v-for="group in commonChars"
          :key="group.label"
          class="mb-3 last:mb-0"
        >
          <view class="mb-2 text-3 wot-text-text-secondary">
            {{ group.label }}
          </view>
          <view class="flex flex-wrap gap-2">
            <view
              v-for="char in group.chars.split('')"
              :key="char"
              class="flex h-9 w-9 items-center justify-center rounded text-4 transition-all active:scale-95 wot-bg-bg wot-text-text-main"
              :class="[
                currentChar === char
                  ? 'ring-2 ring-blue-500 text-blue-600 font-bold'
                  : 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
              ]"
              @click="handleCharClick(char)"
            >
              {{ char }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 田字格展示区域 -->
    <view v-if="showCharGrid || isLoading" class="mx-3 mb-4">
      <view class="rounded-2 p-4 wot-bg-filled-oppo">
        <view class="mb-3 text-4 font-bold wot-text-text-main">
          {{ currentChar }} - 笔画顺序
          <text v-if="strokeCount > 0" class="ml-2 text-3 font-normal wot-text-text-secondary">
            共 {{ strokeCount }} 画
          </text>
        </view>

        <!-- 田字格容器 -->
        <view class="flex justify-center">
          <view class="tian-zi-ge relative">
            <!-- 田字格背景线 -->
            <view class="tian-zi-ge-bg absolute inset-0 pointer-events-none">
              <!-- 横虚线 -->
              <view class="absolute top-1/2 left-0 w-full border-t border-dashed border-red-300 opacity-50" />
              <!-- 竖虚线 -->
              <view class="absolute top-0 left-1/2 h-full border-l border-dashed border-red-300 opacity-50" />
            </view>
            <!-- hanzi-writer 渲染目标 -->
            <view id="writer-target" class="relative z-1" />
            <!-- 加载状态 -->
            <view
              v-if="isLoading"
              class="absolute inset-0 z-20 flex items-center justify-center bg-white/60 dark:bg-gray-800/60"
            >
              <wd-loading />
            </view>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="mt-4 flex flex-wrap justify-center gap-3">
          <wd-button
            type="primary"
            size="small"
            :disabled="isAnimating || isQuizzing"
            @click="animateCharacter"
          >
            播放动画
          </wd-button>
          <wd-button
            type="info"
            size="small"
            :disabled="isQuizzing"
            @click="loopAnimation"
          >
            循环播放
          </wd-button>
          <wd-button
            v-if="isAnimating"
            size="small"
            @click="stopAnimation"
          >
            停止
          </wd-button>
          <wd-button
            type="warning"
            size="small"
            :disabled="isAnimating"
            @click="startQuiz"
          >
            {{ isQuizzing ? '测验中...' : '书写测验' }}
          </wd-button>
        </view>

        <!-- 测验结果 -->
        <view v-if="quizComplete" class="mt-4 rounded-2 p-3 text-center wot-bg-bg">
          <view class="mb-1 text-4 font-bold text-green-600">
            🎉 书写完成！
          </view>
          <view class="text-3 wot-text-text-secondary">
            {{ currentChar }} 共 {{ strokeCount }} 画，错误次数：{{ quizMistakes }}
          </view>
        </view>
        <view v-else-if="isQuizzing" class="mt-4 text-center">
          <view class="text-3 wot-text-text-secondary">
            请在上方田字格中按正确笔画顺序书写「{{ currentChar }}」
          </view>
          <view v-if="quizMistakes > 0" class="mt-1 text-3 text-orange-500">
            错误次数：{{ quizMistakes }}
          </view>
        </view>
      </view>
    </view>

    <!-- 使用说明 -->
    <view class="mx-3">
      <view class="rounded-2 p-4 wot-bg-filled-oppo">
        <view class="mb-3 text-4 font-bold wot-text-text-main">
          使用说明
        </view>
        <view class="space-y-2 text-3 wot-text-text-secondary">
          <view>• 输入或点击选择一个汉字</view>
          <view>• <text class="text-blue-600 font-bold">播放动画</text>：按笔画顺序逐笔展示</view>
          <view>• <text class="text-blue-600 font-bold">循环播放</text>：反复播放笔画顺序</view>
          <view>• <text class="text-blue-600 font-bold">书写测验</text>：在田字格中按正确顺序书写练习</view>
          <view class="mt-2 text-2.5 wot-text-text-auxiliary">
            数据来源：Make Me a Hanzi 项目，支持 9000+ 常用简体字和繁体字
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
/* 田字格样式 */
.tian-zi-ge {
  width: 280px;
  height: 280px;
  border: 2px solid #333;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.dark) .tian-zi-ge {
  background-color: #1a1a2e;
  border-color: #555;
}
</style>
