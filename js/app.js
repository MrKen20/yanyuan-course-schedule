/**
 * 燕园课程表 · 主逻辑
 * 功能：周视图课程表、今日高亮、星期切换、课程搜索、详情弹窗
 */
(function () {
  "use strict";

  const DAY_NAMES = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

  // ---------- 工具函数 ----------
  const $ = (sel) => document.querySelector(sel);

  // 计算当前教学周（以 2026-09-07 周一为第 1 周开学日）
  function getCurrentWeek() {
    const termStart = new Date(2026, 8, 7); // 月份从 0 开始，8 = 9 月
    const now = new Date();
    const diffDays = Math.floor((now - termStart) / 86400000);
    const week = Math.floor(diffDays / 7) + 1;
    return week >= 1 && week <= 20 ? week : 1;
  }

  // 今天是周几（1-7，周一为 1）
  function todayIndex() {
    const d = new Date().getDay(); // 0=周日
    return d === 0 ? 7 : d;
  }

  const currentWeek = getCurrentWeek();

  // ---------- 状态 ----------
  let selectedDay = todayIndex();
  let keyword = "";

  // ---------- 渲染：星期切换 tabs ----------
  function renderDayTabs() {
    const tabs = $("#dayTabs");
    tabs.innerHTML = "";
    DAY_NAMES.forEach((name, i) => {
      const btn = document.createElement("button");
      btn.className = "day-tab" + (selectedDay === i + 1 ? " active" : "");
      btn.textContent = name;
      btn.addEventListener("click", () => {
        selectedDay = i + 1;
        renderDayTabs();
        renderDayList();
      });
      tabs.appendChild(btn);
    });
  }

  // ---------- 渲染：课程表网格 ----------
  function renderGrid() {
    const grid = $("#scheduleGrid");
    grid.innerHTML = "";

    // 表头：角格 + 周一~周日
    const corner = document.createElement("div");
    corner.className = "grid-head corner";
    corner.textContent = `第 ${currentWeek} 周`;
    grid.appendChild(corner);

    const today = todayIndex();
    DAY_NAMES.forEach((name, i) => {
      const head = document.createElement("div");
      head.className = "grid-head" + (today === i + 1 ? " today-head" : "");
      head.textContent = name;
      grid.appendChild(head);
    });

    // 每一节次一行
    COURSE_PERIODS.forEach(({ period, time }) => {
      const timeCol = document.createElement("div");
      timeCol.className = "time-col";
      timeCol.innerHTML = `<div class="period">第${period}节</div><div class="time">${time}</div>`;
      grid.appendChild(timeCol);

      for (let day = 1; day <= 7; day++) {
        const cell = document.createElement("div");
        cell.className = "cell";

        const course = COURSES.find(
          (c) => c.day === day && c.period === period && c.weeks.includes(currentWeek)
        );

        if (course) {
          const chip = document.createElement("button");
          chip.className = `course-chip ${course.color}`;
          chip.innerHTML = `<span class="name">${course.name}</span><span class="room">${course.room}</span>`;
          chip.addEventListener("click", () => openModal(course));
          if (keyword && matchCourse(course)) chip.classList.add("highlight");
          cell.appendChild(chip);
        }
        grid.appendChild(cell);
      }
    });
  }

  // ---------- 渲染：选中日的课程列表 ----------
  function renderDayList() {
    const list = $("#dayList");
    const title = $("#dayListTitle");
    const emptyTip = $("#emptyTip");
    title.textContent = `${DAY_NAMES[selectedDay - 1]}课程（第 ${currentWeek} 周）`;

    const courses = COURSES.filter(
      (c) => c.day === selectedDay && c.weeks.includes(currentWeek)
    ).sort((a, b) => a.period - b.period);

    list.innerHTML = "";
    emptyTip.hidden = courses.length > 0;

    courses.forEach((c) => {
      const time = COURSE_PERIODS.find((p) => p.period === c.period).time;
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="list-time">第${c.period}节 ${time}</span>
        <span class="list-name">${c.name}</span>
        <span class="list-meta">${c.teacher} · ${c.room} · ${c.type}</span>`;
      li.addEventListener("click", () => openModal(c));
      li.style.cursor = "pointer";
      list.appendChild(li);
    });
  }

  // ---------- 搜索 ----------
  function matchCourse(c) {
    if (!keyword) return false;
    const k = keyword.toLowerCase();
    return (
      c.name.toLowerCase().includes(k) ||
      c.teacher.toLowerCase().includes(k) ||
      c.room.toLowerCase().includes(k)
    );
  }

  function applySearch() {
    renderGrid();
    // 搜索时若有关键词，切换列表为搜索结果
    const list = $("#dayList");
    const title = $("#dayListTitle");
    const emptyTip = $("#emptyTip");

    if (keyword) {
      title.textContent = `搜索结果：“${keyword}”`;
      const results = COURSES.filter(matchCourse).sort((a, b) =>
        a.day === b.day ? a.period - b.period : a.day - b.day
      );
      list.innerHTML = "";
      emptyTip.hidden = results.length > 0;
      results.forEach((c) => {
        const time = COURSE_PERIODS.find((p) => p.period === c.period).time;
        const li = document.createElement("li");
        li.innerHTML = `
          <span class="list-time">${DAY_NAMES[c.day - 1]} 第${c.period}节</span>
          <span class="list-name">${c.name}</span>
          <span class="list-meta">${time} · ${c.teacher} · ${c.room}</span>`;
        li.addEventListener("click", () => openModal(c));
        li.style.cursor = "pointer";
        list.appendChild(li);
      });
    } else {
      renderDayList();
    }
  }

  // ---------- 弹窗 ----------
  function openModal(course) {
    const time = COURSE_PERIODS.find((p) => p.period === course.period).time;
    $("#modalTitle").textContent = course.name;
    $("#modalBody").innerHTML = `
      <dl>
        <dt>上课时间</dt><dd>${DAY_NAMES[course.day - 1]} 第${course.period}节（${time}）</dd>
        <dt>上课地点</dt><dd>${course.room}</dd>
        <dt>任课教师</dt><dd>${course.teacher}</dd>
        <dt>课程类型</dt><dd><span class="tag">${course.type}</span></dd>
        <dt>上课周次</dt><dd>第 ${course.weeks[0]} - ${course.weeks[course.weeks.length - 1]} 周${
          course.weeks.length < 16 ? "（非每周）" : ""
        }</dd>
        <dt>备注</dt><dd>${course.note || "暂无"}</dd>
      </dl>`;
    $("#modalMask").hidden = false;
  }

  function closeModal() {
    $("#modalMask").hidden = true;
  }

  // ---------- 初始化 ----------
  function init() {
    const d = new Date();
    const weekOfDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][d.getDay()];
    $("#todayInfo").innerHTML =
      `今天是 <strong>${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 ${weekOfDay}</strong> · 第 ${currentWeek} 教学周`;

    renderDayTabs();
    renderGrid();
    renderDayList();

    $("#todayBtn").addEventListener("click", () => {
      selectedDay = todayIndex();
      keyword = "";
      $("#searchInput").value = "";
      renderDayTabs();
      renderDayList();
      renderGrid();
    });

    $("#searchInput").addEventListener("input", (e) => {
      keyword = e.target.value.trim();
      applySearch();
    });

    $("#modalClose").addEventListener("click", closeModal);
    $("#modalMask").addEventListener("click", (e) => {
      if (e.target === $("#modalMask")) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
