/* MANSPICK — Quiz & Recommendation Engine */
(() => {
  // ── Data ──
  const packages = {
    one:    { name: 'ONE',     price: 85000,  original: 120000 },
    hybrid: { name: 'HYBRID',  price: 160000, original: 210000 },
    allday: { name: 'ALL DAY', price: 500000, original: 890000 },
  };

  const addonPrices = {
    'hair':           70000,
    'clothes-rental': 25000,
    'clothes-brand':  50000,
    'dslr':           120000,
    'ai':             70000,
    'shopping':       100000,
    'lecture':        50000,
  };

  // Quiz answer → addon mapping
  const quizAddonMap = {
    hair:     ['hair'],
    clothes:  ['clothes-rental', 'clothes-brand'],
    dslr:     ['dslr'],
    ai:       ['ai'],
    shopping: ['shopping'],
    lecture:  ['lecture'],
  };

  // ── State ──
  let currentStep = 1;
  const answers = {};
  const selectedAddons = new Set();
  let selectedPkg = 'hybrid';

  // ── DOM ──
  const steps = document.querySelectorAll('.quiz-step');
  const progressBar = document.getElementById('progress-bar');
  const stepCurrent = document.getElementById('step-current');
  const quizContainer = document.getElementById('quiz-container');
  const resultContainer = document.getElementById('result-container');
  const priceBar = document.getElementById('price-bar');
  const totalPriceEl = document.getElementById('total-price');
  const resultPkgName = document.getElementById('result-package-name');

  // ── Quiz navigation ──
  function showStep(n) {
    currentStep = n;
    stepCurrent.textContent = n;
    progressBar.style.width = (n * 20) + '%';
    steps.forEach(s => {
      const isActive = +s.dataset.step === n;
      s.classList.toggle('hidden', !isActive);
      if (isActive) {
        s.style.opacity = '0';
        s.style.transform = 'translateY(1rem)';
        requestAnimationFrame(() => {
          s.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          s.style.opacity = '1';
          s.style.transform = 'translateY(0)';
        });
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Option click (single select steps 3-4) ──
  document.querySelectorAll('.quiz-option:not(.multi)').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const value = btn.dataset.value;
      answers[key] = value;

      // Visual feedback
      const siblings = btn.parentElement.querySelectorAll('.quiz-option');
      siblings.forEach(s => s.classList.remove('selected'));
      btn.classList.add('selected');

      // Auto-advance after brief delay
      setTimeout(() => showStep(currentStep + 1), 300);
    });
  });

  // ── Multi-select (steps 1, 2, 5) ──
  document.querySelectorAll('.quiz-option.multi').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('selected');
      // Enable/disable "next" button for steps 1 & 2
      const step = btn.closest('.quiz-step');
      const nextBtn = step?.querySelector('.step-next');
      if (nextBtn) {
        const hasSelection = step.querySelectorAll('.quiz-option.multi.selected').length > 0;
        nextBtn.disabled = !hasSelection;
        nextBtn.classList.toggle('opacity-30', !hasSelection);
        nextBtn.classList.toggle('pointer-events-none', !hasSelection);
        nextBtn.classList.toggle('bg-accent-500', hasSelection);
        nextBtn.classList.toggle('text-white', hasSelection);
        nextBtn.classList.toggle('bg-white/5', !hasSelection);
        nextBtn.classList.toggle('text-zinc-400', !hasSelection);
      }
    });
  });

  // ── Step next buttons (steps 1 & 2) ──
  document.querySelectorAll('.step-next').forEach(btn => {
    btn.addEventListener('click', () => {
      const step = btn.closest('.quiz-step');
      const stepNum = +step.dataset.step;
      const key = stepNum === 1 ? 'purpose' : 'concern';
      const selected = [];
      step.querySelectorAll('.quiz-option.multi.selected').forEach(opt => {
        selected.push(opt.dataset.value);
      });
      answers[key] = selected;
      showStep(stepNum + 1);
    });
  });

  // ── Submit quiz ──
  document.getElementById('quiz-submit').addEventListener('click', () => {
    // Collect multi-select
    const multiSelected = [];
    document.querySelectorAll('#addon-options .quiz-option.multi.selected').forEach(btn => {
      multiSelected.push(btn.dataset.value);
    });
    answers.addons = multiSelected;
    calculateAndShow();
  });

  // ── Scoring ──
  function calculateAndShow() {
    const scores = { one: 0, hybrid: 0, allday: 0 };

    // Step 1: Purpose (multi-select)
    const purposes = Array.isArray(answers.purpose) ? answers.purpose : [answers.purpose];
    purposes.forEach(p => {
      switch (p) {
        case 'dating':   scores.hybrid += 2; break;
        case 'sns':      scores.hybrid += 2; scores.allday += 1; break;
        case 'business': scores.one += 2; scores.hybrid += 1; break;
        case 'special':  scores.hybrid += 1; scores.allday += 2; break;
      }
    });

    // Step 2: Concern (multi-select)
    const concerns = Array.isArray(answers.concern) ? answers.concern : [answers.concern];
    concerns.forEach(c => {
      switch (c) {
        case 'styling':  scores.hybrid += 1; scores.allday += 1; break;
        case 'pose':     scores.one += 1; scores.hybrid += 1; break;
        case 'grooming': scores.allday += 2; break;
        case 'total':    scores.allday += 3; break;
      }
    });

    // Step 3: Scale (strong weight)
    switch (answers.scale) {
      case 'light':  scores.one += 5; break;
      case 'medium': scores.hybrid += 5; break;
      case 'full':   scores.allday += 5; break;
    }

    // Step 4: Budget
    switch (answers.budget) {
      case 'low':     scores.one += 3; break;
      case 'mid':     scores.hybrid += 3; break;
      case 'high':    scores.hybrid += 1; scores.allday += 2; break;
      case 'premium': scores.allday += 3; break;
    }

    // Determine winner
    let best = 'hybrid';
    let bestScore = -1;
    for (const [key, val] of Object.entries(scores)) {
      if (val > bestScore) { bestScore = val; best = key; }
    }

    selectedPkg = best;

    // Recommended addons from step 5
    selectedAddons.clear();
    if (answers.addons) {
      answers.addons.forEach(a => {
        const mapped = quizAddonMap[a];
        if (mapped) mapped.forEach(id => selectedAddons.add(id));
      });
    }

    showResult();
  }

  // ── Show result ──
  function showResult() {
    quizContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    resultContainer.style.opacity = '0';
    resultContainer.style.transform = 'translateY(1rem)';
    requestAnimationFrame(() => {
      resultContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      resultContainer.style.opacity = '1';
      resultContainer.style.transform = 'translateY(0)';
    });

    resultPkgName.textContent = packages[selectedPkg].name;

    // Highlight package selector
    updatePkgSelector();

    // Set addon toggles
    updateAddonToggles();

    // Show price bar
    priceBar.classList.remove('hidden');
    requestAnimationFrame(() => {
      priceBar.classList.remove('translate-y-full');
      priceBar.classList.add('translate-y-0');
    });

    updateTotal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Package selector ──
  function updatePkgSelector() {
    document.querySelectorAll('.pkg-select').forEach(btn => {
      const isPicked = btn.dataset.pkg === selectedPkg;
      btn.classList.toggle('border-accent-500', isPicked);
      btn.classList.toggle('bg-accent-500/10', isPicked);
      btn.classList.toggle('border-white/5', !isPicked);
      btn.classList.toggle('bg-white/[0.02]', !isPicked);
    });
  }

  document.querySelectorAll('.pkg-select').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedPkg = btn.dataset.pkg;
      resultPkgName.textContent = packages[selectedPkg].name;
      updatePkgSelector();
      updateTotal();
    });
  });

  // ── Addon toggles ──
  function updateAddonToggles() {
    document.querySelectorAll('.addon-toggle').forEach(label => {
      const id = label.dataset.addon;
      const isOn = selectedAddons.has(id);
      setAddonVisual(label, isOn);
    });
  }

  function setAddonVisual(label, on) {
    const check = label.querySelector('.addon-check');
    const icon = check.querySelector('iconify-icon');
    if (on) {
      label.classList.add('border-accent-500/40', 'bg-accent-500/5');
      label.classList.remove('border-white/5', 'bg-white/[0.02]');
      check.classList.add('border-accent-500', 'bg-accent-500');
      check.classList.remove('border-white/10');
      icon.style.opacity = '1';
    } else {
      label.classList.remove('border-accent-500/40', 'bg-accent-500/5');
      label.classList.add('border-white/5', 'bg-white/[0.02]');
      check.classList.remove('border-accent-500', 'bg-accent-500');
      check.classList.add('border-white/10');
      icon.style.opacity = '0';
    }
  }

  document.querySelectorAll('.addon-toggle').forEach(label => {
    label.addEventListener('click', () => {
      const id = label.dataset.addon;
      if (selectedAddons.has(id)) {
        selectedAddons.delete(id);
        setAddonVisual(label, false);
      } else {
        selectedAddons.add(id);
        setAddonVisual(label, true);
      }
      updateTotal();
    });
  });

  // ── Price calculation ──
  function updateTotal() {
    let total = packages[selectedPkg].price;
    selectedAddons.forEach(id => { total += addonPrices[id] || 0; });
    totalPriceEl.textContent = total.toLocaleString('ko-KR');
  }

  // ── Direct package select via URL param ──
  (() => {
    const params = new URLSearchParams(window.location.search);
    const pkg = params.get('pkg');
    if (pkg && packages[pkg]) {
      selectedPkg = pkg;
      showResult();
    }
  })();

  // ── Retry ──
  document.getElementById('retry-quiz').addEventListener('click', () => {
    resultContainer.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    priceBar.classList.add('translate-y-full');
    priceBar.classList.remove('translate-y-0');
    selectedAddons.clear();

    // Reset visuals
    document.querySelectorAll('.quiz-option').forEach(btn => btn.classList.remove('selected'));
    showStep(1);
  });
})();
