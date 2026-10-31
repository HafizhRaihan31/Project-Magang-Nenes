const sizes = [
    "1/2", "3/4", "1", "1-1/4", "1-1/2", "2", "2-1/2",
    "3", "3-1/2", "4", "5", "6", "8", "10", "12",
    "14", "16", "18", "20", "22", "24", "26", "28",
    "30", "32", "34", "36", "38", "40", "42", "44",
    "46", "48", "50", "52", "54", "56", "58", "60"
];

const defects = [
    "Tidak Center",
    "Coating",
    "Basic Goyang/Kendor",
    "Basic Patah",
    "Lainnya"
];

let records = JSON.parse(localStorage.getItem("swgRecords")) || [];

const $ = id => document.getElementById(id);

function saveData() {
    localStorage.setItem("swgRecords", JSON.stringify(records));
}

function fillDropdown(id, options) {
    const select = $(id);

    options.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

fillDropdown("size", sizes);
fillDropdown("filter-size", sizes);
fillDropdown("filter-defect", defects);

$("date").value = new Date().toISOString().slice(0, 10);

// Navigasi halaman
const pageTitles = {
    dashboard: ["Dashboard", "Ringkasan hasil monitoring rework produk SWG"],
    input: ["Input Data Rework", "Masukkan hasil pengamatan produk SWG"],
    history: ["Riwayat Data", "Daftar seluruh catatan rework produk SWG"]
};

function showPage(page) {
    document.querySelectorAll(".page").forEach(section => {
        section.classList.remove("active");
    });

    $(page).classList.add("active");

    document.querySelectorAll(".menu-item").forEach(button => {
        button.classList.toggle("active", button.dataset.page === page);
    });

    $("page-title").textContent = pageTitles[page][0];
    $("page-subtitle").textContent = pageTitles[page][1];

    renderAll();
}

document.querySelectorAll(".menu-item").forEach(button => {
    button.addEventListener("click", () => showPage(button.dataset.page));
});

// Input data rework
$("rework-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const record = {
        id: Date.now(),
        date: $("date").value,
        size: $("size").value,
        class: $("class").value,
        defect: $("defect").value,
        quantity: Number($("quantity").value),
        notes: $("notes").value.trim()
    };

    if (!record.date || !record.size || !record.class ||
        !record.defect || record.quantity < 1) {
        alert("Mohon lengkapi seluruh data wajib.");
        return;
    }

    records.push(record);
    saveData();

    alert("Data rework berhasil disimpan!");

    this.reset();
    $("date").value = new Date().toISOString().slice(0, 10);

    showPage("dashboard");
});

// Filter dashboard
["filter-date", "filter-size", "filter-defect"].forEach(id => {
    $(id).addEventListener("change", renderDashboard);
});

function resetFilters() {
    $("filter-date").value = "";
    $("filter-size").value = "";
    $("filter-defect").value = "";
    renderDashboard();
}

function getFilteredRecords() {
    return records.filter(record => {
        const date = $("filter-date").value;
        const size = $("filter-size").value;
        const defect = $("filter-defect").value;

        return (!date || record.date === date) &&
               (!size || record.size === size) &&
               (!defect || record.defect === defect);
    });
}

function countBy(data, key) {
    const result = {};

    data.forEach(record => {
        result[record[key]] = (result[record[key]] || 0) + record.quantity;
    });

    return result;
}

function getTop(data) {
    const entries = Object.entries(data);

    if (!entries.length) return "-";

    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
}

// Grafik batang
function renderBarChart(elementId, data) {
    const container = $(elementId);
    const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

    if (!entries.length) {
        container.innerHTML = '<p class="empty-message">Belum ada data rework.</p>';
        return;
    }

    const maxValue = Math.max(...entries.map(item => item[1]));

    container.innerHTML = entries.map(([label, value]) => {
        const percentage = (value / maxValue) * 100;

        return `
            <div class="bar-item">
                <span class="bar-label">${escapeHTML(label)}</span>
                <div class="bar-track">
                    <div class="bar-fill" style="width:${percentage}%"></div>
                </div>
                <span class="bar-value">${value}</span>
            </div>
        `;
    }).join("");
}

function renderDashboard() {
    const data = getFilteredRecords();

    const total = data.reduce((sum, item) => sum + item.quantity, 0);
    const defectData = countBy(data, "defect");
    const sizeData = countBy(data, "size");

    $("total-rework").textContent = total.toLocaleString("id-ID");
    $("total-records").textContent = data.length;
    $("top-defect").textContent = getTop(defectData);
    $("top-size").textContent = getTop(sizeData) === "-"
        ? "-"
        : "NPS " + getTop(sizeData);

    renderBarChart("defect-chart", defectData);
    renderBarChart("size-chart", sizeData);

    const latest = [...data].sort((a, b) =>
        b.date.localeCompare(a.date) || b.id - a.id
    ).slice(0, 5);

    $("dashboard-table").innerHTML = latest.length
        ? latest.map(record => `
            <tr>
                <td>${formatDate(record.date)}</td>
                <td>NPS ${escapeHTML(record.size)}</td>
                <td>Class ${escapeHTML(record.class)}</td>
                <td>${escapeHTML(record.defect)}</td>
                <td>${record.quantity}</td>
            </tr>
        `).join("")
        : '<tr><td colspan="5" class="empty-cell">Belum ada data rework.</td></tr>';
}

// Riwayat data
function renderHistory() {
    const keyword = $("search-history").value.toLowerCase();

    const filtered = [...records]
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
        .filter(record => [
            record.date, record.size, record.class,
            record.defect, record.notes
        ].join(" ").toLowerCase().includes(keyword));

    $("history-count").textContent = filtered.length + " data";

    $("history-table").innerHTML = filtered.length
        ? filtered.map((record, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${formatDate(record.date)}</td>
                <td>NPS ${escapeHTML(record.size)}</td>
                <td>Class ${escapeHTML(record.class)}</td>
                <td>${escapeHTML(record.defect)}</td>
                <td>${record.quantity}</td>
                <td>${escapeHTML(record.notes || "-")}</td>
                <td>
                    <button class="delete-btn" onclick="deleteRecord(${record.id})">
                        Hapus
                    </button>
                </td>
            </tr>
        `).join("")
        : '<tr><td colspan="8" class="empty-cell">Data tidak ditemukan.</td></tr>';
}

$("search-history").addEventListener("input", renderHistory);

function deleteRecord(id) {
    const confirmed = confirm("Apakah kamu yakin ingin menghapus data ini?");

    if (!confirmed) return;

    records = records.filter(record => record.id !== id);
    saveData();
    renderAll();
}

function formatDate(date) {
    if (!date) return "-";

    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Export CSV
function exportCSV() {
    if (!records.length) {
        alert("Belum ada data untuk diekspor.");
        return;
    }

    const headers = [
        "Tanggal", "NPS", "ASME Class",
        "Jenis Defect", "Jumlah Rework", "Keterangan"
    ];

    const rows = records.map(record => [
        record.date,
        record.size,
        record.class,
        record.defect,
        record.quantity,
        record.notes
    ]);

    const csv = [headers, ...rows]
        .map(row => row.map(value =>
            '"' + String(value ?? "").replace(/"/g, '""') + '"'
        ).join(","))
        .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "Data_Rework_SWG.csv";
    link.click();

    URL.revokeObjectURL(url);
}

function renderAll() {
    renderDashboard();
    renderHistory();
}

renderAll();