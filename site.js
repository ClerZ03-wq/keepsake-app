const root = document.documentElement
const ACCENTS = ['pearl', 'sage', 'blush', 'lavender', 'sky', 'peach', 'mint', 'indigo']
const label = document.getElementById('scheme-label')

function titleCase(id) {
  return id.charAt(0).toUpperCase() + id.slice(1)
}

function paint(accent, theme, animate) {
  if (!ACCENTS.includes(accent)) accent = 'indigo'
  if (theme !== 'dark') theme = 'light'
  root.dataset.accent = accent
  root.dataset.theme = theme
  const paper = theme === 'dark' ? 'dark paper' : 'light paper'
  if (label) label.textContent = `${titleCase(accent)} cover, ${paper}`
  document.querySelectorAll('.swatch').forEach(btn => {
    btn.classList.toggle('on', btn.dataset.accent === accent)
  })
  document.querySelectorAll('.mode').forEach(btn => {
    btn.classList.toggle('on', btn.dataset.theme === theme)
  })
  try {
    localStorage.setItem('scraps-site-accent', accent)
    localStorage.setItem('scraps-site-theme', theme)
  } catch { /* ignore */ }
  if (!animate) return
  root.classList.remove('theme-shift')
  void root.offsetWidth
  root.classList.add('theme-shift')
}

document.querySelectorAll('.swatch').forEach(btn => {
  btn.addEventListener('click', () => paint(btn.dataset.accent, root.dataset.theme || 'light', true))
})
document.querySelectorAll('.mode').forEach(btn => {
  btn.addEventListener('click', () => paint(root.dataset.accent || 'indigo', btn.dataset.theme, true))
})

try {
  paint(localStorage.getItem('scraps-site-accent') || 'indigo', localStorage.getItem('scraps-site-theme') || 'light')
} catch {
  paint('indigo', 'light')
}

const petTitle = document.getElementById('pet-title')
const greet = document.getElementById('greet')
const snapTitle = document.getElementById('snap-title')
const snapCap = document.getElementById('snap-cap')
const snapLabel = document.getElementById('snap-label')
const questLine = document.getElementById('quest-line')
const questState = document.getElementById('quest-state')
const polaroid = document.getElementById('polaroid')
const wellPhoto = document.getElementById('well-photo')
const shutter = document.getElementById('shutter')
const boardName = document.getElementById('board-name')
const boardQuest = document.getElementById('board-quest')
const boardPet = document.getElementById('board-pet')
const miniShot = document.getElementById('mini-shot')

let current = { name: 'Iban', photo: 'assets/images/landing/dog-portrait.jpg', quest: "A close-up of Iban's paws" }

function showPet(btn) {
  current = { name: btn.dataset.pet, photo: btn.dataset.photo, quest: btn.dataset.quest }
  document.querySelectorAll('.avatars .pet').forEach(el => el.classList.toggle('on', el === btn))
  polaroid.classList.remove('snapped')
  if (petTitle) petTitle.textContent = `${current.name}.`
  if (greet) greet.textContent = 'Still waiting,'
  if (snapTitle) snapTitle.textContent = `Snap ${current.name} today`
  if (snapCap) snapCap.textContent = "waiting for today's snap…"
  if (snapLabel) snapLabel.textContent = 'Quick Snap'
  if (questLine) questLine.textContent = current.quest
  if (questState) questState.textContent = 'Active'
  if (boardName) boardName.textContent = `${current.name}.`
  if (boardQuest) boardQuest.textContent = current.quest
  if (boardPet) boardPet.textContent = current.name
  if (miniShot) miniShot.style.backgroundImage = ''
}

document.querySelectorAll('.avatars .pet[data-pet]').forEach(btn => {
  btn.addEventListener('click', () => showPet(btn))
})

document.getElementById('add-pet')?.addEventListener('click', () => {
  const btn = document.getElementById('add-pet')
  if (!btn.dataset.pet) {
    btn.dataset.pet = 'Miso'
    btn.dataset.photo = 'assets/images/landing/cat-window.jpg'
    btn.dataset.quest = 'Snap Miso at the window'
    btn.innerHTML = '<div class="pet-face"><img src="assets/images/landing/cat-window.jpg" alt=""></div>Miso'
  }
  showPet(btn)
})

document.getElementById('gear')?.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
  paint(root.dataset.accent || 'indigo', next, true)
})

