<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - NFC Management System</title>
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      min-height: 100vh;
      overflow-x: hidden;
    }

    .dashboard-container {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      padding: 2rem 1rem;
      text-align: left;
    }

    .tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .tab-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      background: white;
      cursor: pointer;
      font-weight: 600;
      color: #374151;
      transition: all 0.2s ease;
    }

    .tab-button.active {
      background: linear-gradient(90deg, #2563eb, #1d4ed8);
      color: white;
    }

    .section-header h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #111827;
    }

    .grid {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
      justify-content: flex-start;
      margin-bottom: 2rem;
    }

    .card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 6px 20px rgba(2, 6, 23, 0.06);
      padding: 1rem;
      border: 1px solid rgba(2, 6, 23, 0.05);
      flex: 0 0 280px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .card-title {
      font-size: 1.1rem;
      font-weight: 700;
    }

    .card-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #374151;
      font-size: 0.95rem;
      margin-top: 0.35rem;
    }

    .icon {
      flex-shrink: 0;
    }

    .error {
      color: red;
      font-weight: 600;
      text-align: center;
      margin-top: 1rem;
    }
  </style>
</head>

<body>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>Dashboard</h1>
      <p>Overview of the database</p>
    </header>

    <nav class="tabs">
      <button class="tab-button active" data-tab="users"><i data-lucide="users"></i> Users</button>
      <button class="tab-button" data-tab="tags"><i data-lucide="tag"></i> Tags</button>
      <button class="tab-button" data-tab="logs"><i data-lucide="file-text"></i> Logs</button>
    </nav>

    <main class="content" id="dashboard-content">
      <div class="section-header">
        <h2 id="section-title">Users</h2>
      </div>
      <div class="grid" id="section-grid">
      </div>
    </main>
  </div>

  <script>
    const API_BASE = "get.php";
    let activeTab = "users";
    let state = { users: [], tags: [], logs: [], loading: false, error: null };

    async function fetchData(endpoint) {
      state.loading = true;
      state.error = null;
      renderContent();

      try {
        // Corrected URL to use query string
        const res = await fetch(`${API_BASE}?resource=${endpoint}`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const json = await res.json();

        // Use the data array directly
        state[activeTab] = json.data || [];
        
      } catch (err) {
        state.error = err.message;
        state[activeTab] = [];
      } finally {
        state.loading = false;
        renderContent();
      }
    }

    function createCard(item, type) {
      const card = document.createElement("div");
      card.className = "card";

      if (type === "users") {
        card.innerHTML = `
          <div class="card-header"><i data-lucide="user" class="icon blue"></i>
          <span class="card-title">${item.name}</span></div>
          <div class="card-row"><i data-lucide="mail" class="icon gray"></i> ${item.email}</div>
          <div class="card-row"><i data-lucide="clock" class="icon gray"></i> Created at: ${item.created_at || "N/A"}</div>
        `;
      } else if (type === "tags") {
        card.innerHTML = `
          <div class="card-header"><i data-lucide="tag" class="icon green"></i>
          <span class="card-title">${item.uid || item.name}</span></div>
          <div class="card-row"><i data-lucide="clock" class="icon gray"></i> Created at: ${item.created_at || "N/A"}</div>
        `;
      } else if (type === "logs") {
        card.innerHTML = `
          <div class="card-header"><i data-lucide="file-text" class="icon purple"></i>
          <span class="card-title">Scan</span></div>
          <div class="card-row"><i data-lucide="hash" class="icon gray"></i> Tag ID: ${item.tag_id}</div>
          <div class="card-row"><i data-lucide="hash" class="icon gray"></i> User: ${item.name || "Unknown"}</div>
          <div class="card-row"><i data-lucide="clock" class="icon gray"></i> Scanned at: ${item.scanned_at}</div>
        `;
      }

      return card;
    }

    function renderContent() {
      const grid = document.getElementById("section-grid");
      const title = document.getElementById("section-title");

      grid.innerHTML = "";
      if (state.loading) {
        grid.innerHTML = "<p>Loading...</p>";
        return;
      }
      if (state.error) {
        grid.innerHTML = `<p class="error">Error: ${state.error}</p>`;
        return;
      }

      title.textContent = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
      state[activeTab].forEach(item => grid.appendChild(createCard(item, activeTab)));
      lucide.createIcons();
    }

    document.querySelectorAll(".tab-button").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeTab = btn.dataset.tab;
        fetchData(activeTab); // fetch using query string
      });
    });

    // Initial load
    fetchData("users");
  </script>
</body>

</html>
