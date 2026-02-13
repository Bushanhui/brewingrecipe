// ─── Fallback Recipe Data (API 없이도 동작) ───
const FALLBACK_RECIPES = [
  {
    id: 'default',
    name: '휘뚜루마뚜루 레시피',
    author: '기본',
    description: '기존 계산기 공식. Bloom 후 나머지를 3등분하여 투입',
    default_ratio: 16,
    steps: [
      { step_order: 1, name: 'Bloom', type: 'bloom', amount_method: 'multiply_bean', amount_value: 3.0 },
      { step_order: 2, name: 'First Pour', type: 'pour', amount_method: 'ratio_of_remaining', amount_value: 0.3333 },
      { step_order: 3, name: 'Second Pour', type: 'pour', amount_method: 'ratio_of_remaining', amount_value: 0.5 },
      { step_order: 4, name: 'Third Pour', type: 'pour', amount_method: 'remainder', amount_value: null },
    ],
  },
  {
    id: 'hoffmann-v60',
    name: 'James Hoffmann V60',
    author: 'James Hoffmann',
    description: 'The Ultimate V60 Technique. Bloom 후 60%까지 투입, 나머지 투입',
    default_ratio: 15,
    steps: [
      { step_order: 1, name: 'Bloom', type: 'bloom', amount_method: 'multiply_bean', amount_value: 2.0 },
      { step_order: 2, name: 'First Pour (to 60%)', type: 'pour', amount_method: 'target_total_ratio', amount_value: 0.6 },
      { step_order: 3, name: 'Second Pour (to 100%)', type: 'pour', amount_method: 'remainder', amount_value: null },
    ],
  },
  {
    id: 'kasuya-46',
    name: 'Tetsu Kasuya 4:6',
    author: 'Tetsu Kasuya',
    description: '4:6 메서드. 총 물량을 5회에 걸쳐 균등 투입. 처음 40%로 맛, 나머지 60%로 농도 조절',
    default_ratio: 15,
    steps: [
      { step_order: 1, name: '1st Pour (Bloom)', type: 'bloom', amount_method: 'ratio_of_total', amount_value: 0.2 },
      { step_order: 2, name: '2nd Pour', type: 'pour', amount_method: 'ratio_of_total', amount_value: 0.2 },
      { step_order: 3, name: '3rd Pour', type: 'pour', amount_method: 'ratio_of_total', amount_value: 0.2 },
      { step_order: 4, name: '4th Pour', type: 'pour', amount_method: 'ratio_of_total', amount_value: 0.2 },
      { step_order: 5, name: '5th Pour', type: 'pour', amount_method: 'remainder', amount_value: null },
    ],
  },
  {
    id: 'rao-v60',
    name: 'Scott Rao V60',
    author: 'Scott Rao',
    description: 'Bloom 후 한 번에 나머지 전량 투입하는 원푸어 방식',
    default_ratio: 16,
    steps: [
      { step_order: 1, name: 'Bloom', type: 'bloom', amount_method: 'multiply_bean', amount_value: 3.0 },
      { step_order: 2, name: 'Main Pour', type: 'pour', amount_method: 'remainder', amount_value: null },
    ],
  },
];

// ─── DOM Elements ───
const recipeSelect = document.getElementById('recipe-select');
const recipeDesc = document.getElementById('recipe-description');
const ratioInput = document.getElementById('ratio-input');
const form = document.getElementById('coffee-form');
const resultsList = document.getElementById('results-list');
const formulaInfo = document.getElementById('formula-info');

let recipesCache = [];
let currentRecipe = null;

const STEP_EMOJIS = ['🌒', '🌓', '🌔', '🌕', '🌖', '🌗'];

