<template>
  <div id="questionSubmitView">
    <a-form :model="searchParams" layout="inline">
      <a-form-item field="questionId" label="题目" style="min-width: 240px">
        <a-input v-model="searchParams.questionTitle" placeholder="请输入" />
      </a-form-item>
      <a-form-item field="language" label="编程语言" style="min-width: 240px">
        <a-select
          v-model="searchParams.language"
          :style="{ width: '320px' }"
          placeholder="选择编程语言"
          allow-clear
        >
          <a-option :key="language" v-for="language in codeLanguages"
            >{{ language }}
          </a-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="doSubmit">搜索</a-button>
      </a-form-item>
    </a-form>
    <a-divider size="0" />
    <a-table
      :ref="tableRef"
      :columns="columns"
      :data="dataList"
      :pagination="{
        showTotal: true,
        pageSize: searchParams.pageSize,
        current: searchParams.current,
        total,
        showJumper: true,
      }"
      @page-change="onPageChange"
    >
      <template #optional="{ record }">
        <a-space>
          <a-button type="primary" @click="toQuestionPage(record.questionId)">
            查看
          </a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import { QuestionService, QuestionSubmitViewVO } from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";

const tableRef = ref();
const codeLanguages = ref(["java"]);

const dataList = ref<QuestionSubmitViewVO[]>([]);
const total = ref(0);
const searchParams = ref({
  questionTitle: undefined,
  language: undefined,
  pageSize: 10,
  current: 1,
});

const loadData = async () => {
  const res = await QuestionService.listQuestionSubmitByPageUsingGet(
    searchParams.value.current,
    searchParams.value.language,
    searchParams.value.pageSize,
    "createTime",
    "desc",
    searchParams.value.questionTitle
  );
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
  } else {
    message.error("加载失败，" + res.msg);
  }
};

/**
 * 监听 searchParams 变量，改变时触发页面的重新加载
 */
watchEffect(() => {
  loadData();
});

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

const columns = [
  {
    title: "题目",
    dataIndex: "questionTitle",
  },
  {
    title: "编程语言",
    dataIndex: "language",
  },
  {
    title: "判题信息",
    dataIndex: "judgeInfo",
    children: [
      {
        title: "信息",
        dataIndex: "message",
        width: 100,
      },
      {
        title: "耗时",
        dataIndex: "time",
        width: 100,
      },
    ],
  },
  {
    title: "提交者",
    dataIndex: "userName",
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
  },
  {
    slotName: "optional",
  },
];

const onPageChange = (page: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: page,
  };
};

const router = useRouter();

/**
 * 跳转到做题页面
 * @param questionId 题目id
 */
const toQuestionPage = (questionId: string) => {
  router.push({
    path: `/view/question/${questionId}`,
  });
};

/**
 * 确认搜索，重新加载数据
 */
const doSubmit = () => {
  // 这里需要重置搜索页号
  searchParams.value = {
    ...searchParams.value,
    current: 1,
  };
};
</script>

<style scoped>
#questionSubmitView {
  max-width: 1280px;
  margin: 0 auto;
}
</style>
