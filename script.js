const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// Mobile nav toggle
(() => {
  const btn = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const icon = document.getElementById('mobile-menu-icon');
  if (!btn || !menu) return;
  const close = () => {
    menu.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', '메뉴 열기');
    if (icon) icon.setAttribute('icon', 'solar:hamburger-menu-linear');
  };
  const open = () => {
    menu.classList.remove('hidden');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', '메뉴 닫기');
    if (icon) icon.setAttribute('icon', 'solar:close-circle-linear');
  };
  btn.addEventListener('click', () => {
    if (menu.classList.contains('hidden')) open();
    else close();
  });
  menu.querySelectorAll('.mobile-nav-link').forEach((a) => {
    a.addEventListener('click', close);
  });
  // Close if resized above lg
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) close();
  });
})();

// WHY self-check chips → scroll to lead-magnet, persist concern
(() => {
  const chips = document.querySelectorAll('.selfcheck-chip');
  const result = document.getElementById('selfcheck-result');
  if (!chips.length) return;
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const concern = chip.dataset.selfcheck || '';
      chips.forEach((c) => c.classList.remove('bg-accent-500/20', 'border-accent-400', 'text-white'));
      chip.classList.add('bg-accent-500/20', 'border-accent-400', 'text-white');
      if (result) {
        result.classList.remove('hidden');
        result.classList.add('flex');
      }
      try { sessionStorage.setItem('manspick-concern', concern); } catch (e) {}
      setTimeout(() => {
        const target = document.getElementById('lead-magnet');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 600);
    });
  });
})();

// WHY section — radar chart (expert analysis)
(() => {
  const canvas = document.getElementById('analysisChart');
  if (!canvas || typeof Chart === 'undefined') return;
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['앵글·구도', '포즈·자세', '표정·시선', '의상·스타일링', '조명·색감', '보정 완성도'],
      datasets: [
        {
          label: '현재 상태',
          data: [62, 58, 68, 60, 52, 48],
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderColor: 'rgba(180,180,180,0.6)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(180,180,180,0.9)',
          pointBorderColor: '#0a0a0a',
          pointRadius: 3,
        },
        {
          label: '맨즈픽 디렉팅 후',
          data: [94, 90, 95, 92, 97, 90],
          backgroundColor: 'rgba(45,118,246,0.22)',
          borderColor: '#2d76f6',
          borderWidth: 3,
          pointBackgroundColor: '#2d76f6',
          pointBorderColor: '#ffffff',
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      elements: { line: { tension: 0.3 } },
      scales: {
        r: {
          suggestedMin: 0,
          suggestedMax: 100,
          angleLines: { color: 'rgba(255,255,255,0.08)' },
          grid: { color: 'rgba(255,255,255,0.08)' },
          pointLabels: {
            color: '#e5e5e5',
            font: { family: "'Pretendard', sans-serif", size: 12, weight: '500' },
          },
          ticks: { display: false, backdropColor: 'transparent' },
        },
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#ffffff',
            font: { family: "'Pretendard', sans-serif", size: 13 },
            padding: 18,
            boxWidth: 14,
            boxHeight: 14,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(10,10,10,0.9)',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleColor: '#fff',
          bodyColor: '#e5e5e5',
          padding: 12,
        },
      },
    },
  });
})();

// Month-end countdown timer
(() => {
  const d = document.getElementById('cd-days');
  const h = document.getElementById('cd-hours');
  const m = document.getElementById('cd-mins');
  const s = document.getElementById('cd-secs');
  if (!d || !h || !m || !s) return;
  const pad = (n) => String(n).padStart(2, '0');
  const tick = () => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
    let diff = Math.max(0, end - now);
    const days = Math.floor(diff / 86400000); diff -= days * 86400000;
    const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
    const mins = Math.floor(diff / 60000); diff -= mins * 60000;
    const secs = Math.floor(diff / 1000);
    d.textContent = pad(days);
    h.textContent = pad(hours);
    m.textContent = pad(mins);
    s.textContent = pad(secs);
  };
  tick();
  setInterval(tick, 1000);
})();

