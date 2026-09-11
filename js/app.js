/**
 * 燕园课程表 · 主逻辑
 * 功能：周视图课程表（12 节次、支持连堂）、今日高亮、星期切换、课程搜索、详情弹窗
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

  const realWeek = getCurrentWeek();

  // 课程节数范围文案，如 "第1-2节" / "第5节"
  function periodLabel(c) {
    return c.length > 1
      ? `第${c.startPeriod}-${c.startPeriod + c.length - 1}节`
      : `第${c.startPeriod}节`;
  }

  // 课程完整时间范围，如 "08:00 - 09:50"
  function timeRange(c) {
    const first = COURSE_PERIODS.find((p) => p.period === c.startPeriod);
    const last = COURSE_PERIODS.find((p) => p.period === c.startPeriod + c.length - 1);
    return `${first.start} - ${last.end}`;
  }

  // ---------- 状态 ----------
  let viewWeek = realWeek;      // 当前查看的教学周
  let selectedDay = todayIndex();
  let keyword = "";

  const MAX_WEEK = 20;

  function setViewWeek(w) {
    viewWeek = Math.min(Math.max(w, 1), MAX_WEEK);
    $("#weekLabel").textContent = `第 ${viewWeek} 周`;
    renderGrid();
    if (keyword) applySearch(); else renderDayList();
  }

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

  // ---------- 渲染：课程表网格（12 节次 × 7 天，支持连堂跨行） ----------
  function renderGrid() {
    const grid = $("#scheduleGrid");
    grid.innerHTML = "";

    // 本周课程（含跨节信息）
    const weekCourses = COURSES.filter((c) => c.weeks.includes(viewWeek));

    // 记录每个 (day, period) 是否被某课程占用（含连堂后续节次）
    const occupied = new Set();
    weekCourses.forEach((c) => {
      for (let p = c.startPeriod; p < c.startPeriod + c.length; p++) {
        occupied.add(c.day + "-" + p);
      }
    });

    // 表头（第 1 行）：角格 + 周一~周日
    const corner = document.createElement("div");
    corner.className = "grid-head corner";
    corner.textContent = `第 ${viewWeek} 周`;
    grid.appendChild(corner);

    const today = todayIndex();
    DAY_NAMES.forEach((name, i) => {
      const head = document.createElement("div");
      head.className = "grid-head" + (viewWeek === realWeek && today === i + 1 ? " today-head" : "");
      head.textContent = name;
      grid.appendChild(head);
    });

    // 时间列（第 1 列，第 2-13 行）
    COURSE_PERIODS.forEach(({ period, start, end }) => {
      const timeCol = document.createElement("div");
      timeCol.className = "time-col" + (PERIOD_BREAKS_AFTER.includes(period) ? " break" : "");
      timeCol.style.gridRow = String(period + 1); // +1：跳过表头行
      timeCol.style.gridColumn = "1";
      timeCol.innerHTML = `<div class="period">第${period}节</div><div class="time">${start}<br>${end}</div>`;
      grid.appendChild(timeCol);
    });

    // 空白单元格：仅渲染未被课程占用的 (day, period)
    for (let day = 1; day <= 7; day++) {
      for (let period = 1; period <= COURSE_PERIODS.length; period++) {
        if (occupied.has(day + "-" + period)) continue;
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.style.gridRow = String(period + 1);
        cell.style.gridColumn = String(day + 1); // +1：跳过时间列
        grid.appendChild(cell);
      }
    }

    // 课程块：从起始节次开始，跨 length 行
    weekCourses.forEach((c) => {
      const chip = document.createElement("button");
      chip.className = `course-chip ${c.color}`;
      chip.style.gridRow = `${c.startPeriod + 1} / span ${c.length}`;
      chip.style.gridColumn = String(c.day + 1);
      chip.innerHTML =
        `<span class="name">${c.name}</span>` +
        `<span class="room">${c.room}</span>` +
        `<span class="room">${periodLabel(c)}</span>`;
      chip.addEventListener("click", () => openModal(c));
      if (keyword && matchCourse(c)) chip.classList.add("highlight");
      grid.appendChild(chip);
    });
  }

  // ---------- 渲染：选中日的课程列表 ----------
  function renderDayList() {
    const list = $("#dayList");
    const title = $("#dayListTitle");
    const emptyTip = $("#emptyTip");
    title.textContent = `${DAY_NAMES[selectedDay - 1]}课程（第 ${viewWeek} 周）`;

    const courses = COURSES.filter(
      (c) => c.day === selectedDay && c.weeks.includes(viewWeek)
    ).sort((a, b) => a.startPeriod - b.startPeriod);

    list.innerHTML = "";
    emptyTip.hidden = courses.length > 0;

    courses.forEach((c) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="list-time">${periodLabel(c)} ${timeRange(c)}</span>
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
    const list = $("#dayList");
    const title = $("#dayListTitle");
    const emptyTip = $("#emptyTip");

    if (keyword) {
      title.textContent = `搜索结果：“${keyword}”`;
      const results = COURSES.filter(matchCourse).sort((a, b) =>
        a.day === b.day ? a.startPeriod - b.startPeriod : a.day - b.day
      );
      list.innerHTML = "";
      emptyTip.hidden = results.length > 0;
      results.forEach((c) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span class="list-time">${DAY_NAMES[c.day - 1]} ${periodLabel(c)}</span>
          <span class="list-name">${c.name}</span>
          <span class="list-meta">${timeRange(c)} · ${c.teacher} · ${c.room}</span>`;
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
    $("#modalTitle").textContent = course.name;
    $("#modalBody").innerHTML = `
      <dl>
        <dt>上课时间</dt><dd>${DAY_NAMES[course.day - 1]} ${periodLabel(course)}（${timeRange(course)}）</dd>
        <dt>上课地点</dt><dd>${course.room}</dd>
        <dt>任课教师</dt><dd>${course.teacher}</dd>
        <dt>课程类型</dt><dd><span class="tag">${course.type}</span>${course.length > 1 ? `<span class="tag">${course.length} 节连堂</span>` : ""}</dd>
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
      `今天是 <strong>${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 ${weekOfDay}</strong> · 第 ${realWeek} 教学周`;

    renderDayTabs();
    renderGrid();
    renderDayList();
    $("#weekLabel").textContent = `第 ${viewWeek} 周`;

    // 回到今天：重置周、星期与搜索
    $("#todayBtn").addEventListener("click", () => {
      selectedDay = todayIndex();
      viewWeek = realWeek;
      keyword = "";
      $("#searchInput").value = "";
      $("#weekLabel").textContent = `第 ${viewWeek} 周`;
      renderDayTabs();
      renderDayList();
      renderGrid();
    });

    // 周切换
    $("#prevWeekBtn").addEventListener("click", () => setViewWeek(viewWeek - 1));
    $("#nextWeekBtn").addEventListener("click", () => setViewWeek(viewWeek + 1));

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