document.getElementById('snap-btn')?.addEventListener('click', () => {
  if (!shutter || !polaroid || !wellPhoto) return
  shutter.classList.remove('go')
  void shutter.offsetWidth
  shutter.classList.add('go')
  wellPhoto.src = current.photo
  polaroid.classList.add('snapped')
  if (greet) greet.textContent = 'Good evening,'
  if (snapCap) snapCap.textContent = "today's scrap"
  if (snapLabel) snapLabel.textContent = 'Add another snap'
  if (questState) questState.textContent = 'Done'
  if (miniShot) miniShot.style.backgroundImage = `url('${current.photo}')`
})

const ROOM_ORDER = ['today', 'archive', 'pets', 'profile']
const ROOM_LABELS = { today: 'Today', archive: 'Archive', pets: 'Pets', profile: 'Profile' }
const roomScroll = document.getElementById('rooms')
let roomLock = 0

function openRoom(id) {
  document.querySelectorAll('#rooms-list .room').forEach(btn => {
    btn.classList.toggle('on', btn.dataset.room === id)
  })
  document.querySelectorAll('.room-meter i').forEach(dot => {
    dot.classList.toggle('on', dot.dataset.room === id)
  })
  const now = document.getElementById('room-now')
  if (now) now.textContent = ROOM_LABELS[id] || id
  document.querySelectorAll('.panel').forEach(panel => {
    const on = panel.dataset.panel === id
    panel.classList.toggle('on', on)
    if (on) {
      panel.style.animation = 'none'
      void panel.offsetWidth
      panel.style.animation = ''
    }
  })
}

function scrollToRoom(id) {
  if (!roomScroll) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    openRoom(id)
    return
  }
  const index = Math.max(0, ROOM_ORDER.indexOf(id))
  const start = roomScroll.offsetTop
  const span = roomScroll.offsetHeight - window.innerHeight
  const y = start + ((index + 0.12) / ROOM_ORDER.length) * span
  roomLock = performance.now() + 900
  openRoom(id)
  window.scrollTo({ top: y, behavior: 'smooth' })
}

document.querySelectorAll('#rooms-list .room').forEach(btn => {
  btn.addEventListener('click', () => scrollToRoom(btn.dataset.room))
})

function syncRoomFromScroll() {
  if (!roomScroll) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (performance.now() < roomLock) return
  const span = roomScroll.offsetHeight - window.innerHeight
  if (span <= 0) return
  const y = window.scrollY - roomScroll.offsetTop
  if (y < 0 || y > span) return
  const id = ROOM_ORDER[Math.min(ROOM_ORDER.length - 1, Math.floor((y / span) * ROOM_ORDER.length))]
  const current = document.querySelector('#rooms-list .room.on')
  if (current && current.dataset.room === id) return
  openRoom(id)
}

window.addEventListener('scroll', syncRoomFromScroll, { passive: true })

document.querySelectorAll('.tabs .tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs .tab').forEach(tab => tab.classList.toggle('on', tab === btn))
    openRoom(btn.dataset.tab)
  })
})

const FRAME_NOTES = {
  Classic: 'the usual white border',
  Warm: 'for the late light',
  Cool: 'window days',
  Garden: 'when they were outside',
}

function say(el, text) {
  if (!el) return
  el.textContent = text
  el.classList.remove('tick')
  void el.offsetWidth
  el.classList.add('tick')
}

document.querySelectorAll('#frames .frame').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#frames .frame').forEach(frame => frame.classList.toggle('on', frame === btn))
    say(document.getElementById('frame-note'), FRAME_NOTES[btn.dataset.frame] || btn.dataset.frame)
  })
})

document.querySelectorAll('.scrap').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.scrap').forEach(el => el.classList.toggle('on', el === btn))
    say(document.getElementById('scrap-line'), btn.dataset.line)
  })
})

document.querySelectorAll('.day.shot').forEach(day => {
  day.addEventListener('click', () => {
    document.querySelectorAll('.day.shot').forEach(el => el.classList.toggle('picked', el === day))
    say(document.getElementById('day-note'), day.dataset.note)
  })
})

const reveal = document.querySelectorAll('.reveal')
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in')
        io.unobserve(entry.target)
      }
    })
  }, { threshold: 0.25 })
  reveal.forEach(el => io.observe(el))
} else {
  reveal.forEach(el => el.classList.add('in'))
}