// Live slot counter — urgency scarcity feature
(() => {
  const packages = {
    one: { total: 14, remaining: 6, label: 'ONE' },
    hybrid: { total: 10, remaining: 3, label: 'HYBRID' },
    allday: { total: 6, remaining: 2, label: 'ALL DAY' },
  };
  const toast = document.getElementById('slot-toast');
  const toastText = document.getElementById('slot-toast-text');
  const render = (animate = false) => {
    document.querySelectorAll('.slot-info').forEach((el) => {
      const key = el.dataset.package;
      const p = packages[key];
      if (!p) return;
      const remEl = el.querySelector('.slot-remaining');
      const totalEl = el.querySelector('.slot-total');
      const bar = el.querySelector('.slot-bar');
      const urgent = el.querySelector('.slot-urgent');
      if (remEl) remEl.textContent = p.remaining;
      if (totalEl) totalEl.textContent = p.total;
      const pct = Math.max(0, (p.remaining / p.total) * 100);
      if (bar) bar.style.width = `${pct}%`;
      if (p.remaining <= 3) {
        bar?.classList.remove('bg-accent-500');
        bar?.classList.add('bg-red-500');
        remEl?.classList.remove('text-accent-400');
        remEl?.classList.add('text-red-400');
        if (urgent) {
          urgent.classList.remove('hidden');
          urgent.classList.add('flex');
        }
      }
      if (animate && remEl) {
        remEl.classList.add('scale-125');
        setTimeout(() => remEl.classList.remove('scale-125'), 400);
      }
    });
  };
  render();

  const showToast = (msg) => {
    if (!toast || !toastText) return;
    toastText.textContent = msg;
    toast.classList.remove('opacity-0', 'translate-y-2');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
    }, 3800);
  };

  // Decrement a random package every 22-55s
  const tick = () => {
    const eligible = Object.keys(packages).filter((k) => packages[k].remaining > 1);
    if (eligible.length) {
      const k = eligible[Math.floor(Math.random() * eligible.length)];
      packages[k].remaining -= 1;
      render(true);
      showToast(`방금 ${packages[k].label} 패키지 1석이 마감되었어요`);
    }
    setTimeout(tick, 22000 + Math.random() * 33000);
  };
  setTimeout(tick, 15000 + Math.random() * 10000);

  // Lead-magnet scarcity
  (() => {
    const remEl = document.getElementById('lead-remaining');
    const remBarText = document.getElementById('lead-remaining-bar-text');
    const bar = document.getElementById('lead-bar');
    const recent = document.getElementById('lead-recent');
    if (!remEl || !bar) return;
    let remaining = 23;
    const total = 100;
    const names = ['김○○', '이○○', '박○○', '최○○', '정○○', '강○○', '조○○', '윤○○', '장○○', '임○○'];
    const mins = [1, 2, 3, 4, 5, 7, 8, 12, 15];
    const rotateRecent = () => {
      if (!recent) return;
      const name = names[Math.floor(Math.random() * names.length)];
      const mago = mins[Math.floor(Math.random() * mins.length)];
      recent.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0"></span><span>${mago}분 전 ${name}님이 방금 신청했어요</span>`;
      recent.classList.add('opacity-0');
      setTimeout(() => recent.classList.remove('opacity-0'), 120);
    };
    const render = () => {
      remEl.textContent = remaining;
      if (remBarText) remBarText.textContent = remaining;
      bar.style.width = `${(remaining / total) * 100}%`;
    };
    render();
    const tick = () => {
      if (remaining > 1) {
        remaining -= 1;
        render();
        rotateRecent();
      }
      setTimeout(tick, 28000 + Math.random() * 40000);
    };
    setTimeout(tick, 18000 + Math.random() * 14000);
    setInterval(rotateRecent, 12000 + Math.random() * 6000);

    // Phone number auto-format: 010-1234-5678
    const phoneEl = document.getElementById('lead-phone');
    if (phoneEl) {
      const format = (v) => {
        const d = v.replace(/\D/g, '').slice(0, 11);
        if (d.length < 4) return d;
        if (d.length < 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
        if (d.length < 11) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
        return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
      };
      phoneEl.addEventListener('input', (e) => {
        const el = e.target;
        const before = el.value;
        const caretEnd = el.selectionEnd === before.length;
        const formatted = format(before);
        if (formatted !== before) {
          el.value = formatted;
          if (caretEnd) el.setSelectionRange(formatted.length, formatted.length);
        }
      });
    }
  })();

  // Live viewers — fluctuate every 4-8s
  const viewerEl = document.getElementById('live-viewers');
  if (viewerEl) {
    let viewers = 23;
    const tickViewers = () => {
      const delta = Math.floor(Math.random() * 7) - 3; // -3..+3
      viewers = Math.max(12, Math.min(47, viewers + delta));
      viewerEl.textContent = viewers;
      setTimeout(tickViewers, 4000 + Math.random() * 4000);
    };
    setTimeout(tickViewers, 4000);
  }
})();

