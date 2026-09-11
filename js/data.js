/**
 * 演示课程数据（虚构，仅供课程作业演示使用）
 *
 * 节次时间严格参照《北京大学 2026-2027 学年上课时间》（校本部）：
 *   第 1-4 节：上午（08:00 - 12:00）
 *   第 5-9 节：下午（13:00 - 18:00）
 *   第 10-12 节：晚上（18:40 - 21:30）
 *
 * 课程字段：
 *   day         1-7（周一至周日）
 *   startPeriod 起始节次 1-12
 *   length      连续节数（1-4）。约束：上午课不得跨过第 4 节进入下午；
 *               下午课不得跨过第 9 节进入晚上。
 *   weeks       上课周次数组
 */
const COURSE_PERIODS = [
  { period: 1,  start: "08:00", end: "08:50" },
  { period: 2,  start: "09:00", end: "09:50" },
  { period: 3,  start: "10:10", end: "11:00" },
  { period: 4,  start: "11:10", end: "12:00" },
  { period: 5,  start: "13:00", end: "13:50" },
  { period: 6,  start: "14:00", end: "14:50" },
  { period: 7,  start: "15:10", end: "16:00" },
  { period: 8,  start: "16:10", end: "17:00" },
  { period: 9,  start: "17:10", end: "18:00" },
  { period: 10, start: "18:40", end: "19:30" },
  { period: 11, start: "19:40", end: "20:30" },
  { period: 12, start: "20:40", end: "21:30" }
];

// 时段边界：午休在第 4 节后，傍晚休息在第 9 节后
const PERIOD_BREAKS_AFTER = [4, 9];

const FULL_WEEKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

const COURSES = [
  // ===== 周一 =====
  { id: 1,  name: "互联网软件开发技术与实践", teacher: "王立群", room: "理科教学楼 302",
    day: 1, startPeriod: 1, length: 2, weeks: FULL_WEEKS, type: "专业必修", color: "c1",
    note: "本周实验：完成课程表小项目并提交 Git 仓库。" },
  { id: 2,  name: "数据结构与算法分析", teacher: "李明轩", room: "第一教学楼 201",
    day: 1, startPeriod: 3, length: 2, weeks: FULL_WEEKS, type: "专业必修", color: "c2",
    note: "课后习题每周一练，共 12 次。" },
  { id: 3,  name: "软件工程导论", teacher: "郑海涛", room: "理科教学楼 205",
    day: 1, startPeriod: 5, length: 2, weeks: [9, 10, 11, 12, 13, 14, 15, 16], type: "专业选修", color: "c4",
    note: "后八周课程，分组完成一个软件项目。" },

  // ===== 周二 =====
  { id: 4,  name: "大学英语（四）", teacher: "Sarah Johnson", room: "外语楼 208",
    day: 2, startPeriod: 1, length: 2, weeks: FULL_WEEKS, type: "通识必修", color: "c5",
    note: "每周课前需提交听写打卡。" },
  { id: 5,  name: "线性代数（B）", teacher: "陈晓芳", room: "第二教学楼 105",
    day: 2, startPeriod: 3, length: 2, weeks: FULL_WEEKS, type: "通识必修", color: "c3",
    note: "期中考试占 30%。" },
  { id: 6,  name: "西方美术史", teacher: "孙艺宁", room: "理科教学楼 107",
    day: 2, startPeriod: 10, length: 2, weeks: FULL_WEEKS, type: "通选课", color: "c4",
    note: "晚间通选课，期末提交一篇艺术评论。" },

  // ===== 周三 =====
  { id: 7,  name: "体育（网球）", teacher: "刘建国", room: "五四体育场",
    day: 3, startPeriod: 1, length: 2, weeks: [2, 4, 6, 8, 10, 12, 14, 16], type: "通识必修", color: "c5",
    note: "单周上课，记得带球拍。" },
  { id: 8,  name: "数据库系统概论", teacher: "赵德恒", room: "理科教学楼 415",
    day: 3, startPeriod: 5, length: 2, weeks: [1, 2, 3, 4, 5, 6, 7, 8], type: "专业选修", color: "c6",
    note: "前八周课程，含四次上机实验。" },
  { id: 9,  name: "计算机网络原理", teacher: "周天成", room: "理科教学楼 301",
    day: 3, startPeriod: 7, length: 2, weeks: FULL_WEEKS, type: "专业必修", color: "c1",
    note: "配套实验：Socket 编程。" },
  { id: 10, name: "大学生心理健康教育", teacher: "钱舒雅", room: "第二教学楼 203",
    day: 3, startPeriod: 10, length: 2, weeks: [1, 2, 3, 4, 5, 6, 7, 8], type: "通识必修", color: "c5",
    note: "晚间课程，前八周结课。" },

  // ===== 周四 =====
  { id: 11, name: "数据结构与算法分析（习题课）", teacher: "李明轩", room: "第一教学楼 105",
    day: 4, startPeriod: 3, length: 2, weeks: [3, 6, 9, 12, 15], type: "习题课", color: "c4",
    note: "每三周一次。" },
  { id: 12, name: "互联网软件开发技术与实践（实践课）", teacher: "王立群、助教组", room: "信息楼机房 A",
    day: 4, startPeriod: 5, length: 4, weeks: [4, 6, 8, 10, 12, 14], type: "实践课", color: "c2",
    note: "双周四节连堂实践课，当堂完成并提交实验任务。" },

  // ===== 周五 =====
  { id: 13, name: "中国近现代史纲要", teacher: "何雪松", room: "第二教学楼 401",
    day: 5, startPeriod: 1, length: 2, weeks: FULL_WEEKS, type: "思政必修", color: "c3",
    note: "结课论文一篇。" },
  { id: 14, name: "Web 前端开发基础", teacher: "孙雨薇", room: "信息楼机房 B",
    day: 5, startPeriod: 3, length: 2, weeks: FULL_WEEKS, type: "专业选修", color: "c6",
    note: "期末需提交一个静态网页作品。" }
];
