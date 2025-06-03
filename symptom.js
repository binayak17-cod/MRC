document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("symptomForm");
  const loading = document.getElementById("loading");
  const result = document.getElementById("result");
  const symptomInput = document.getElementById("symptomInput");
  const voiceBtn = document.getElementById("voiceBtn");
  const voiceStatus = document.getElementById("voice-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = symptomInput.value.trim();
    result.innerHTML = "";
    result.classList.add("hidden");

    if (!input) {
      result.classList.remove("hidden");
      result.innerHTML = "<span style='color: red;'>Please enter symptoms.</span>";
      return;
    }

    loading.classList.remove("hidden");

    try {
      const predictRes = await fetch("http://127.0.0.1:5000/api/ml_predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: input })
      });

      const predictData = await predictRes.json();
      if (!predictRes.ok || predictData.error) throw new Error(predictData.error);

      const disease = predictData.predicted_disease;
      const confidence = predictData.confidence;

      const detailRes = await fetch(`http://127.0.0.1:5000/api/details?disease=${encodeURIComponent(disease)}`);
      const detailData = await detailRes.json();
      if (!detailRes.ok || detailData.error) throw new Error(detailData.error);

      const description = detailData.description;
      const medicine = Array.isArray(detailData.medicine) ? detailData.medicine.join(", ") : detailData.medicine;
      const precautions = Array.isArray(detailData.precautions) ? detailData.precautions.join(", ") : detailData.precautions;
      const diet = Array.isArray(detailData.diet) ? detailData.diet.join(", ") : detailData.diet;
      const workout = detailData.workout;
      const specialist = detailData.specialist;

      loading.classList.add("hidden");
      result.classList.remove("hidden");
      result.innerHTML = `
        <strong>🤖 Predicted Disease:</strong> ${disease}<br>
        <strong>Possibility:</strong> ${confidence}<br><br>
        <strong>Description:</strong> ${description}<br>
        <strong>Medicine:</strong> ${medicine}<br>
        <strong>Precautions:</strong> ${precautions}<br>
        <strong>Diet:</strong> ${diet}<br>
        <strong>Workout:</strong> ${workout}<br>
        <strong>Recommended Specialist:</strong> ${specialist}
      `;

      const historyEntry = {
        date: new Date().toISOString().split("T")[0],
        symptoms: input,
        severity: "Moderate",
        medicines: medicine,
        dosage: "As prescribed",
        feedback: ""
      };

      const history = JSON.parse(localStorage.getItem("healthHistory")) || [];
      history.push(historyEntry);
      localStorage.setItem("healthHistory", JSON.stringify(history));

    } catch (error) {
      loading.classList.add("hidden");
      result.classList.remove("hidden");
      result.innerHTML = `<span style="color: red;">Error: ${error.message}</span>`;
      console.error("❌ JS error:", error);
    }
  });

  // 🎤 Voice Recognition Logic
  if ("webkitSpeechRecognition" in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      voiceStatus.classList.remove("hidden");
      voiceStatus.textContent = "🎙️ Listening...";
    };

    recognition.onresult = (event) => {
      let transcript = event.results[0][0].transcript;
      // Convert spoken space-separated words to comma-separated symptoms
      transcript = transcript.trim().toLowerCase().replace(/\s+/g, ', ');
      symptomInput.value = transcript;
      voiceStatus.classList.add("hidden");
    };

    recognition.onerror = (event) => {
      voiceStatus.textContent = "❌ Mic error.";
      setTimeout(() => voiceStatus.classList.add("hidden"), 2000);
      console.error("Mic error:", event.error);
    };

    recognition.onend = () => {
      voiceStatus.classList.add("hidden");
      // Auto-submit the form after voice ends
      form.requestSubmit();
    };

    voiceBtn.addEventListener("click", () => {
      recognition.start();
    });
  } else {
    voiceBtn.disabled = true;
    voiceBtn.textContent = "🎤 Not supported";
  }
});