// Sticky bottom CTA + live viewers badge — show after hero, hide over lead-magnet/footer
(() => {
  const bar = document.getElementById('sticky-cta');
  const viewers = document.getElementById('live-viewers-badge');
  if (!bar && !viewers) return;
  const leadMagnet = document.getElementById('lead-magnet');
  const setState = (el, visible) => {
    if (!el) return;
    if (visible) el.classList.remove('opacity-0', 'translate-y-2', 'translate-y-4', 'pointer-events-none');
    else el.classList.add('opacity-0', 'pointer-events-none');
  };
  const onScroll = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const pastHero = y > vh * 0.7;
    let overFinal = false;
    if (leadMagnet) {
      const r = leadMagnet.getBoundingClientRect();
      overFinal = r.top < vh * 0.85;
    }
    const show = pastHero && !overFinal;
    if (show) {
      bar?.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
      viewers?.classList.remove('opacity-0', 'translate-y-2', 'pointer-events-none');
    } else {
      bar?.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
      viewers?.classList.add('opacity-0', 'translate-y-2', 'pointer-events-none');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Count-up animation
const animateCount = (el) => {
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const separator = el.dataset.separator === 'true';
  const duration = 1800;
  const startTime = performance.now();
  const format = (val) => {
    const fixed = val.toFixed(decimals);
    if (!separator) return fixed;
    const [intPart, decPart] = fixed.split('.');
    const withComma = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decPart ? `${withComma}.${decPart}` : withComma;
  };
  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = format(target * eased);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = format(target);
  };
  requestAnimationFrame(tick);
};
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.count-up').forEach((el) => countObserver.observe(el));

// Portrait tile wall + cursor push-away (disabled — using static side portraits)
(() => {
  const grid = document.getElementById('portrait-grid');
  if (!grid) return;
  const POOL = Array.from({ length: 12 }, (_, i) => `images/스타일링 포트폴리오 ${i + 1}.png`);
  const getTileW = () => {
    const w = window.innerWidth;
    if (w >= 1024) return 288; // lg w-72
    if (w >= 768) return 256;  // md w-64
    return 208;                // w-52
  };
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const build = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tileW = getTileW();
    const tileH = tileW * 1.25;
    const colStep = tileW * 0.78;
    const cols = Math.ceil(vw / colStep) + 1;
    const rowStep = tileH * 0.68;
    const rows = Math.ceil((vh + tileH) / rowStep) + 1;
    grid.innerHTML = '';
    const bag = shuffle(POOL);
    const rand = (a, b) => a + Math.random() * (b - a);
    let k = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const zig = (r % 2) * (colStep * 0.5);
        const x = c * colStep + zig - tileW * 0.35 + rand(-colStep * 0.1, colStep * 0.1);
        const y = r * rowStep - tileH * 0.3 + rand(-rowStep * 0.12, rowStep * 0.12);
        const rot = rand(-12, 12);
        const img = document.createElement('img');
        img.src = bag[k % bag.length];
        img.alt = '';
        img.className = 'portrait-tile absolute object-cover rounded-2xl shadow-2xl';
        img.style.left = `${x}px`;
        img.style.top = `${y}px`;
        img.style.width = `${tileW * 1.02}px`;
        img.style.height = `${tileH * 1.02}px`;
        img.style.opacity = '0.3';
        img.style.setProperty('--rot', `${rot}deg`);
        img.style.transform = `rotate(${rot}deg)`;
        img.style.zIndex = String(k);
        grid.appendChild(img);
        k++;
      }
    }
  };
  build();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 200);
  });

  let rafId = null;
  let mx = -9999, my = -9999;
  const RADIUS = 280;
  const FORCE = 160;
  const apply = () => {
    rafId = null;
    const tiles = grid.querySelectorAll('.portrait-tile');
    tiles.forEach((tile) => {
      const rot = tile.style.getPropertyValue('--rot') || '0deg';
      const r = tile.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < RADIUS) {
        const t = 1 - dist / RADIUS;
        const push = t * FORCE;
        const ang = Math.atan2(dy, dx);
        tile.style.transform = `translate(${-Math.cos(ang) * push}px, ${-Math.sin(ang) * push}px) rotate(${rot})`;
      } else {
        tile.style.transform = `rotate(${rot})`;
      }
    });
  };
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!rafId) rafId = requestAnimationFrame(apply);
  });
  window.addEventListener('mouseleave', () => {
    mx = -9999; my = -9999;
    if (!rafId) rafId = requestAnimationFrame(apply);
  });
})();

