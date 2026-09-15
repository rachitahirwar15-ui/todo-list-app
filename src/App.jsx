import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

/* =========================================================
   CONSTANTS
========================================================= */

const STORAGE_KEY = "nexus-tasks-v1";

const defaultProjects = [
  {
    id: "personal",
    name: "Personal",
    color: "#8b5cf6",
    icon: "◇",
  },
  {
    id: "work",
    name: "Work",
    color: "#3b82f6",
    icon: "▣",
  },
  {
    id: "learning",
    name: "Learning",
    color: "#10b981",
    icon: "◈",
  },
];

const initialTasks = [
  {
    id: crypto.randomUUID(),
    title: "Finish React dashboard",
    description: "Complete the dashboard layout and responsive states.",
    completed: false,
    priority: "high",
    dueDate: new Date().toISOString().split("T")[0],
    project: "work",
    tags: ["react", "frontend"],
    subtasks: [
      { id: crypto.randomUUID(), title: "Build sidebar", completed: true },
      { id: crypto.randomUUID(), title: "Build dashboard", completed: false },
      { id: crypto.randomUUID(), title: "Responsive testing", completed: false },
    ],
    pinned: true,
    starred: true,
    createdAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    title: "Study JavaScript concepts",
    description: "Revise closures, promises, async/await and hooks.",
    completed: false,
    priority: "medium",
    dueDate: "",
    project: "learning",
    tags: ["javascript"],
    subtasks: [],
    pinned: false,
    starred: false,
    createdAt: Date.now() - 10000,
  },
  {
    id: crypto.randomUUID(),
    title: "Go for a workout",
    description: "60 minute workout session.",
    completed: true,
    priority: "low",
    dueDate: new Date().toISOString().split("T")[0],
    project: "personal",
    tags: ["fitness"],
    subtasks: [],
    pinned: false,
    starred: false,
    createdAt: Date.now() - 20000,
  },
];

/* =========================================================
   HELPERS
========================================================= */

const todayString = () =>
  new Date().toISOString().split("T")[0];

