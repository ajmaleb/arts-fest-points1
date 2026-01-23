const sheetID = "1IcyUNaO1QGfnVJ3lf21dgImLCz_yvaUjy4hKs0CW9z8";
const sheetName = "Form Responses 1";

const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?sheet=${encodeURIComponent(sheetName)}`;

fetch(url)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    const tbody = document.querySelector("#pointsTable tbody");
    tbody.innerHTML = "";

    if (!rows || rows.length === 0) {
      tbody.innerHTML = "<tr><td colspan='5'>No data available</td></tr>";
      return;
    }

    rows.forEach(r => {
      let tr = document.createElement("tr");

      // Columns: Timestamp | RegNo | Name | Dept | Event | Points
      for (let i = 1; i <= 5; i++) {
        let td = document.createElement("td");
        td.textContent = r.c[i] ? r.c[i].v : "";
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    });
  })
  .catch(error => {
    console.error("ERROR:", error);
    alert("Cannot load data. Check sheet sharing or internet.");
  });
document.getElementById("search").addEventListener("keyup", function () {
    let value = this.value.toLowerCase();
    let rows = document.querySelectorAll("#pointsTable tbody tr");

    rows.forEach(row => {
        let text = row.textContent.toLowerCase();
        row.style.display = text.includes(value) ? "" : "none";
    });
});

