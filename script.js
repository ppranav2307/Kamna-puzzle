const size = 10;
const grid = document.getElementById("grid");
const clueList = document.querySelectorAll("#clue-list li");
const words = [
  "SAHIBA", "BUBU", "MAKEFACES", "WHITE", "TIMETABLE", "CHAI", "SERIOUSLY"
];

let solutionMap = [];
let selectedCells = [];
let foundWords = new Set(); // ✅ Track completed words

/* Create empty grid */
function createEmptyGrid() {
  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;
    cell.addEventListener("click", handleCellClick);
    grid.appendChild(cell);
    solutionMap[i] = "";
  }
}

/* Place words randomly */
function fillWords() {
  words.forEach(word => {
    let placed = false;
    while (!placed) {
      const dir = Math.random() < 0.5 ? "H" : "V";
      const startX = Math.floor(Math.random() * (dir === "H" ? size - word.length : size));
      const startY = Math.floor(Math.random() * (dir === "V" ? size - word.length : size));
      let fits = true;

      for (let i = 0; i < word.length; i++) {
        const x = dir === "H" ? startX + i : startX;
        const y = dir === "V" ? startY + i : startY;
        const idx = y * size + x;
        if (solutionMap[idx] && solutionMap[idx] !== word[i]) {
          fits = false;
          break;
        }
      }

      if (fits) {
        for (let i = 0; i < word.length; i++) {
          const x = dir === "H" ? startX + i : startX;
          const y = dir === "V" ? startY + i : startY;
          const idx = y * size + x;
          solutionMap[idx] = word[i];
          const cell = grid.children[idx];
          cell.dataset.letter = word[i];
          cell.dataset.word = word;
        }
        placed = true;
      }
    }
  });
}

/* Fill rest with random letters */
function fillRandomLetters() {
  for (let i = 0; i < size * size; i++) {
    if (!solutionMap[i]) {
      solutionMap[i] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
    grid.children[i].textContent = solutionMap[i];
  }
}

/* Handle cell click */
function handleCellClick(e) {
  const cell = e.target;
  cell.classList.toggle("selected");

  if (cell.classList.contains("selected")) {
    selectedCells.push(cell);
  } else {
    selectedCells = selectedCells.filter(c => c !== cell);
  }

  if (isStraightLine(selectedCells)) {
    const word = selectedCells.map(c => c.textContent).join("");
    const reverseWord = selectedCells.map(c => c.textContent).reverse().join("");

    if (words.includes(word) || words.includes(reverseWord)) {
      
      // Mark cells as correct
      selectedCells.forEach(c => {
        c.classList.remove("selected");
        c.classList.add("correct");
      });

      // Mark clue as found
      const clue = document.querySelector(`[data-word="${word}"], [data-word="${reverseWord}"]`);
      if (clue) clue.classList.add("found");

      // ✅ Add to foundWords
      foundWords.add(word);
      foundWords.add(reverseWord);

      selectedCells = [];

      // ✅ Completion check based on words, not letters
      if (foundWords.size / 2 === words.length) {
        setTimeout(() => {
          window.location.href = "gift/index.html";
        }, 1000);
      }
    }
  }
}

/* Check if selected cells are in a straight line */
function isStraightLine(cells) {
  if (cells.length < 2) return false;

  const indices = cells.map(c => parseInt(c.dataset.index));
  const rows = indices.map(i => Math.floor(i / size));
  const cols = indices.map(i => i % size);

  const allSameRow = rows.every(r => r === rows[0]);
  const allSameCol = cols.every(c => c === cols[0]);
  if (!(allSameRow || allSameCol)) return false;

  const sorted = indices.sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) {
    if (allSameRow && sorted[i] !== sorted[i - 1] + 1) return false;
    if (allSameCol && sorted[i] !== sorted[i - 1] + size) return false;
  }
  return true;
}

/* Initialize game */
createEmptyGrid();
fillWords();
fillRandomLetters();
