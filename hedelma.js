
document.addEventListener("DOMContentLoaded", () => {
  const SYMBOLS = ["🍎", "🍐", "🍒", "🍉", "6️⃣"];

  const playButton = document.querySelector("#pelaa button");
  const reels = Array.from(document.querySelectorAll(".rulla"));
  const lockImgs = Array.from(document.querySelectorAll(".myPicture .fruit-img"));
  const lockButtons = Array.from(document.querySelectorAll(".myPicture .lock-btn"));

  const rahaInput = document.querySelector("#raha");
  const panosInput = document.querySelector("#panos");

  if (!playButton) {
    console.error("Pelaa-nappia ei löytynyt (#pelaa button). Tarkista HTML.");
    return;
  }
  if (reels.length === 0) {
    console.warn("Rullia ei löytynyt (.rulla). Tarkista HTML.");
  }

  // Alustetaan rullat jos tyhjiä
  reels.forEach(r => {
    if (!r.querySelector(".symboli")) renderRandomToReel(r, 4);
  });

  // Lukitusnapit
  lockButtons.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      const img = lockImgs[idx];
      if (!img) return;
      img.classList.toggle("locked");
      btn.classList.toggle("locked");
      btn.textContent = img.classList.contains("locked") ? "Lukittu" : "Lukitse";
    });
  });

  function getRandomSymbol() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  }

  function renderRandomToReel(reel, count = 4) {
    reel.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const d = document.createElement("div");
      d.className = "symboli";
      d.textContent = getRandomSymbol();
      reel.appendChild(d);
    }
  }

  function checkWin() {
    const panos = parseInt(panosInput.value, 10) || 0;
    let voitto = 0;

    // 4 riviä (koska jokaisessa rullassa 4 symbolia)
    for (let row = 0; row < 4; row++) {
      const rivinSymbolit = reels.map(reel => {
        const symbols = reel.querySelectorAll(".symboli");
        return symbols[row] ? symbols[row].textContent : "";
      });

      // Jos rivillä kaikki samat
      if (rivinSymbolit.every(s => s === rivinSymbolit[0] && s !== "")) {
        const sym = rivinSymbolit[0];
        if (sym === "6️⃣") {
          voitto += 10 * panos;
        } else if (sym === "🍎") {
          voitto += 6 * panos;
        } else if (sym === "🍉") {
          voitto += 5 * panos;
        } else if (sym === "🍐") {
          voitto += 4 * panos;
        } else if (sym === "🍒") {
          voitto += 3 * panos;
        }
      }

      // Jos rivillä 3 peräkkäistä seiskaa
      for (let i = 0; i <= rivinSymbolit.length - 3; i++) {
        if (
          rivinSymbolit[i] === "6️⃣" &&
          rivinSymbolit[i + 1] === "6️⃣" &&
          rivinSymbolit[i + 2] === "6️⃣"
        ) {
          voitto += 5 * panos;
        }
      }
    }

    return voitto;
  }

  function spinReels() {
    try {
      if (playButton.disabled) return;

      let raha = parseInt(rahaInput.value, 10);
      const panos = parseInt(panosInput.value, 10) || 0;

      if (isNaN(raha) || isNaN(panos)) {
        alert("Anna kelvollinen rahasumma ja panos.");
        return;
      }

      const allLocked = reels.every((_, idx) => lockImgs[idx] && lockImgs[idx].classList.contains("locked"));
      if (allLocked) {
        alert("Kaikki rullat ovat lukittuina — ei pyöritystä.");
        return;
      }

      if (raha < panos) {
        alert("Rahasumma liian pieni. Et voi pelata!");
        return;
      }

      raha -= panos;
      rahaInput.value = raha;

      playButton.disabled = true;

      const total = reels.length;
      let finished = 0;

      function finalize() {
        try {
          const voitto = checkWin();
          if (voitto > 0) {
            const nyky = parseInt(rahaInput.value, 10) || 0;
            rahaInput.value = nyky + voitto;
            alert("Voitit " + voitto + "€!");
          }
        } catch (err) {
          console.error("Virhe voiton tarkistuksessa", err);
        } finally {
          // 🔑 Poista kaikki lukitukset pelikierroksen lopussa
          lockImgs.forEach(img => img.classList.remove("locked"));
          lockButtons.forEach(btn => {
            btn.classList.remove("locked");
            btn.textContent = "Lukitse";
          });

          playButton.disabled = false;
        }
      }

      reels.forEach((reel, i) => {
        const locked = lockImgs[i] && lockImgs[i].classList.contains("locked");
        if (locked) {
          finished++;
          if (finished === total) finalize();
          return;
        }

        const interval = setInterval(() => {
          renderRandomToReel(reel, 4);
        }, 80);

        const stopAfter = 700 + i * 220 + Math.floor(Math.random() * 300);
        setTimeout(() => {
          clearInterval(interval);
          renderRandomToReel(reel, 4);
          finished++;
          if (finished === total) finalize();
        }, stopAfter);
      });
    } catch (err) {
      console.error("spinReels virhe:", err);
      playButton.disabled = false;
    }
  }

  playButton.addEventListener("click", spinReels);
}); // DOMContentLoaded
