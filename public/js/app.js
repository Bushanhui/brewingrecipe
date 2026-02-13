const recipeSelect = document.getElementById('recipe-select');
const recipeDesc = document.getElementById('recipe-description');
const ratioInput = document.getElementById('ratio-input');
const form = document.getElementById('coffee-form');
const resultsList = document.getElementById('results-list');
const formulaInfo = document.getElementById('formula-info');

let recipes = [];
let currentRecipe = null;

const stepEmojis = ['🌒', '🌓', '🌔', '🌕', '🌖', '🌗'];

function fmt(v) {
  return Number(v).toFixed(2);
}

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

function renderResults(totalWater, stepResults) {
  let html = `<li>🌝 Total : <span>${fmt(totalWater)} g</span></li>`;
  stepResults.forEach((step, i) => {
    const emoji = stepEmojis[i % stepEmojis.length];
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
    target_total_ratio: (v) => `Total의 ${v * 100}%까지 투입`,
    remainder: () => '나머지 전부',
  };

  let html = '<p><strong>📖 계산 로직</strong></p>';
  recipe.steps.forEach((step) => {
    const desc = methodDesc[step.amount_method];
    html += `<p>${step.name} = ${desc ? desc(step.amount_value) : step.amount_method}</p>`;
  });
  formulaInfo.innerHTML = html;
}

async function loadRecipes() {
  const res = await fetch('/api/recipes');
  recipes = await res.json();

  recipeSelect.innerHTML = '<option value="">-- 레시피를 선택하세요 --</option>';
  recipes.forEach((r) => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = `${r.name} (${r.author})`;
    recipeSelect.appendChild(opt);
  });
}

async function loadRecipeDetail(id) {
  const res = await fetch(`/api/recipes/${id}`);
  currentRecipe = await res.json();
  ratioInput.value = currentRecipe.default_ratio;
  recipeDesc.textContent = currentRecipe.description || '';
  renderFormula(currentRecipe);
}

recipeSelect.addEventListener('change', async () => {
  const id = recipeSelect.value;
  if (!id) {
    currentRecipe = null;
    recipeDesc.textContent = '';
    formulaInfo.innerHTML = '';
    resultsList.innerHTML = '';
    return;
  }
  await loadRecipeDetail(id);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!currentRecipe) {
    alert('레시피를 먼저 선택하세요.');
    return;
  }

  const beanWeight = parseFloat(document.getElementById('bean-input').value);
  const ratio = parseFloat(ratioInput.value);
  const { totalWater, results } = calculate(currentRecipe, beanWeight, ratio);
  renderResults(totalWater, results);
});

loadRecipes();
