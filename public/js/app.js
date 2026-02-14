// ─── Fallback Recipe Data (API 없이도 동작) ───
const FALLBACK_RECIPES = [
  {
    id: 'default',
    name: '휘뚜루마뚜루 레시피',
    author: '기본',
    description: '기존 계산기 공식. Bloom 후 나머지를 3등분하여 투입',
    default_ratio: 16,
    dripper: 'v60',
    steps: [
      { step_order: 1, name: 'Bloom', type: 'bloom', amount_method: 'multiply_bean', amount_value: 3.0, wait_seconds: null, description: null },
      { step_order: 2, name: 'First Pour', type: 'pour', amount_method: 'ratio_of_remaining', amount_value: 0.3333, wait_seconds: null, description: null },
      { step_order: 3, name: 'Second Pour', type: 'pour', amount_method: 'ratio_of_remaining', amount_value: 0.5, wait_seconds: null, description: null },
      { step_order: 4, name: 'Third Pour', type: 'pour', amount_method: 'remainder', amount_value: null, wait_seconds: null, description: null },
    ],
  },
  {
    id: 'yong-chae',
    name: '용채 V60',
    author: '용채',
    description: 'V60 드리퍼를 활용한 균형 잡힌 추출 레시피',
    default_ratio: 16,
    dripper: 'v60',
    steps: [
      { step_order: 1, name: 'Bloom', type: 'bloom', amount_method: 'multiply_bean', amount_value: 2.0, wait_seconds: null, description: null },
      { step_order: 2, name: 'First Pour (to 60%)', type: 'pour', amount_method: 'target_total_ratio', amount_value: 0.6, wait_seconds: null, description: null },
      { step_order: 3, name: 'Second Pour (to 100%)', type: 'pour', amount_method: 'remainder', amount_value: null, wait_seconds: null, description: null },
    ],
  },
  {
    id: 'identity-hot',
    name: 'Identity Hot',
    author: 'Identity Coffee Lab',
    description: 'Origami 드리퍼를 사용한 깔끔한 추출',
    default_ratio: 15,
    dripper: 'origami',
    steps: [
      { step_order: 1, name: 'Bloom', type: 'bloom', amount_method: 'multiply_bean', amount_value: 2.0, wait_seconds: null, description: null },
      { step_order: 2, name: 'Main Pour (to 60%)', type: 'pour', amount_method: 'target_total_ratio', amount_value: 0.6, wait_seconds: null, description: null },
      { step_order: 3, name: 'Final Pour (to 100%)', type: 'pour', amount_method: 'remainder', amount_value: null, wait_seconds: null, description: null },
    ],
  },
  {
    id: 'bean-brothers',
    name: 'Bean Brothers Medium',
    author: 'Bean Brothers',
    description: 'V60으로 중배전 원두에 최적화된 레시피',
    default_ratio: 16,
    dripper: 'v60',
    steps: [
      { step_order: 1, name: 'Bloom', type: 'bloom', amount_method: 'multiply_bean', amount_value: 2.5, wait_seconds: null, description: null },
      { step_order: 2, name: 'First Pour', type: 'pour', amount_method: 'ratio_of_total', amount_value: 0.4, wait_seconds: null, description: null },
      { step_order: 3, name: 'Second Pour', type: 'pour', amount_method: 'ratio_of_total', amount_value: 0.3, wait_seconds: null, description: null },
      { step_order: 4, name: 'Final Pour', type: 'pour', amount_method: 'remainder', amount_value: null, wait_seconds: null, description: null },
    ],
  },
  {
    id: 'kasuya-switch',
    name: 'Tetsu Kasuya Switch',
    author: 'Tetsu Kasuya',
    description: 'Switch (침지식) 드리퍼를 활용한 4:6 변형 레시피',
    default_ratio: 15,
    dripper: 'switch',
    steps: [
      { step_order: 1, name: '1st Pour (Bloom)', type: 'bloom', amount_method: 'ratio_of_total', amount_value: 0.2, wait_seconds: null, description: null },
      { step_order: 2, name: '2nd Pour', type: 'pour', amount_method: 'ratio_of_total', amount_value: 0.2, wait_seconds: null, description: null },
      { step_order: 3, name: '3rd Pour', type: 'pour', amount_method: 'ratio_of_total', amount_value: 0.2, wait_seconds: null, description: null },
      { step_order: 4, name: '4th Pour', type: 'pour', amount_method: 'ratio_of_total', amount_value: 0.2, wait_seconds: null, description: null },
      { step_order: 5, name: '5th Pour', type: 'pour', amount_method: 'remainder', amount_value: null, wait_seconds: null, description: null },
    ],
  },
];

// ─── Dripper → Recipe mapping ───
const DRIPPER_RECIPES = {
  v60: ['default', 'yong-chae', 'bean-brothers'],
  origami: ['identity-hot'],
  switch: ['kasuya-switch'],
};

// ─── DOM Elements ───
const recipeSelect = document.getElementById('recipe-select');
const recipeDesc = document.getElementById('recipe-description');
const ratioInput = document.getElementById('ratio-input');
const form = document.getElementById('coffee-form');
const brewRoadmap = document.getElementById('brew-roadmap');
const timelineContainer = document.getElementById('timeline-container');
const formulaContent = document.getElementById('formula-content');
const formulaSteps = document.getElementById('formula-steps');
const darkToggle = document.getElementById('dark-toggle');

let recipesCache = [];
let currentRecipe = null;
let activeDripper = 'v60';

