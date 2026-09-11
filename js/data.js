/**
 * 演示课程数据（虚构，仅供课程作业演示使用）
 * weeks: 上课周次数组；day: 1-7（周一至周日）；period: 节次 1-6
 */
const COURSE_PERIODS = [
  { period: 1, time: "08:00 - 08:50" },
  { period: 2, time: "09:00 - 09:50" },
  { period: 3, time: "10:10 - 11:00" },
  { period: 4, time: "11:10 - 12:00" },
  { period: 5, time: "14:00 - 14:50" },
  { period: 6, time: "15:00 - 15:50" }
];

const COURSES = [
  { id: 1,  name: "互联网软件开发技术与实践", teacher: "王立群", room: "理科教学楼 302", day: 1, period: 1, weeks: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], type: "专业必修", color: "c1", note: "本周实验：完成课程表小项目并提交 Git 仓库。" },
  { id: 2,  name: "数据结构与算法分析", teacher: "李明轩", room: "第一教学楼 201", day: 1, period: 3, weeks: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], type: "专业必修", color: "c2", note: "课后习题每周一练，共 12 次。" },
  { id: 3,  name: "线性代数（B）", teacher: "陈晓芳", room: "第二教学楼 105", day: 2, period: 2, weeks: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], type: "通识必修", color: "c3", note: "期中考试占 30%。" },
  { id: 4,  name: "数据库系统概论", teacher: "赵德恒", room: "理科教学楼 415", day: 2, period: 5, weeks: [1,2,3,4,5,6,7,8], type: "专业选修", color: "c6", note: "前八周课程，含四次上机实验。" },
  { id: 5,  name: "大学英语（四）", teacher: "Sarah Johnson", room: "外语楼 208", day: 3, period: 1, weeks: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], type: "通识必修", color: "c5", note: "每周课前需提交听写打卡。" },
  { id: 6,  name: "计算机网络原理", teacher: "周天成", room: "理科教学楼 301", day: 3, period: 3, weeks: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], type: "专业必修", color: "c1", note: "配套实验：Socket 编程。" },
  { id: 7,  name: "体育（网球）", teacher: "刘建国", room: "五四体育场", day: 3, period: 5, weeks: [2,4,6,8,10,12,14,16], type: "通识必修", color: "c5", note: "单周上课，记得带球拍。" },
  { id: 8,  name: "数据结构与算法分析（习题课）", teacher: "李明轩", room: "第一教学楼 105", day: 4, period: 2, weeks: [3,6,9,12,15], type: "习题课", color: "c4", note: "每三周一次。" },
  { id: 9,  name: "Web 前端开发基础", teacher: "孙雨薇", room: "信息楼机房 B", day: 4, period: 5, weeks: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], type: "专业选修", color: "c6", note: "期末需提交一个静态网页作品。" },
  { id: 10, name: "中国近现代史纲要", teacher: "何雪松", room: "二教 401", day: 5, period: 1, weeks: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], type: "思政必修", color: "c3", note: "结课论文一篇。" },
  { id: 11, name: "互联网软件开发技术与实践（实验）", teacher: "王立群、助教组", room: "信息楼机房 A", day: 5, period: 3, weeks: [4,6,8,10,12,14], type: "实验课", color: "c2", note: "双周实验课，提交实验报告。" },
  { id: 12, name: "软件工程导论", teacher: "郑海涛", room: "理科教学楼 205", day: 5, period: 5, weeks: [9,10,11,12,13,14,15,16], type: "专业选修", color: "c4", note: "后八周课程。" }
];
