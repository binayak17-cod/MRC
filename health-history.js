document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("history-form");
  const tableBody = document.querySelector("#history-table tbody");

  function loadHistory() {
    const history = JSON.parse(localStorage.getItem("healthHistory")) || [];
    tableBody.innerHTML = "";

    if (history.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7">No health history found.</td></tr>`;
      return;
    }

    history.forEach((entry, index) => {
      const prescriptionId = `prescription-${index}`;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.symptoms}</td>
        <td>${entry.severity}</td>
        <td>${entry.medicines}</td>
        <td>${entry.dosage}</td>
        <td>${entry.feedback || "N/A"}</td>
        <td class="actions-btns">
          <button onclick="deleteEntry(${index})" title="Delete">🗑️</button>
          <button onclick="downloadPrescription(${index})" title="Download PDF">📄</button>
        </td>
        <td style="display: none;">
          <div id="${prescriptionId}">
            <h2 style="color: #004d40;">HealthAssist Prescription</h2>
            <p><strong>Date:</strong> ${entry.date}</p>
            <p><strong>Symptoms:</strong> ${entry.symptoms}</p>
            <p><strong>Severity:</strong> ${entry.severity}</p>
            <p><strong>Medicines:</strong> ${entry.medicines}</p>
            <p><strong>Dosage & Duration:</strong> ${entry.dosage}</p>
            <p><strong>Feedback:</strong> ${entry.feedback || "N/A"}</p>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newEntry = {
      date: document.getElementById("entry-date").value,
      symptoms: document.getElementById("symptoms").value.trim(),
      severity: document.getElementById("severity").value,
      medicines: document.getElementById("medicines").value.trim(),
      dosage: document.getElementById("dosage").value.trim(),
      feedback: document.getElementById("feedback").value.trim()
    };

    let history = JSON.parse(localStorage.getItem("healthHistory")) || [];
    history.push(newEntry);
    localStorage.setItem("healthHistory", JSON.stringify(history));
    form.reset();
    loadHistory();
  });

  loadHistory();
});

function deleteEntry(index) {
  const history = JSON.parse(localStorage.getItem("healthHistory")) || [];
  history.splice(index, 1);
  localStorage.setItem("healthHistory", JSON.stringify(history));
  location.reload();
}

function downloadPrescription(index) {
  const element = document.getElementById(`prescription-${index}`);
  
  // Temporarily make visible
  element.style.display = "block";
  element.style.position = "absolute";
  element.style.left = "-9999px"; // Move off-screen

  const opt = {
    margin: 0.5,
    filename: `Prescription_${index + 1}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
  };

  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => {
      // Re-hide after PDF is generated
      element.style.display = "none";
      element.style.position = "";
      element.style.left = "";
    });
}

  html2pdf().set(opt).from(element).save();