// ─── Calculation Engine (preserved) ───
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
    results.push({ name: step.name, amount, type: step.type });
  }

  return { totalWater, results };
}

// ─── Formatting ───
function fmt(v) {
  return Number(v).toFixed(1);
}

// ─── Timeline Rendering ───
function renderTimeline(totalWater, results) {
  const stepIcons = {
    bloom: 'water_drop',
    pour: 'coffee',
  };

  let cumulative = 0;
  let html = '';

  // Total water header
  html += `
    <div class="flex items-center gap-3 mb-4 pb-3 border-b border-accent/20">
      <div class="w-10 h-10 rounded-full bg-primary/10 dark:bg-secondary/20 flex items-center justify-center">
        <span class="material-symbols-outlined text-primary dark:text-mocha text-lg">water_drop</span>
      </div>
      <div>
        <p class="text-xs text-gray-500 dark:text-gray-400">Total Water</p>
        <p class="text-xl font-bold text-primary dark:text-mocha">${fmt(totalWater)} g</p>
      </div>
    </div>
  `;

  // Steps
  results.forEach((step, i) => {
    cumulative += step.amount;
    const pct = Math.round((cumulative / totalWater) * 100);
    const icon = stepIcons[step.type] || 'coffee';
    const isLast = i === results.length - 1;

    html += `
      <div class="step-line ${isLast ? '' : ''}">
        <div class="step-dot"></div>
        <div class="pb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-sm text-secondary dark:text-mocha">${icon}</span>
              <span class="text-sm font-medium">${step.name}</span>
            </div>
            <span class="text-sm font-bold text-primary dark:text-mocha">${fmt(step.amount)} g</span>
          </div>
          <div class="mt-1.5 flex items-center gap-2">
            <div class="flex-1 h-1.5 bg-accent/20 dark:bg-white/10 rounded-full overflow-hidden">
              <div class="h-full bg-secondary dark:bg-mocha rounded-full transition-all duration-500" style="width: ${pct}%"></div>
            </div>
            <span class="text-xs text-gray-400 w-8 text-right">${pct}%</span>
          </div>
        </div>
      </div>
    `;
  });

  timelineContainer.innerHTML = html;
  brewRoadmap.classList.remove('hidden');
}

// ─── Formula Rendering ───
function renderFormula(recipe) {
  if (!recipe || !recipe.steps) {
    formulaContent.classList.add('hidden');
    return;
  }

  const methodDesc = {
    multiply_bean: (v) => `Bean x ${v}`,
    ratio_of_total: (v) => `Total x ${v}`,
    ratio_of_remaining: (v) => `Remaining x ${parseFloat(v).toFixed(4)}`,
    target_total_ratio: (v) => `To ${(v * 100).toFixed(0)}% of total`,
    remainder: () => 'All remaining',
  };

  let html = '';
  recipe.steps.forEach((step) => {
    const fn = methodDesc[step.amount_method];
    html += `<p><span class="text-secondary dark:text-mocha font-medium">${step.name}</span> = ${fn ? fn(step.amount_value) : step.amount_method}</p>`;
  });

  formulaSteps.innerHTML = html;
  formulaContent.classList.remove('hidden');
}

// ─── Dripper Tab Switching ───
function setActiveDripper(dripper) {
  activeDripper = dripper;

  // Update tab styles
  document.querySelectorAll('#dripper-tabs .dripper-tab').forEach((tab) => {
    if (tab.dataset.dripper === dripper) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Filter dropdown
  populateDropdown(recipesCache);

  // Reset selection
  currentRecipe = null;
  recipeDesc.textContent = '';
  formulaContent.classList.add('hidden');
  brewRoadmap.classList.add('hidden');
}

// ─── Dropdown Population (with dripper filter) ───
function populateDropdown(recipes) {
  const allowedIds = DRIPPER_RECIPES[activeDripper] || [];
  const filtered = recipes.filter((r) => allowedIds.includes(r.id));

  recipeSelect.innerHTML = '<option value="">-- Select a recipe --</option>';
  filtered.forEach((r) => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = `${r.name} (${r.author})`;
    recipeSelect.appendChild(opt);
  });
}

// ─── Dark Mode ───
function initDarkMode() {
  const saved = localStorage.getItem('darkMode');
  if (saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    updateDarkIcon(true);
  }
}

function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', isDark);
  updateDarkIcon(isDark);
}

function updateDarkIcon(isDark) {
  const darkIcon = darkToggle.querySelector('.dark-icon');
  const lightIcon = darkToggle.querySelector('.light-icon');
  if (isDark) {
    darkIcon.classList.add('hidden');
    lightIcon.classList.remove('hidden');
  } else {
    darkIcon.classList.remove('hidden');
    lightIcon.classList.add('hidden');
  }
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
document.querySelectorAll('#dripper-tabs .dripper-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    setActiveDripper(tab.dataset.dripper);
  });
});

darkToggle.addEventListener('click', toggleDarkMode);

recipeSelect.addEventListener('change', async () => {
  const id = recipeSelect.value;
  if (!id) {
    currentRecipe = null;
    recipeDesc.textContent = '';
    formulaContent.classList.add('hidden');
    brewRoadmap.classList.add('hidden');
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
  renderTimeline(totalWater, results);
});

// ─── Init ───
(async () => {
  initDarkMode();
  recipesCache = await fetchRecipes();
  populateDropdown(recipesCache);
})();
