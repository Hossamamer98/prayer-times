const citiesMap = {
  Cairo: "Al Qāhirah",
  Alexandria: "Al Iskandarīyah",
  Giza: "Al Jīzah",
  Mansoura: "Ad Daqahlīyah",
  Aswan: "Aswān",
};

let countdownInterval;

// Populate city select
for (let city in citiesMap) {
  document.getElementById(
    "cities-select"
  ).innerHTML += `<option>${city}</option>`;
}

document
  .getElementById("cities-select")
  .addEventListener("change", function () {
    document.getElementById("city-name").innerText = this.value;
    getPrayerTimes(citiesMap[this.value]);
  });

function getPrayerTimes(cityName) {
  axios
    .get("https://api.aladhan.com/v1/timingsByCity", {
      params: { country: "EG", city: cityName },
    })
    .then((response) => {
      const timings = response.data.data.timings;
      updateTimes(timings);

      const readableDate = response.data.data.date.readable;
      const weekDay = response.data.data.date.hijri.weekday.en;
      document.getElementById("date").innerText = `${weekDay}, ${readableDate}`;

      const nextPrayer = getNextPrayerTime(timings);
      startCountdown(nextPrayer.time, nextPrayer.name);
    })
    .catch(console.error);
}

function updateTimes(t) {
  fillTimeByTimings("fajr-time", t.Fajr);
  fillTimeByTimings("sunrise-time", t.Sunrise);
  fillTimeByTimings("dhuhr-time", t.Dhuhr);
  fillTimeByTimings("asr-time", t.Asr);
  fillTimeByTimings("maghreb-time", t.Maghrib);
  fillTimeByTimings("isha'a-time", t.Isha);
}

function fillTimeByTimings(id, time) {
  document.getElementById(id).innerText = time;
}

function getNextPrayerTime(timings) {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const prayerTimes = [
    timings.Fajr,
    timings.Dhuhr,
    timings.Asr,
    timings.Maghrib,
    timings.Isha,
  ];

  for (let i = 0; i < prayerTimes.length; i++) {
    let [hour, minute] = prayerTimes[i].split(":").map(Number);
    let prayerDate = new Date(today);
    prayerDate.setHours(hour, minute, 0);
    if (prayerDate > now) {
      return { name: prayerNames[i], time: prayerDate };
    }
  }

  let [hour, minute] = timings.Fajr.split(":").map(Number);
  let tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(hour, minute, 0);
  return { name: "Fajr", time: tomorrow };
}

function startCountdown(targetTime, name) {
  clearInterval(countdownInterval);
  document.getElementById("next-prayer-name").innerText =
    "Next Prayer: " + name;

  countdownInterval = setInterval(() => {
    let now = new Date();
    let diff = targetTime - now;
    if (diff <= 0) {
      clearInterval(countdownInterval);
      document.getElementById("countdown").innerText = "It's time!";
      return;
    }

    let hours = Math.floor(diff / (1000 * 60 * 60));
    let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById("countdown").innerText = `${String(hours).padStart(
      2,
      "0"
    )}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, 1000);
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
}

// Load default city
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("cities-select").value = "Cairo";
  getPrayerTimes(citiesMap["Cairo"]);
});