const formatDate = (date) => {
  if (!date) return "No due date";

  const d = new Date(`${date}T00:00:00`);

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const isToday = (date) => date === todayString();

const isOverdue = (task) => {
  return (
    task.dueDate &&
    task.dueDate < todayString() &&
    !task.completed
  );
};

const getProject = (projects, id) =>
  projects.find((project) => project.id === id);

const priorityRank = {
  high: 3,
  medium: 2,
  low: 1,
};

/* =========================================================
   ICON COMPONENT
========================================================= */

function Icon({ name, size = 18 }) {
  const icons = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),

    task: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),

    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),

    star: (
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
    ),

    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),

    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),

    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-2 2-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1.1 1.6v.2h-2.8v-.2a1.8 1.8 0 0 0-1.1-1.6 1.8 1.8 0 0 0-2 .4l-.1.1-2-2 .1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.6-1.1H5v-2.8h.2A1.8 1.8 0 0 0 6.8 10a1.8 1.8 0 0 0-.4-2l-.1-.1 2-2 .1.1a1.8 1.8 0 0 0 2 .4 1.8 1.8 0 0 0 1.1-1.6v-.2h2.8v.2a1.8 1.8 0 0 0 1.1 1.6 1.8 1.8 0 0 0 2-.4l.1-.1 2 2-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.6 1.1h.2V14h-.2a1.8 1.8 0 0 0-1.6 1Z" />
      </>
    ),

    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),

    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),

    menu: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </>
    ),

    check: <path d="m5 12 4 4L19 6" />,

    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),

    folder: (
      <path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z" />
    ),

    trash: (
      <>
        <path d="M4 7h16M10 11v6M14 11v6" />
        <path d="M6 7l1 14h10l1-14M9 7V4h6v3" />
      </>
    ),

    edit: (
      <>
        <path d="m4 20 4-.8L19 8.2a2 2 0 0 0-3-3L5 16.2 4 20Z" />
        <path d="m14 6 4 4" />
      </>
    ),

    filter: (
      <>
        <path d="M4 5h16M7 12h10M10 19h4" />
      </>
    ),

    sort: (
      <>
        <path d="M8 5v14M5 8l3-3 3 3M16 19V5M13 16l3 3 3-3" />
      </>
    ),

    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),

    play: <path d="m8 5 11 7-11 7V5Z" />,

    pause: (
      <>
        <path d="M8 5v14M16 5v14" />
      </>
    ),

    refresh: (
      <path d="M20 11a8 8 0 1 0 2 5M20 5v6h-6" />
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="icon"
    >
      {icons[name]}
    </svg>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).tasks : initialTasks;
    } catch {
      return initialTasks;
    }
  });

  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).projects : defaultProjects;
    } catch {
      return defaultProjects;
    }
  });

  const [activeView, setActiveView] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created");
  const [showCompleted, setShowCompleted] = useState(true);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCommand, setShowCommand] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [accent, setAccent] = useState("#8b5cf6");

  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [focusRunning, setFocusRunning] = useState(false);

  /* =======================================================
     PERSISTENCE
  ======================================================= */

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        tasks,
        projects,
      })
    );
  }, [tasks, projects]);

  /* =======================================================
     FOCUS TIMER
  ======================================================= */

  useEffect(() => {
    if (!focusRunning) return;

    const interval = setInterval(() => {
      setFocusSeconds((seconds) => {
        if (seconds <= 1) {
          setFocusRunning(false);
          return 25 * 60;
        }

        return seconds - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [focusRunning]);

  /* =======================================================
     KEYBOARD SHORTCUTS
  ======================================================= */

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCommand(true);
      }

      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "n"
      ) {
        e.preventDefault();
        openCreateModal();
      }

      if (e.key === "Escape") {
        setShowCommand(false);
        setShowTaskModal(false);
        setSelectedTask(null);
        setShowSettings(false);
      }
    };

    window.addEventListener("keydown", handler);

    return () =>
      window.removeEventListener("keydown", handler);
  }, []);

  /* =======================================================
     TASK FUNCTIONS
  ======================================================= */

  const openCreateModal = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const saveTask = (taskData) => {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingTask.id
            ? { ...task, ...taskData }
            : task
        )
      );
    } else {
      setTasks((prev) => [
        {
          ...taskData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          subtasks: taskData.subtasks || [],
          pinned: false,
          starred: false,
        },
        ...prev,
      ]);
    }

    setShowTaskModal(false);
    setEditingTask(null);
  };

  const deleteTask = (id) => {
    setTasks((prev) =>
      prev.filter((task) => task.id !== id)
    );

    setSelectedTask(null);
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
            }
          : task
      )
    );
  };

  const toggleStar = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, starred: !task.starred }
          : task
      )
    );
  };

  const togglePin = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, pinned: !task.pinned }
          : task
      )
    );
  };

  const clearCompleted = () => {
    setTasks((prev) =>
      prev.filter((task) => !task.completed)
    );
  };

  const updateSubtask = (
    taskId,
    subtaskId
  ) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;

        return {
          ...task,
          subtasks: task.subtasks.map((sub) =>
            sub.id === subtaskId
              ? {
                  ...sub,
                  completed: !sub.completed,
                }
              : sub
          ),
        };
      })
    );
  };

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const completed = tasks.filter(
      (task) => task.completed
    ).length;

    const active = tasks.length - completed;

    const overdue = tasks.filter(isOverdue).length;

    const today = tasks.filter(
      (task) =>
        isToday(task.dueDate) &&
        !task.completed
    ).length;

    const high = tasks.filter(
      (task) =>
        task.priority === "high" &&
        !task.completed
    ).length;

    const percentage = tasks.length
      ? Math.round((completed / tasks.length) * 100)
      : 0;

    return {
      total: tasks.length,
      completed,
      active,
      overdue,
      today,
      high,
      percentage,
    };
  }, [tasks]);

  /* =======================================================
     FILTERING
  ======================================================= */

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (activeView === "today") {
      result = result.filter((task) =>
        isToday(task.dueDate)
      );
    }

    if (activeView === "upcoming") {
      result = result.filter(
        (task) =>
          task.dueDate &&
          task.dueDate > todayString()
      );
    }

    if (activeView === "completed") {
      result = result.filter(
        (task) => task.completed
      );
    }

    if (activeView === "starred") {
      result = result.filter(
        (task) => task.starred
      );
    }

    if (activeView === "overdue") {
      result = result.filter(isOverdue);
    }

    if (activeView.startsWith("project:")) {
      const projectId = activeView.split(":")[1];

      result = result.filter(
        (task) => task.project === projectId
      );
    }

    if (priorityFilter !== "all") {
      result = result.filter(
        (task) => task.priority === priorityFilter
      );
    }

    if (projectFilter !== "all") {
      result = result.filter(
        (task) => task.project === projectFilter
      );
    }

    if (!showCompleted) {
      result = result.filter(
        (task) => !task.completed
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((task) => {
        return (
          task.title.toLowerCase().includes(query) ||
          task.description
            ?.toLowerCase()
            .includes(query) ||
          task.tags?.some((tag) =>
            tag.toLowerCase().includes(query)
          )
        );
      });
    }

    result.sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }

      if (sortBy === "priority") {
        return (
          priorityRank[b.priority] -
          priorityRank[a.priority]
        );
      }

      if (sortBy === "due") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        return a.dueDate.localeCompare(b.dueDate);
      }

      if (sortBy === "alphabetical") {
        return a.title.localeCompare(b.title);
      }

      return b.createdAt - a.createdAt;
    });

    return result;
  }, [
    tasks,
    activeView,
    priorityFilter,
    projectFilter,
    showCompleted,
    search,
    sortBy,
  ]);

  /* =======================================================
     VIEW TITLE
  ======================================================= */

  const viewTitle = () => {
    if (activeView === "dashboard")
      return "Good morning";

    if (activeView === "today")
      return "Today";

    if (activeView === "upcoming")
      return "Upcoming";

    if (activeView === "completed")
      return "Completed";

    if (activeView === "starred")
      return "Starred";

    if (activeView === "overdue")
      return "Overdue";

    if (activeView.startsWith("project:")) {
      const id = activeView.split(":")[1];
      return (
        getProject(projects, id)?.name ||
        "Project"
      );
    }

    return "Tasks";
  };

  const changeView = (view) => {
    setActiveView(view);
    setSidebarOpen(false);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="app"
      style={{
        "--accent": accent,
      }}
    >
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className={`sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="brand">
          <div className="brand-mark">
            N
          </div>

          <div>
            <div className="brand-name">
              QuestDex
            </div>
            <div className="brand-subtitle">
              PERSONAL IMPROVEMENT
            </div>
          </div>

          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>

        <button
          className="create-task-btn"
          onClick={openCreateModal}
        >
          <Icon name="plus" size={19} />
          <span>New task</span>
          <kbd>⌘ N</kbd>
        </button>

        <nav className="nav-section">
          <div className="nav-label">
            WORKSPACE
          </div>

          <NavItem
            icon="dashboard"
            label="Overview"
            active={activeView === "dashboard"}
            onClick={() =>
              changeView("dashboard")
            }
          />

          <NavItem
            icon="task"
            label="All tasks"
            count={stats.active}
            active={
              activeView === "all"
            }
            onClick={() => changeView("all")}
          />

          <NavItem
            icon="calendar"
            label="Today"
            count={stats.today}
            active={
              activeView === "today"
            }
            onClick={() => changeView("today")}
          />

          <NavItem
            icon="clock"
            label="Upcoming"
            active={
              activeView === "upcoming"
            }
            onClick={() =>
              changeView("upcoming")
            }
          />

          <NavItem
            icon="star"
            label="Starred"
            active={
              activeView === "starred"
            }
            onClick={() =>
              changeView("starred")
            }
          />

          <NavItem
            icon="check"
            label="Completed"
            count={stats.completed}
            active={
              activeView === "completed"
            }
            onClick={() =>
              changeView("completed")
            }
          />

          {stats.overdue > 0 && (
            <NavItem
              icon="clock"
              label="Overdue"
              count={stats.overdue}
              danger
              active={
                activeView === "overdue"
              }
              onClick={() =>
                changeView("overdue")
              }
            />
          )}
        </nav>

        <div className="nav-section projects-section">
          <div className="nav-label project-header">
            <span>PROJECTS</span>

            <button
              className="tiny-add"
              onClick={() => {
                const name = window.prompt(
                  "Project name:"
                );

                if (!name?.trim()) return;

                setProjects((prev) => [
                  ...prev,
                  {
                    id: crypto.randomUUID(),
                    name: name.trim(),
                    color:
                      accent,
                    icon: "◇",
                  },
                ]);
              }}
            >
              +
            </button>
          </div>

          {projects.map((project) => (
            <button
              key={project.id}
              className={`project-nav ${
                activeView ===
                `project:${project.id}`
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                changeView(
                  `project:${project.id}`
                )
              }
            >
              <span
                className="project-dot"
                style={{
                  background:
                    project.color,
                }}
              />

              <span>{project.name}</span>

              <span className="project-count">
                {
                  tasks.filter(
                    (task) =>
                      task.project ===
                        project.id &&
                      !task.completed
                  ).length
                }
              </span>
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="focus-mini">
            <div className="focus-mini-top">
              <span>FOCUS</span>

              <Icon
                name="clock"
                size={15}
              />
            </div>

            <div className="focus-time">
              {String(
                Math.floor(
                  focusSeconds / 60
                )
              ).padStart(2, "0")}
              :
              {String(
                focusSeconds % 60
              ).padStart(2, "0")}
            </div>

            <button
              className="focus-button"
              onClick={() =>
                setFocusRunning(
                  !focusRunning
                )
              }
            >
              <Icon
                name={
                  focusRunning
                    ? "pause"
                    : "play"
                }
                size={14}
              />

              {focusRunning
                ? "Pause session"
                : "Start focus"}
            </button>
          </div>

          <button
            className="sidebar-setting"
            onClick={() =>
              setShowSettings(true)
            }
          >
            <Icon
              name="settings"
              size={17}
            />
            Settings
          </button>

          <div className="profile">
            <div className="avatar">
              AX
            </div>

            <div className="profile-info">
              <strong>Alex</strong>
              <span>Personal workspace</span>
            </div>

            <button className="more-button">
              <Icon
                name="more"
                size={17}
              />
            </button>
          </div>
        </div>
      </aside>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="main">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() =>
              setSidebarOpen(true)
            }
          >
            <Icon name="menu" />
          </button>

          <div className="breadcrumbs">
            <span>Workspace</span>
            <span>/</span>
            <strong>
              {viewTitle()}
            </strong>
          </div>

          <div className="topbar-actions">
            <button
              className="search-trigger"
              onClick={() =>
                setShowCommand(true)
              }
            >
              <Icon
                name="search"
                size={17}
              />

              <span>Search tasks...</span>

              <kbd>⌘ K</kbd>
            </button>

            <button
              className="icon-button"
              onClick={() =>
                setShowSettings(true)
              }
            >
              <Icon
                name="settings"
                size={18}
              />
            </button>

            <button
              className="top-avatar"
              onClick={() =>
                setShowSettings(true)
              }
            >
              AX
            </button>
          </div>
        </header>

        <div className="content">
          {/* =================================================
              DASHBOARD
          ================================================= */}

          {activeView === "dashboard" ? (
            <Dashboard
              stats={stats}
              tasks={tasks}
              projects={projects}
              onCreate={openCreateModal}
              onToggle={toggleTask}
              onStar={toggleStar}
              onSelect={setSelectedTask}
              onView={changeView}
            />
          ) : (
            /* ===============================================
               TASK VIEW
            =============================================== */

            <section className="task-page">
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    {activeView ===
                    "completed"
                      ? "ARCHIVE"
                      : "TASK MANAGEMENT"}
                  </div>

                  <h1>
                    {viewTitle()}
                  </h1>

                  <p>
                    {filteredTasks.length}{" "}
                    {filteredTasks.length ===
                    1
                      ? "task"
                      : "tasks"}{" "}
                    in this view
                  </p>
                </div>

                <div className="heading-actions">
                  <button
                    className="secondary-button"
                    onClick={clearCompleted}
                  >
                    <Icon
                      name="trash"
                      size={16}
                    />
                    Clear completed
                  </button>

                  <button
                    className="primary-button"
                    onClick={openCreateModal}
                  >
                    <Icon
                      name="plus"
                      size={17}
                    />
                    New task
                  </button>
                </div>
              </div>

              {/* FILTER BAR */}

              <div className="filter-bar">
                <div className="search-box">
                  <Icon
                    name="search"
                    size={17}
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search tasks..."
                  />

                  {search && (
                    <button
                      onClick={() =>
                        setSearch("")
                      }
                    >
                      <Icon
                        name="close"
                        size={14}
                      />
                    </button>
                  )}
                </div>

                <div className="filter-group">
                  <div className="select-wrap">
                    <Icon
                      name="filter"
                      size={15}
                    />

                    <select
                      value={
                        priorityFilter
                      }
                      onChange={(e) =>
                        setPriorityFilter(
                          e.target.value
                        )
                      }
                    >
                      <option value="all">
                        All priorities
                      </option>
                      <option value="high">
                        High priority
                      </option>
                      <option value="medium">
                        Medium priority
                      </option>
                      <option value="low">
                        Low priority
                      </option>
                    </select>
                  </div>

                  <div className="select-wrap">
                    <Icon
                      name="folder"
                      size={15}
                    />

                    <select
                      value={
                        projectFilter
                      }
                      onChange={(e) =>
                        setProjectFilter(
                          e.target.value
                        )
                      }
                    >
                      <option value="all">
                        All projects
                      </option>

                      {projects.map(
                        (project) => (
                          <option
                            key={project.id}
                            value={
                              project.id
                            }
                          >
                            {project.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="select-wrap">
                    <Icon
                      name="sort"
                      size={15}
                    />

                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          e.target.value
                        )
                      }
                    >
                      <option value="created">
                        Recently created
                      </option>
                      <option value="priority">
                        Priority
                      </option>
                      <option value="due">
                        Due date
                      </option>
                      <option value="alphabetical">
                        Alphabetical
                      </option>
                    </select>
                  </div>

                  <button
                    className={`filter-toggle ${
                      !showCompleted
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setShowCompleted(
                        !showCompleted
                      )
                    }
                  >
                    {showCompleted
                      ? "Showing completed"
                      : "Hide completed"}
                  </button>
                </div>
              </div>

              {/* TASK LIST */}

              <div className="task-list">
                {filteredTasks.length ===
                0 ? (
                  <EmptyState
                    search={search}
                    onCreate={
                      openCreateModal
                    }
                  />
                ) : (
                  filteredTasks.map(
                    (task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        project={getProject(
                          projects,
                          task.project
                        )}
                        onToggle={
                          toggleTask
                        }
                        onStar={
                          toggleStar
                        }
                        onPin={togglePin}
                        onDelete={
                          deleteTask
                        }
                        onEdit={
                          openEditModal
                        }
                        onSelect={
                          setSelectedTask
                        }
                        onSubtask={
                          updateSubtask
                        }
                      />
                    )
                  )
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* ===================================================
          MODALS
      =================================================== */}

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          projects={projects}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
          onSave={saveTask}
        />
      )}

      {selectedTask && (
        <TaskDetails
          task={tasks.find(
            (task) =>
              task.id === selectedTask.id
          )}
          project={getProject(
            projects,
            selectedTask.project
          )}
          onClose={() =>
            setSelectedTask(null)
          }
          onEdit={openEditModal}
          onDelete={deleteTask}
          onToggle={toggleTask}
          onSubtask={updateSubtask}
        />
      )}

      {showCommand && (
        <CommandPalette
          search={search}
          setSearch={setSearch}
          onClose={() =>
            setShowCommand(false)
          }
          onCreate={() => {
            setShowCommand(false);
            openCreateModal();
          }}
          onView={(view) => {
            setShowCommand(false);
            changeView(view);
          }}
        />
      )}

      {showSettings && (
        <SettingsModal
          accent={accent}
          setAccent={setAccent}
          onClose={() =>
            setShowSettings(false)
          }
        />
      )}
    </div>
  );
}

/* =========================================================
   NAV ITEM
========================================================= */

function NavItem({
  icon,
  label,
  count,
  active,
  onClick,
  danger,
}) {
  return (
    <button
      className={`nav-item ${
        active ? "active" : ""
      } ${danger ? "danger" : ""}`}
      onClick={onClick}
    >
      <Icon name={icon} size={17} />
      <span>{label}</span>

      {count !== undefined && (
        <span className="nav-count">
          {count}
        </span>
      )}
    </button>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  stats,
  tasks,
  projects,
  onCreate,
  onToggle,
  onStar,
  onSelect,
  onView,
}) {
  const recentTasks = [...tasks]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  const progress =
    stats.percentage || 0;

  return (
    <section className="dashboard">
      <div className="dashboard-header">
        <div>
          <div className="eyebrow">
            {new Date().toLocaleDateString(
              "en-US",
              {
                weekday: "long",
                month: "long",
                day: "numeric",
              }
            )}
          </div>

          <h1>
            Good morning<span>.</span>
          </h1>

          <p>
            Here's what's happening with
            your work today.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={onCreate}
        >
          <Icon
            name="plus"
            size={17}
          />
          Create task
        </button>
      </div>

      {/* STAT CARDS */}

      <div className="stats-grid">
        <StatCard
          label="Total tasks"
          value={stats.total}
          meta={`${stats.active} active`}
          icon="task"
        />

        <StatCard
          label="Completed"
          value={stats.completed}
          meta={`${stats.percentage}% completion`}
          icon="check"
        />

        <StatCard
          label="Due today"
          value={stats.today}
          meta={
            stats.today === 1
              ? "1 task needs attention"
              : "Tasks need attention"
          }
          icon="calendar"
        />

        <StatCard
          label="Overdue"
          value={stats.overdue}
          meta={
            stats.overdue
              ? "Needs attention"
              : "You're all caught up"
          }
          icon="clock"
          danger={stats.overdue > 0}
        />
      </div>

      <div className="dashboard-grid">
        {/* PROGRESS */}

        <div className="panel progress-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">
                PRODUCTIVITY
              </span>
              <h2>Completion rate</h2>
            </div>

            <div className="progress-percentage">
              {progress}%
            </div>
          </div>

          <div className="large-progress">
            <div
              className="large-progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="progress-bottom">
            <span>
              {stats.completed} completed
            </span>
            <span>
              {stats.active} remaining
            </span>
          </div>

          <div className="productivity-ring-wrap">
            <div
              className="productivity-ring"
              style={{
                "--progress": `${progress * 3.6}deg`,
              }}
            >
              <div>
                <strong>
                  {progress}%
                </strong>
                <span>done</span>
              </div>
            </div>

            <div className="ring-info">
              <h3>
                {progress >= 80
                  ? "Excellent momentum"
                  : progress >= 50
                  ? "Good progress"
                  : "Let's get moving"}
              </h3>

              <p>
                Keep completing tasks to
                build your productivity streak.
              </p>

              <button
                className="text-button"
                onClick={() =>
                  onView("completed")
                }
              >
                View completed
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* FOCUS */}

        <FocusPanel />
      </div>

      <div className="dashboard-bottom">
        {/* RECENT TASKS */}

        <div className="panel recent-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">
                ACTIVITY
              </span>
              <h2>Recent tasks</h2>
            </div>

            <button
              className="text-button"
              onClick={() =>
                onView("all")
              }
            >
              View all →
            </button>
          </div>

          <div className="recent-list">
            {recentTasks.length === 0 ? (
              <div className="empty-small">
                No tasks yet.
              </div>
            ) : (
              recentTasks.map(
                (task) => {
                  const project =
                    getProject(
                      projects,
                      task.project
                    );

                  return (
                    <div
                      className="recent-task"
                      key={task.id}
                      onClick={() =>
                        onSelect(task)
                      }
                    >
                      <button
                        className={`task-check ${
                          task.completed
                            ? "checked"
                            : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggle(task.id);
                        }}
                      >
                        {task.completed && (
                          <Icon
                            name="check"
                            size={13}
                          />
                        )}
                      </button>

                      <div className="recent-task-main">
                        <span
                          className={
                            task.completed
                              ? "completed-title"
                              : ""
                          }
                        >
                          {task.title}
                        </span>

                        <div className="task-meta">
                          <span
                            className="project-label"
                          >
                            <i
                              style={{
                                background:
                                  project?.color,
                              }}
                            />
                            {project?.name}
                          </span>

                          {task.dueDate && (
                            <span>
                              {formatDate(
                                task.dueDate
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        className={`star-button ${
                          task.starred
                            ? "starred"
                            : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onStar(task.id);
                        }}
                      >
                        <Icon
                          name="star"
                          size={16}
                        />
                      </button>
                    </div>
                  );
                }
              )
            )}
          </div>
        </div>

        {/* PROJECTS */}

        <div className="panel projects-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">
                ORGANIZATION
              </span>
              <h2>Projects</h2>
            </div>
          </div>

          <div className="project-overview-list">
            {projects.map(
              (project) => {
                const projectTasks =
                  tasks.filter(
                    (task) =>
                      task.project ===
                      project.id
                  );

                const completed =
                  projectTasks.filter(
                    (task) =>
                      task.completed
                  ).length;

                const percentage =
                  projectTasks.length
                    ? Math.round(
                        (completed /
                          projectTasks.length) *
                          100
                      )
                    : 0;

                return (
                  <button
                    className="project-overview"
                    key={project.id}
                    onClick={() =>
                      onView(
                        `project:${project.id}`
                      )
                    }
                  >
                    <div className="project-overview-top">
                      <div className="project-icon">
                        {project.icon}
                      </div>

                      <div className="project-overview-name">
                        <strong>
                          {project.name}
                        </strong>
                        <span>
                          {
                            projectTasks.length
                          }{" "}
                          tasks
                        </span>
                      </div>

                      <b>
                        {percentage}%
                      </b>
                    </div>

                    <div className="mini-progress">
                      <span
                        style={{
                          width: `${percentage}%`,
                          background:
                            project.color,
                        }}
                      />
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  meta,
  icon,
  danger,
}) {
  return (
    <div
      className={`stat-card ${
        danger ? "stat-danger" : ""
      }`}
    >
      <div className="stat-top">
        <span>{label}</span>

        <div className="stat-icon">
          <Icon
            name={icon}
            size={17}
          />
        </div>
      </div>

      <strong>{value}</strong>

      <span className="stat-meta">
        {meta}
      </span>
    </div>
  );
}

/* =========================================================
   FOCUS PANEL
========================================================= */

function FocusPanel() {
  const [seconds, setSeconds] = useState(
    25 * 60
  );

  const [running, setRunning] =
    useState(false);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          setRunning(false);
          return 25 * 60;
        }

        return value - 1;
      });
    }, 1000);

    return () =>
      clearInterval(interval);
  }, [running]);

  const minutes = Math.floor(
    seconds / 60
  )
    .toString()
    .padStart(2, "0");

  const secs = (seconds % 60)
    .toString()
    .padStart(2, "0");

  return (
    <div className="panel focus-panel">
      <div className="focus-panel-header">
        <div>
          <span className="panel-kicker">
            DEEP WORK
          </span>

          <h2>Focus session</h2>
        </div>

        <div className="focus-live">
          <i />
          {running ? "LIVE" : "READY"}
        </div>
      </div>

      <div className="timer">
        {minutes}
        <span>:</span>
        {secs}
      </div>

      <div className="timer-label">
        {running
          ? "Stay focused. You've got this."
          : "25 minute focus interval"}
      </div>

      <div className="timer-actions">
        <button
          className="timer-main"
          onClick={() =>
            setRunning(!running)
          }
        >
          <Icon
            name={
              running
                ? "pause"
                : "play"
            }
            size={17}
          />

          {running
            ? "Pause"
            : "Start focus"}
        </button>

        <button
          className="timer-reset"
          onClick={() => {
            setRunning(false);
            setSeconds(25 * 60);
          }}
        >
          <Icon
            name="refresh"
            size={17}
          />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   TASK CARD
========================================================= */

function TaskCard({
  task,
  project,
  onToggle,
  onStar,
  onPin,
  onDelete,
  onEdit,
  onSelect,
  onSubtask,
}) {
  const completedSubtasks =
    task.subtasks?.filter(
      (sub) => sub.completed
    ).length || 0;

  const totalSubtasks =
    task.subtasks?.length || 0;

  return (
    <article
      className={`task-card ${
        task.completed
          ? "task-completed"
          : ""
      }`}
    >
      <button
        className={`large-check ${
          task.completed
            ? "checked"
            : ""
        }`}
        onClick={() =>
          onToggle(task.id)
        }
      >
        {task.completed && (
          <Icon
            name="check"
            size={15}
          />
        )}
      </button>

      <div
        className="task-card-body"
        onClick={() =>
          onSelect(task)
        }
      >
        <div className="task-card-title-row">
          <h3
            className={
              task.completed
                ? "completed-title"
                : ""
            }
          >
            {task.title}
          </h3>

          {task.pinned && (
            <span className="pin-badge">
              PINNED
            </span>
          )}
        </div>

        {task.description && (
          <p className="task-description">
            {task.description}
          </p>
        )}

        <div className="task-card-meta">
          <span
            className={`priority-badge priority-${task.priority}`}
          >
            <i />
            {task.priority}
          </span>

          {project && (
            <span className="project-label">
              <i
                style={{
                  background:
                    project.color,
                }}
              />
              {project.name}
            </span>
          )}

          {task.dueDate && (
            <span
              className={`date-label ${
                isOverdue(task)
                  ? "overdue"
                  : ""
              }`}
            >
              <Icon
                name="calendar"
                size={13}
              />
              {isOverdue(task)
                ? "Overdue"
                : formatDate(
                    task.dueDate
                  )}
            </span>
          )}

          {totalSubtasks > 0 && (
            <span className="subtask-count">
              <Icon
                name="check"
                size={13}
              />
              {completedSubtasks}/
              {totalSubtasks}
            </span>
          )}

          {task.tags?.map((tag) => (
            <span
              className="tag"
              key={tag}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="task-card-actions">
        <button
          className={`star-button ${
            task.starred
              ? "starred"
              : ""
          }`}
          onClick={() =>
            onStar(task.id)
          }
          title="Star task"
        >
          <Icon
            name="star"
            size={17}
          />
        </button>

        <button
          className={`pin-button ${
            task.pinned ? "active" : ""
          }`}
          onClick={() =>
            onPin(task.id)
          }
          title="Pin task"
        >
          <span>⌖</span>
        </button>

        <button
          className="more-button"
          onClick={() =>
            onEdit(task)
          }
          title="Edit"
        >
          <Icon
            name="edit"
            size={16}
          />
        </button>

        <button
          className="more-button danger-button"
          onClick={() =>
            onDelete(task.id)
          }
          title="Delete"
        >
          <Icon
            name="trash"
            size={16}
          />
        </button>
      </div>
    </article>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  search,
  onCreate,
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        {search ? "⌕" : "✓"}
      </div>

      <h3>
        {search
          ? "No matching tasks"
          : "Nothing here yet"}
      </h3>

      <p>
        {search
          ? "Try changing your search or filters."
          : "Create a task and start getting things done."}
      </p>

      {!search && (
        <button
          className="primary-button"
          onClick={onCreate}
        >
          <Icon
            name="plus"
            size={16}
          />
          Create your first task
        </button>
      )}
    </div>
  );
}

/* =========================================================
   TASK MODAL
========================================================= */

function TaskModal({
  task,
  projects,
  onClose,
  onSave,
}) {
  const [title, setTitle] = useState(
    task?.title || ""
  );

  const [description, setDescription] =
    useState(task?.description || "");

  const [priority, setPriority] =
    useState(
      task?.priority || "medium"
    );

  const [dueDate, setDueDate] =
    useState(task?.dueDate || "");

  const [project, setProject] =
    useState(
      task?.project ||
        projects[0]?.id ||
        ""
    );

  const [tags, setTags] = useState(
    task?.tags?.join(", ") || ""
  );

  const [subtasks, setSubtasks] =
    useState(
      task?.subtasks || []
    );

  const [subtaskInput, setSubtaskInput] =
    useState("");

  const addSubtask = () => {
    if (!subtaskInput.trim()) return;

    setSubtasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title:
          subtaskInput.trim(),
        completed: false,
      },
    ]);

    setSubtaskInput("");
  };

  const submit = (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description,
      priority,
      dueDate,
      project,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      subtasks,
      completed:
        task?.completed || false,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal task-modal">
        <div className="modal-header">
          <div>
            <span className="panel-kicker">
              {task
                ? "EDIT TASK"
                : "NEW TASK"}
            </span>

            <h2>
              {task
                ? "Edit task"
                : "Create a task"}
            </h2>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            <Icon
              name="close"
              size={18}
            />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label>TASK NAME</label>

            <input
              className="large-input"
              autoFocus
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              placeholder="What needs to be done?"
            />
          </div>

          <div className="form-group">
            <label>DESCRIPTION</label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Add some context..."
              rows={4}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>PRIORITY</label>

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(
                    e.target.value
                  )
                }
              >
                <option value="low">
                  Low
                </option>
                <option value="medium">
                  Medium
                </option>
                <option value="high">
                  High
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>DUE DATE</label>

              <input
                type="date"
                value={dueDate}
                onChange={(e) =>
                  setDueDate(
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>PROJECT</label>

              <select
                value={project}
                onChange={(e) =>
                  setProject(
                    e.target.value
                  )
                }
              >
                {projects.map(
                  (item) => (
                    <option
                      value={item.id}
                      key={item.id}
                    >
                      {item.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label>TAGS</label>

              <input
                value={tags}
                onChange={(e) =>
                  setTags(
                    e.target.value
                  )
                }
                placeholder="react, work, important"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="subtask-heading">
              <label>
                SUBTASKS
              </label>

              <span>
                {subtasks.length}
              </span>
            </div>

            <div className="subtask-input">
              <input
                value={subtaskInput}
                onChange={(e) =>
                  setSubtaskInput(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter"
                  ) {
                    e.preventDefault();
                    addSubtask();
                  }
                }}
                placeholder="Add a subtask..."
              />

              <button
                type="button"
                onClick={addSubtask}
              >
                <Icon
                  name="plus"
                  size={16}
                />
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="modal-subtasks">
                {subtasks.map(
                  (sub) => (
                    <div
                      className="modal-subtask"
                      key={sub.id}
                    >
                      <span>
                        {sub.title}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setSubtasks(
                            (prev) =>
                              prev.filter(
                                (x) =>
                                  x.id !==
                                  sub.id
                              )
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
            >
              {task
                ? "Save changes"
                : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   TASK DETAILS
========================================================= */

function TaskDetails({
  task,
  project,
  onClose,
  onEdit,
  onDelete,
  onToggle,
  onSubtask,
}) {
  if (!task) return null;

  const completed =
    task.subtasks?.filter(
      (sub) => sub.completed
    ).length || 0;

  const total =
    task.subtasks?.length || 0;

  return (
    <div className="modal-overlay">
      <div className="modal details-modal">
        <div className="modal-header">
          <div className="details-actions-left">
            <span
              className={`priority-badge priority-${task.priority}`}
            >
              <i />
              {task.priority}
            </span>

            {task.completed && (
              <span className="completed-badge">
                COMPLETED
              </span>
            )}
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            <Icon
              name="close"
              size={18}
            />
          </button>
        </div>

        <div className="details-content">
          <h2>{task.title}</h2>

          {task.description && (
            <p className="details-description">
              {task.description}
            </p>
          )}

          <div className="details-meta-grid">
            <div>
              <span>PROJECT</span>

              <strong>
                <i
                  style={{
                    background:
                      project?.color,
                  }}
                />

                {project?.name ||
                  "No project"}
              </strong>
            </div>

            <div>
              <span>DUE DATE</span>

              <strong
                className={
                  isOverdue(task)
                    ? "overdue-text"
                    : ""
                }
              >
                {task.dueDate
                  ? formatDate(
                      task.dueDate
                    )
                  : "No due date"}
              </strong>
            </div>
          </div>

          {task.tags?.length > 0 && (
            <div className="details-tags">
              {task.tags.map((tag) => (
                <span
                  className="tag"
                  key={tag}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {total > 0 && (
            <div className="details-subtasks">
              <div className="details-subtask-header">
                <span>
                  Subtasks
                </span>

                <strong>
                  {completed}/{total}
                </strong>
              </div>

              <div className="subtask-progress">
                <span
                  style={{
                    width: `${
                      (completed /
                        total) *
                      100
                    }%`,
                  }}
                />
              </div>

              {task.subtasks.map(
                (sub) => (
                  <button
                    className="detail-subtask"
                    key={sub.id}
                    onClick={() =>
                      onSubtask(
                        task.id,
                        sub.id
                      )
                    }
                  >
                    <span
                      className={
                        sub.completed
                          ? "sub-check done"
                          : "sub-check"
                      }
                    >
                      {sub.completed && (
                        <Icon
                          name="check"
                          size={12}
                        />
                      )}
                    </span>

                    <span
                      className={
                        sub.completed
                          ? "sub-done"
                          : ""
                      }
                    >
                      {sub.title}
                    </span>
                  </button>
                )
              )}
            </div>
          )}
        </div>

        <div className="modal-footer details-footer">
          <button
            className="danger-outline"
            onClick={() =>
              onDelete(task.id)
            }
          >
            <Icon
              name="trash"
              size={16}
            />
            Delete
          </button>

          <div>
            <button
              className="secondary-button"
              onClick={() =>
                onToggle(task.id)
              }
            >
              {task.completed
                ? "Mark active"
                : "Mark complete"}
            </button>

            <button
              className="primary-button"
              onClick={() =>
                onEdit(task)
              }
            >
              <Icon
                name="edit"
                size={15}
              />
              Edit task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   COMMAND PALETTE
========================================================= */

function CommandPalette({
  search,
  setSearch,
  onClose,
  onCreate,
  onView,
}) {
  return (
    <div
      className="command-overlay"
      onClick={onClose}
    >
      <div
        className="command-palette"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="command-search">
          <Icon
            name="search"
            size={20}
          />

          <input
            autoFocus
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search or jump to..."
          />

          <kbd>ESC</kbd>
        </div>

        <div className="command-section">
          <span>QUICK ACTIONS</span>

          <CommandItem
            icon="plus"
            title="Create new task"
            shortcut="⌘ N"
            onClick={onCreate}
          />

          <CommandItem
            icon="dashboard"
            title="Open overview"
            onClick={() =>
              onView("dashboard")
            }
          />

          <CommandItem
            icon="calendar"
            title="Open today's tasks"
            onClick={() =>
              onView("today")
            }
          />

          <CommandItem
            icon="star"
            title="Open starred tasks"
            onClick={() =>
              onView("starred")
            }
          />

          <CommandItem
            icon="check"
            title="Open completed tasks"
            onClick={() =>
              onView("completed")
            }
          />
        </div>

        <div className="command-footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> Navigate
          </span>

          <span>
            <kbd>↵</kbd> Select
          </span>

          <span>
            <kbd>ESC</kbd> Close
          </span>
        </div>
      </div>
    </div>
  );
}

function CommandItem({
  icon,
  title,
  shortcut,
  onClick,
}) {
  return (
    <button
      className="command-item"
      onClick={onClick}
    >
      <div className="command-item-icon">
        <Icon
          name={icon}
          size={17}
        />
      </div>

      <span>{title}</span>

      {shortcut && (
        <kbd>{shortcut}</kbd>
      )}
    </button>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function SettingsModal({
  accent,
  setAccent,
  onClose,
}) {
  const accents = [
    "#8b5cf6",
    "#3b82f6",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
  ];

  return (
    <div className="modal-overlay">
      <div className="modal settings-modal">
        <div className="modal-header">
          <div>
            <span className="panel-kicker">
              PREFERENCES
            </span>

            <h2>Settings</h2>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            <Icon
              name="close"
              size={18}
            />
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-row">
            <div>
              <strong>
                Appearance
              </strong>
              <p>
                Nexus is optimized for
                dark environments.
              </p>
            </div>

            <div className="theme-preview">
              <Icon
                name="sun"
                size={16}
              />
              Dark
            </div>
          </div>

          <div className="settings-row">
            <div>
              <strong>
                Accent color
              </strong>
              <p>
                Customize the interface
                highlight color.
              </p>
            </div>

            <div className="accent-picker">
              {accents.map(
                (color) => (
                  <button
                    key={color}
                    className={
                      accent === color
                        ? "selected"
                        : ""
                    }
                    style={{
                      background:
                        color,
                    }}
                    onClick={() =>
                      setAccent(color)
                    }
                  />
                )
              )}
            </div>
          </div>

          <div className="shortcut-box">
            <div>
              <strong>
                Keyboard shortcuts
              </strong>
              <span>
                Speed up your workflow.
              </span>
            </div>

            <div className="shortcut-list">
              <span>
                <kbd>⌘ N</kbd>
                New task
              </span>

              <span>
                <kbd>⌘ K</kbd>
                Command palette
              </span>

              <span>
                <kbd>ESC</kbd>
                Close modal
              </span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="primary-button"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}