// ─── Calculation Engine ───
function calculate(recipe, beanWeight, ratio) {
  const totalWater = beanWeight * ratio;
  let usedWater = 0;
  const results = [];

  for (const step of recipe.steps) {
    let amount;
    switch (step.amount_method) {
      case 'multiply_bean':
        amount = beanWeight * step.amount_value;
        break;
      case 'ratio_of_total':
        amount = totalWater * step.amount_value;
        break;
      case 'ratio_of_remaining':
        amount = (totalWater - usedWater) * step.amount_value;
        break;
      case 'target_total_ratio':
        amount = totalWater * step.amount_value - usedWater;
        break;
      case 'remainder':
        amount = totalWater - usedWater;
        break;
      default:
        amount = 0;
    }
    amount = Math.round(amount * 100) / 100;
    usedWater += amount;
    results.push({ name: step.name, amount });
  }

  return { totalWater, results };
}

// ─── Rendering ───
function fmt(v) {
  return Number(v).toFixed(2);
}

function renderResults(totalWater, stepResults) {
  let html = `<li>🌝 Total : <span>${fmt(totalWater)} g</span></li>`;
  stepResults.forEach((step, i) => {
    const emoji = STEP_EMOJIS[i % STEP_EMOJIS.length];
    html += `<li>${emoji} ${step.name} : <span>${fmt(step.amount)} g</span></li>`;
  });
  resultsList.innerHTML = html;
}

function renderFormula(recipe) {
  if (!recipe || !recipe.steps) {
    formulaInfo.innerHTML = '';
    return;
  }

  const methodDesc = {
    multiply_bean: (v) => `원두량 × ${v}`,
    ratio_of_total: (v) => `Total × ${v}`,
    ratio_of_remaining: (v) => `남은 물 × ${parseFloat(v).toFixed(4)}`,
    target_total_ratio: (v) => `Total의 ${(v * 100).toFixed(0)}%까지 투입`,
    remainder: () => '나머지 전부',
  };

  let html = '<p><strong>📖 계산 로직</strong></p>';
  recipe.steps.forEach((step) => {
    const fn = methodDesc[step.amount_method];
    html += `<p>${step.name} = ${fn ? fn(step.amount_value) : step.amount_method}</p>`;
  });
  formulaInfo.innerHTML = html;
}

function populateDropdown(recipes) {
  recipeSelect.innerHTML = '<option value="">-- 레시피를 선택하세요 --</option>';
  recipes.forEach((r) => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = `${r.name} (${r.author})`;
    recipeSelect.appendChild(opt);
  });
}

// ─── Data Loading (API → Fallback) ───
async function fetchRecipes() {
  try {
    const res = await fetch('/api/recipes');
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch {
    console.log('API unavailable, using fallback recipes');
    return FALLBACK_RECIPES;
  }
}

async function fetchRecipeDetail(id) {
  try {
    const res = await fetch(`/api/recipes/${id}`);
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch {
    return FALLBACK_RECIPES.find((r) => r.id === id) || null;
  }
}

// ─── Event Handlers ───
recipeSelect.addEventListener('change', async () => {
  const id = recipeSelect.value;
  if (!id) {
    currentRecipe = null;
    recipeDesc.textContent = '';
    formulaInfo.innerHTML = '';
    resultsList.innerHTML = '';
    return;
  }

  currentRecipe = await fetchRecipeDetail(id);
  if (currentRecipe) {
    ratioInput.value = currentRecipe.default_ratio;
    recipeDesc.textContent = currentRecipe.description || '';
    renderFormula(currentRecipe);
  }
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!currentRecipe) {
    alert('레시피를 먼저 선택하세요.');
    return;
  }

  const beanWeight = parseFloat(document.getElementById('bean-input').value);
  const ratio = parseFloat(ratioInput.value);

  if (isNaN(beanWeight) || beanWeight <= 0) {
    alert('원두량을 입력하세요.');
    return;
  }
  if (isNaN(ratio) || ratio <= 0) {
    alert('비율을 입력하세요.');
    return;
  }

  const { totalWater, results } = calculate(currentRecipe, beanWeight, ratio);
  renderResults(totalWater, results);
});

// ─── Init ───
(async () => {
  recipesCache = await fetchRecipes();
  populateDropdown(recipesCache);
})();
