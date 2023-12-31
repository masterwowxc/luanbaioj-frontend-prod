<template>
  <div id="viewQuestionView">
    <a-row :gutter="[24, 24]">
      <a-col :md="12" :xs="24">
        <a-tabs default-active-key="question">
          <a-tab-pane key="question" title="题目">
            <a-card v-if="question" :title="question.title">
              <a-descriptions
                title="判题条件"
                :column="{ xs: 1, md: 2, lg: 3 }"
              >
                <a-descriptions-item label="时间限制">
                  {{ question.judgeConfig.timeLimit ?? 0 }}
                </a-descriptions-item>
                <a-descriptions-item label="内存限制">
                  {{ question.judgeConfig.memoryLimit ?? 0 }}
                </a-descriptions-item>
                <a-descriptions-item label="堆栈限制">
                  {{ question.judgeConfig.stackLimit ?? 0 }}
                </a-descriptions-item>
              </a-descriptions>
              <MdViewer :value="question.content || ''" />
              <template #extra>
                <a-space wrap>
                  <a-tag
                    v-for="(tag, index) of question.tags"
                    :key="index"
                    color="green"
                    >{{ tag }}
                  </a-tag>
                </a-space>
              </template>
            </a-card>
          </a-tab-pane>
          <a-tab-pane key="comment" title="评论" disabled> 评论区</a-tab-pane>
          <a-tab-pane key="answer" title="答案"> 暂时无法查看答案</a-tab-pane>
        </a-tabs>
      </a-col>
      <a-col :md="12" :xs="24">
        <a-form :model="form" layout="inline">
          <a-form-item
            field="language"
            label="编程语言"
            style="min-width: 240px"
          >
            <a-select
              v-model="form.language"
              :style="{ width: '320px' }"
              placeholder="选择编程语言"
            >
              <a-option :key="language" v-for="language in codeLanguages"
                >{{ language }}
              </a-option>
            </a-select>
          </a-form-item>
        </a-form>
        <CodeEditor
          :value="form.code as string"
          :language="form.language"
          :handle-change="changeCode"
        />
        <a-divider size="0" />
        <a-button type="primary" style="min-width: 200px" @click="doSubmit">
          提交代码
        </a-button>
      </a-col>
    </a-row>
  </div>
  <a-modal
    v-model:visible="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    draggable
    :esc-to-close="false"
    :mask-closable="false"
  >
    <template #title> {{ modalTitle }}</template>
    <div v-if="judgeTime">耗时: {{ judgeTime }}</div>
  </a-modal>
</template>

<script setup lang="ts">
import { onMounted, ref, withDefaults, defineProps } from "vue";
import {
  QuestionService,
  QuestionSubmitAddRequest,
  QuestionVO,
} from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import CodeEditor from "@/components/CodeEditor.vue";
import MdViewer from "@/components/MdViewer.vue";

interface Props {
  id: string;
}

const props = withDefaults(defineProps<Props>(), {
  id: () => "",
});

const codeLanguages = ref(["java"]);

const question = ref<QuestionVO>();
const visible = ref(false);
const modalTitle = ref("判题中...");
const judgeTime = ref<string>();
let timer: ReturnType<typeof setInterval>;
let elapsedTime = 0;

const handleOk = () => {
  visible.value = false;
  if (timer) {
    clearInterval(timer);
    modalTitle.value = "判题中...";
    judgeTime.value = undefined;
  }
};
const handleCancel = () => {
  visible.value = false;
  if (timer) {
    clearInterval(timer);
  }
  modalTitle.value = "判题中...";
  judgeTime.value = undefined;
};
const startTimer = (id: number) => {
  timer = setInterval(async () => {
    elapsedTime++;
    // 10分钟，60秒 * 10
    if (elapsedTime >= 600) {
      clearInterval(timer);
    }
    const res = await QuestionService.getJudgeResultUsingGet(id);
    if (res.code === 0) {
      clearInterval(timer);
      modalTitle.value = res.data.message;
      judgeTime.value = res.data.time;
    }
  }, 1000);
};
const loadData = async () => {
  // eslint-disable-next-line
  const res = await QuestionService.getQuestionVoByIdUsingGet(props.id as any);
  if (res.code === 0) {
    question.value = res.data;
  } else {
    message.error("加载失败，" + res.msg);
  }
};

const form = ref<QuestionSubmitAddRequest>({
  language: "java",
  code:
    "import java.util.Scanner;\n" +
    "public class Main{\n" +
    "    public static void main(String[] args){\n" +
    "        Scanner sc = new Scanner(System.in);\n" +
    "        int a = sc.nextInt();\n" +
    "        int b = sc.nextInt();\n" +
    "        System.out.println(a + b);\n" +
    "    }\n" +
    "}",
});

/**
 * 提交代码
 */
const doSubmit = async () => {
  if (!question.value?.id) {
    return;
  }

  const res = await QuestionService.doQuestionSubmitUsingPost({
    ...form.value,
    questionId: question.value.id,
  });
  if (res.code === 0) {
    message.success("提交成功");
  } else {
    message.error("提交失败," + res.msg);
    return;
  }
  visible.value = true;
  startTimer(res.data);
};

/**
 * 页面加载时，请求数据
 */
onMounted(async () => {
  await loadData();
  const res = await QuestionService.getCodeLanguageUsingGet();
  if (res.code === 0 && res.data) {
    codeLanguages.value = res.data;
  }
});

const changeCode = (value: string) => {
  form.value.code = value;
};
</script>

<style>
#viewQuestionView {
  max-width: 1400px;
  margin: 0 auto;
}

#viewQuestionView .arco-space-horizontal .arco-space-item {
  margin-bottom: 0 !important;
}
</style>
