// Sample notifications
const notifications = [
  {
    tag: "Exam Dept",
    type: "exam",
    text: "Internal marks for CS-201 must be submitted by 5:00 PM today.",
    time: "5 min ago",
  },
  {
    tag: "Submission",
    type: "submission",
    text: "Rahul Verma uploaded DBMS Assignment 4 for your review.",
    time: "2 hours ago",
  },
  {
    tag: "Meeting",
    type: "meeting",
    text: "Faculty meeting in Staff Room at 4:30 PM today.",
    time: "4 hours ago",
  },
  {
    tag: "System",
    type: "system",
    text: "Portal maintenance this Sunday from 12:00 AM to 4:00 AM.",
    time: "Yesterday",
  },
];

// Sample students for attendance
const students = [
  { name: "Rahul Verma", roll: "IT21-001", present: true },
  { name: "Sneha Patnaik", roll: "IT21-014", present: true },
  { name: "Aman Behera", roll: "IT21-023", present: false },
  { name: "Priya Roy", roll: "IT21-031", present: true },
  { name: "Ankit Das", roll: "IT21-041", present: false },
];

document.addEventListener("DOMContentLoaded", () => {
  const sectionButtons = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".section");
  const headerTitle = document.getElementById("header-title");

  const notifBtn = document.getElementById("notif-btn");
  const notifPanel = document.getElementById("notif-panel");
  const notifClose = document.getElementById("notif-close");
  const notifOverlay = document.getElementById("notif-overlay");
  const notifList = document.getElementById("notif-list");
  const notifCount = document.getElementById("notif-count");

  const attendanceBody = document.getElementById("attendance-body");
  const attendanceSearch = document.getElementById("attendance-search");

  const themeToggle = document.getElementById("theme-toggle");

  /* Navigation between sections */
  sectionButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-section");

      sectionButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      sections.forEach((sec) => {
        sec.classList.toggle("active", sec.id === target);
      });

      headerTitle.textContent =
        target.charAt(0).toUpperCase() + target.slice(1);
    });
  });

  /* Render notifications */
  function renderNotifications() {
    notifList.innerHTML = "";
    notifications.forEach((n) => {
      const div = document.createElement("div");
      div.className = "notif-item";
      div.innerHTML = `
        <p class="tag ${n.type}">${n.tag}</p>
        <p class="text">${n.text}</p>
        <p class="time"><i class="fa-regular fa-clock"></i> ${n.time}</p>
      `;
      notifList.appendChild(div);
    });
    notifCount.textContent = notifications.length;
  }

  /* Open/close notification panel */
  function openNotifications() {
    notifPanel.classList.add("open");
    notifOverlay.classList.add("open");
  }

  function closeNotifications() {
    notifPanel.classList.remove("open");
    notifOverlay.classList.remove("open");
  }

  notifBtn.addEventListener("click", openNotifications);
  notifClose.addEventListener("click", closeNotifications);
  notifOverlay.addEventListener("click", closeNotifications);

  /* Attendance table */
  function renderStudents(list) {
    attendanceBody.innerHTML = "";
    list.forEach((s) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s.name}</td>
        <td>${s.roll}</td>
        <td class="center">
          <span class="badge ${
            s.present ? "badge-present" : "badge-absent"
          }">
            ${s.present ? "Present" : "Absent"}
          </span>
        </td>
      `;
      attendanceBody.appendChild(tr);
    });
  }

  attendanceSearch.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    const filtered = students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.roll.toLowerCase().includes(q)
    );
    renderStudents(filtered);
  });

  /* Simple theme toggle (optional – just add/remove a dark class if needed) */
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });

  /* Initial render */
  renderNotifications();
  renderStudents(students);
});