// Team gallery modal
const teamData = {
  influencer: {
    eyebrow: 'Fashion',
    title: '인플루언서팀',
    prefix: 'team-influencer',
  },
  retouch: {
    eyebrow: 'Retouching',
    title: '보정팀',
    prefix: 'team-retouch',
  },
  hair: {
    eyebrow: 'Hair & Design',
    title: '헤어/패션디자이너팀',
    prefix: 'team-hair',
  },
};
const teamModal = document.getElementById('team-modal');
const teamModalGrid = document.getElementById('team-modal-grid');
const teamModalEyebrow = document.getElementById('team-modal-eyebrow');
const teamModalTitle = document.getElementById('team-modal-title');
const teamModalClose = document.getElementById('team-modal-close');
const teamModalBackdrop = teamModal?.querySelector('.team-modal-backdrop');

const pickRandom = (arr, n) => {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
};
const openTeamModal = (key) => {
  const data = teamData[key];
  if (!data) return;
  teamModalEyebrow.textContent = data.eyebrow;
  teamModalTitle.textContent = data.title;
  let sources;
  if (key === 'retouch') {
    const pool = Array.from({ length: 12 }, (_, i) => `images/스타일링 포트폴리오 ${i + 1}.png`);
    sources = pickRandom(pool, 9);
  } else {
    sources = Array.from({ length: 9 }, (_, i) => `images/${data.prefix}-${i + 1}.jpg`);
  }
  teamModalGrid.innerHTML = sources.map((src, i) =>
    `<div class="relative aspect-square overflow-hidden bg-zinc-900">
      <img src="${src}" alt="${data.title} 작업물 ${i + 1}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" decoding="async" onerror="this.style.opacity=0.15;this.src='https://placehold.co/400x400/18181b/52525b?text=%E2%97%8B';">
    </div>`
  ).join('');
  teamModal.classList.remove('hidden');
  teamModal.classList.add('flex');
  teamModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};
const closeTeamModal = () => {
  teamModal.classList.add('hidden');
  teamModal.classList.remove('flex');
  teamModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};
document.querySelectorAll('.team-card').forEach((card) => {
  card.addEventListener('click', () => openTeamModal(card.dataset.team));
});
teamModalClose?.addEventListener('click', closeTeamModal);
teamModalBackdrop?.addEventListener('click', closeTeamModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !teamModal.classList.contains('hidden')) closeTeamModal();
});

document.querySelectorAll('.ba-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const after = btn.querySelector('.ba-img-after');
    const tag = btn.querySelector('.ba-tag-toggle');
    const showing = after.classList.toggle('opacity-100');
    after.classList.toggle('opacity-0', !showing);
    if (tag) {
      tag.textContent = showing ? 'AFTER' : 'BEFORE';
      tag.classList.toggle('after', showing);
    }
  });
});
