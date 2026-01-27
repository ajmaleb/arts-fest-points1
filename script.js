document.addEventListener("DOMContentLoaded", () => {

  /* ================= CONFIG ================= */
  const sheetID = "1AR6lA4a63wnyBQCzo7hWo3OjvJMdOGogJvq4dOCmLB8";
  const sheetName = "Form Responses 1";
  const RESULTS_FINALISED = false; // set true after fest

  const departments = [
    "Department of Science",
    "Department of Commerce",
    "Department of Computer Science and Statistics",
    "Department of Economics",
    "Department of History"
  ];

  /* ================= ITEMS ================= */
  const individualItems = [
    "Essay Writing (Malayalam)","Essay Writing (English)","Essay Writing (Hindi)",
    "Essay Writing (Tamil)","Essay Writing (Arabic)","Essay Writing (Sanskrit)",
    "Short Story Writing (Malayalam)","Short Story Writing (English)",
    "Short Story Writing (Hindi)","Short Story Writing (Tamil)",
    "Short Story Writing (Arabic)","Short Story Writing (Sanskrit)",
    "Poetry Writing (Malayalam)","Poetry Writing (English)",
    "Poetry Writing (Hindi)","Poetry Writing (Tamil)",
    "Poetry Writing (Sanskrit)","Film Review",
    "On the Spot Painting","Poster Designing","Cartooning","Rangoli",
    "Mehndi","Collage","Clay Modelling","Photography",
    "Light Music","Western Music","Instrumental Music","Folk Dance",
    "Bharatanatyam","Kerala Nadanam","Kuchipudi","Kathak","Mappilapattu",
    "Mono Act","Standup Comedy","Kathaprasangam",
    "Elocution (Malayalam)","Elocution (English)","Elocution (Tamil)",
    "Poem Recitation (Malayalam)","Poem Recitation (English)",
    "Poem Recitation (Tamil)","Poem Recitation (Arabic)"
  ];

  const groupItems = [
    "Installation","Nadanpattu","Thiruvathira","Vanchipattu",
    "Mime","Margham Kali","Oppana","Debate","Quiz","Group Song"
  ];

  const url =
    `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?sheet=${encodeURIComponent(sheetName)}`;

  let sheetData = [];
  let announcedCache = new Set();

  /* ================= SAFE DOM ================= */
  const el = id => document.getElementById(id);

  /* ================= POINTS ================= */
  function getPoints(type, pos) {
    if (type === "Individual") {
      return pos == 1 ? 5 : pos == 2 ? 3 : 1;
    } else {
      return pos == 1 ? 10 : pos == 2 ? 6 : 2;
    }
  }

  /* ================= LOAD DATA ================= */
  function loadData() {
    fetch(url)
      .then(res => res.text())
      .then(text => {
        const json = JSON.parse(text.substring(47).slice(0, -2));

        sheetData = json.table.rows.map(r => ({
          itemType: r.c[1]?.v,
          itemName: r.c[2]?.v,
          position: r.c[3]?.v,
          department: r.c[4]?.v,
          chest: r.c[5]?.v,
          participants: r.c[6]?.v
        }));

        updateLeaderboard();
        renderItems();
        updateDropdowns();

        if (el("last-updated")) {
          el("last-updated").innerText =
            "Last updated: " + new Date().toLocaleTimeString();
        }
      })
      .catch(err => {
        console.error("DATA LOAD ERROR:", err);
        alert("Cannot load data. Check Google Sheet sharing & tab name.");
      });
  }

  /* ================= LEADERBOARD (DENSE RANKING) ================= */
  function updateLeaderboard() {
    if (!el("leaderboard-body")) return;

    // Initialize scores
    let scores = {};
    departments.forEach(d => scores[d] = 0);

    // Add points
    sheetData.forEach(r => {
      if (scores.hasOwnProperty(r.department)) {
        scores[r.department] += getPoints(r.itemType, r.position);
      }
    });

    // Sort by score DESC
    const sorted = Object.entries(scores)
      .sort((a, b) => b[1] - a[1]);

    // Dense ranking
    el("leaderboard-body").innerHTML = "";

    let rank = 1;
    let prevScore = sorted.length ? sorted[0][1] : null;

    sorted.forEach(([dept, score], index) => {
      if (index > 0 && score < prevScore) {
        rank++;          // increase rank only when score drops
        prevScore = score;
      }

      el("leaderboard-body").innerHTML += `
        <tr>
          <td>${rank}</td>
          <td>${dept}</td>
          <td>${score}</td>
        </tr>`;
    });
  }

  /* ================= ITEM LISTS ================= */
  function renderItems() {
    renderList("individual-items", individualItems);
    renderList("group-items", groupItems);
  }

  function renderList(id, items) {
    if (!el(id)) return;
    el(id).innerHTML = "";

    items.forEach(item => {
      const announced = sheetData.some(r => r.itemName === item);
      const isNew = announced && !announcedCache.has(item);
      if (announced) announcedCache.add(item);

      el(id).innerHTML += `
        <li class="${isNew ? "new-announcement" : ""}">
          ${item}
          <span class="status ${announced ? "announced" : "not-announced"}"
            ${announced ? `onclick="showResults('${item}')"` : ""}>
            ${announced ? "Result Announced" : "Result Not Announced"}
          </span>
        </li>`;
    });
  }

  /* ================= SHOW RESULTS ================= */
  window.showResults = function(item) {
    if (!el("results-body")) return;

    el("selected-item").innerText = item;
    el("results-body").innerHTML = "";

    sheetData
      .filter(r => r.itemName === item)
      .sort((a, b) => a.position - b.position)
      .forEach(r => {
        const medal =
          r.position == 1 ? "🥇 First" :
          r.position == 2 ? "🥈 Second" : "🥉 Third";

        el("results-body").innerHTML += `
          <tr>
            <td>${medal}</td>
            <td>${r.department}</td>
            <td>${r.chest}</td>
            <td>${r.participants}</td>
          </tr>`;
      });

    el("results-section")?.scrollIntoView({ behavior: "smooth" });
  };

  /* ================= DROPDOWNS ================= */
  function updateDropdowns() {
    if (!el("item-type") || !el("item-name")) return;

    el("item-type").onchange = () => {
      el("item-name").innerHTML =
        `<option value="">-- Select Item --</option>`;

      const list =
        el("item-type").value === "Individual"
          ? individualItems
          : groupItems;

      list.forEach(i => {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = i;
        el("item-name").appendChild(opt);
      });
    };

    el("item-name").onchange = () => {
      if (el("item-name").value) {
        showResults(el("item-name").value);
      }
    };
  }

  /* ================= START ================= */
  loadData();
  if (!RESULTS_FINALISED) {
    setInterval(loadData, 30000);
  }

});

