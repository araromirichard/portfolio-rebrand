// ── Configuration ─────────────────────────────────────────────────
// Update these two values after following SETUP.md

const SUPABASE_URL     = 'https://qdprxrhhobghdpyftbzu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcHJ4cmhob2JnaGRweWZ0Ynp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMTM0NjAsImV4cCI6MjEwNTU4OTQ2MH0.grMLW8-1LTgFFwm7NmZEYDApiw8UIbaiBXwh4O-NfLg'  // ← paste your anon key here
const API_BASE         = 'https://portfolio-rebrand.onrender.com'

// ── Init ──────────────────────────────────────────────────────────
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

let accessToken    = null
let projectsPage   = 1
let cachedStacks   = []
const PER_PAGE     = 6

// ── DOM refs ──────────────────────────────────────────────────────
const loginView  = document.getElementById('login-view')
const adminView  = document.getElementById('admin-view')
const loginForm  = document.getElementById('login-form')
const loginMsg   = document.getElementById('login-message')
const logoutBtn  = document.getElementById('logout-btn')

// ── Auth ──────────────────────────────────────────────────────────
async function init() {
  const { data: { session } } = await sb.auth.getSession()
  if (session) {
    accessToken = session.access_token
    showAdmin()
  } else {
    showLogin()
  }

  sb.auth.onAuthStateChange((_event, session) => {
    if (session) {
      accessToken = session.access_token
      showAdmin()
    } else {
      accessToken = null
      showLogin()
    }
  })
}

function showLogin() {
  loginView.classList.remove('hidden')
  adminView.classList.add('hidden')
}

function showAdmin() {
  loginView.classList.add('hidden')
  adminView.classList.remove('hidden')
  loadProjects()
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const email  = document.getElementById('login-email').value.trim()
  const btn    = document.getElementById('login-btn')
  btn.disabled = true
  loginMsg.textContent = 'Sending…'

  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + '/admin.html' },
  })

  loginMsg.textContent = error
    ? 'Error: ' + error.message
    : 'Magic link sent! Check your email.'
  btn.disabled = false
})

logoutBtn.addEventListener('click', () => sb.auth.signOut())

// ── API helper ────────────────────────────────────────────────────
async function api(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + accessToken,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  return res.status === 204 ? null : res.json()
}

// ── Tab navigation ────────────────────────────────────────────────
document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault()
    const tab = link.dataset.tab

    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'))
    link.classList.add('active')

    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'))
    document.getElementById(tab + '-tab').classList.remove('hidden')

    if (tab === 'projects') loadProjects()
    if (tab === 'stacks')   loadStacks()
  })
})

// ════════════════════════════════════════════════════
// PROJECTS
// ════════════════════════════════════════════════════
async function loadProjects(page = 1) {
  projectsPage = page
  const list = document.getElementById('projects-list')
  list.innerHTML = '<p class="loading">Loading…</p>'

  try {
    const { data, meta } = await api(`/api/projects?page=${page}&limit=${PER_PAGE}`)
    renderProjects(data, meta)
  } catch (err) {
    list.innerHTML = `<p class="error">${err.message}</p>`
  }
}

function renderProjects(projects, meta) {
  const list       = document.getElementById('projects-list')
  const pagination = document.getElementById('projects-pagination')

  if (!projects.length) {
    list.innerHTML = '<p class="empty">No projects yet — add your first one!</p>'
    pagination.innerHTML = ''
    return
  }

  list.innerHTML = projects.map(p => `
    <div class="data-card">
      ${p.image_url
        ? `<img src="${escHtml(p.image_url)}" alt="${escHtml(p.title)}" class="card-img" loading="lazy">`
        : '<div class="card-img-placeholder"><i class="ri-image-line"></i></div>'}
      <div class="card-body">
        <div class="card-meta">${escHtml(p.subtitle || 'Project')}</div>
        <h3 class="card-title">${escHtml(p.title)}</h3>
        <p class="card-desc">${escHtml(p.description || '')}</p>
        ${p.stacks?.length
          ? `<div class="card-tags">${p.stacks.map(s => `<span class="tag">${escHtml(s)}</span>`).join('')}</div>`
          : ''}
      </div>
      <div class="card-actions">
        <button class="btn btn-sm btn-outline" onclick="editProject('${p.id}')">
          <i class="ri-edit-line"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteProject('${p.id}', '${escHtml(p.title)}')">
          <i class="ri-delete-bin-line"></i>
        </button>
      </div>
    </div>
  `).join('')

  renderPagination(pagination, meta, loadProjects)
}

function renderPagination(container, meta, loadFn) {
  if (!meta || meta.totalPages <= 1) { container.innerHTML = ''; return }

  container.innerHTML = `
    <span class="pagination-info">Page ${meta.page} of ${meta.totalPages} &nbsp;·&nbsp; ${meta.total} total</span>
    <div class="pagination-buttons">
      ${meta.page > 1
        ? `<button class="btn btn-sm btn-outline" onclick="${loadFn.name}(${meta.page - 1})">← Prev</button>`
        : ''}
      ${meta.page < meta.totalPages
        ? `<button class="btn btn-sm btn-outline" onclick="${loadFn.name}(${meta.page + 1})">Next →</button>`
        : ''}
    </div>
  `
}

// Project modal
const projectModal = document.getElementById('project-modal')
const projectForm  = document.getElementById('project-form')

document.getElementById('add-project-btn').addEventListener('click', () => {
  document.getElementById('project-modal-title').textContent = 'Add Project'
  projectForm.reset()
  document.getElementById('project-id').value = ''
  projectModal.classList.remove('hidden')
})

function closeProjectModal() { projectModal.classList.add('hidden') }
document.getElementById('project-modal-close').addEventListener('click', closeProjectModal)
document.getElementById('project-cancel').addEventListener('click', closeProjectModal)
document.querySelector('#project-modal .modal-overlay').addEventListener('click', closeProjectModal)

async function editProject(id) {
  try {
    const p = await api(`/api/projects/${id}`)
    document.getElementById('project-modal-title').textContent = 'Edit Project'
    document.getElementById('project-id').value          = p.id
    document.getElementById('project-title').value       = p.title        || ''
    document.getElementById('project-subtitle').value    = p.subtitle     || ''
    document.getElementById('project-description').value = p.description  || ''
    document.getElementById('project-image').value       = p.image_url    || ''
    document.getElementById('project-live-url').value    = p.live_url     || ''
    document.getElementById('project-github-url').value  = p.github_url   || ''
    document.getElementById('project-stacks').value      = (p.stacks || []).join(', ')
    document.getElementById('project-featured').checked  = p.featured     || false
    document.getElementById('project-order').value       = p.order_index  ?? 0
    projectModal.classList.remove('hidden')
  } catch (err) {
    alert('Could not load project: ' + err.message)
  }
}

async function deleteProject(id, title) {
  if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
  try {
    await api(`/api/projects/${id}`, { method: 'DELETE' })
    loadProjects(projectsPage)
  } catch (err) {
    alert('Delete failed: ' + err.message)
  }
}

projectForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const id       = document.getElementById('project-id').value
  const rawStacks = document.getElementById('project-stacks').value

  const payload = {
    title:       document.getElementById('project-title').value.trim(),
    subtitle:    document.getElementById('project-subtitle').value.trim(),
    description: document.getElementById('project-description').value.trim(),
    image_url:   document.getElementById('project-image').value.trim(),
    live_url:    document.getElementById('project-live-url').value.trim(),
    github_url:  document.getElementById('project-github-url').value.trim(),
    stacks:      rawStacks.split(',').map(s => s.trim()).filter(Boolean),
    featured:    document.getElementById('project-featured').checked,
    order_index: parseInt(document.getElementById('project-order').value, 10) || 0,
  }

  try {
    if (id) {
      await api(`/api/projects/${id}`, { method: 'PUT',  body: JSON.stringify(payload) })
    } else {
      await api('/api/projects',        { method: 'POST', body: JSON.stringify(payload) })
    }
    closeProjectModal()
    loadProjects(projectsPage)
  } catch (err) {
    alert('Save failed: ' + err.message)
  }
})

// ════════════════════════════════════════════════════
// STACKS
// ════════════════════════════════════════════════════
async function loadStacks() {
  const list = document.getElementById('stacks-list')
  list.innerHTML = '<p class="loading">Loading…</p>'

  try {
    cachedStacks  = await api('/api/stacks')
    renderStacks(cachedStacks)
  } catch (err) {
    list.innerHTML = `<p class="error">${err.message}</p>`
  }
}

function renderStacks(stacks) {
  const list = document.getElementById('stacks-list')

  if (!stacks.length) {
    list.innerHTML = '<p class="empty">No stacks yet — add your technologies!</p>'
    return
  }

  list.innerHTML = stacks.map(s => `
    <div class="data-card stack-card">
      <div class="stack-icon">
        ${s.icon ? `<i class="${escHtml(s.icon)}"></i>` : '<i class="ri-code-line"></i>'}
      </div>
      <div class="card-body">
        <h3 class="card-title">${escHtml(s.name)}</h3>
        <span class="tag tag-category">${escHtml(s.category || 'other')}</span>
      </div>
      <div class="card-actions">
        <button class="btn btn-sm btn-outline" onclick="editStack('${s.id}')">
          <i class="ri-edit-line"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteStack('${s.id}', '${escHtml(s.name)}')">
          <i class="ri-delete-bin-line"></i>
        </button>
      </div>
    </div>
  `).join('')
}

// Stack modal
const stackModal = document.getElementById('stack-modal')
const stackForm  = document.getElementById('stack-form')

document.getElementById('add-stack-btn').addEventListener('click', () => {
  document.getElementById('stack-modal-title').textContent = 'Add Stack'
  stackForm.reset()
  document.getElementById('stack-id').value = ''
  stackModal.classList.remove('hidden')
})

function closeStackModal() { stackModal.classList.add('hidden') }
document.getElementById('stack-modal-close').addEventListener('click', closeStackModal)
document.getElementById('stack-cancel').addEventListener('click', closeStackModal)
document.querySelector('#stack-modal .modal-overlay').addEventListener('click', closeStackModal)

function editStack(id) {
  const s = cachedStacks.find(x => x.id === id)
  if (!s) return
  document.getElementById('stack-modal-title').textContent = 'Edit Stack'
  document.getElementById('stack-id').value       = s.id
  document.getElementById('stack-name').value     = s.name     || ''
  document.getElementById('stack-icon').value     = s.icon     || ''
  document.getElementById('stack-category').value = s.category || 'other'
  stackModal.classList.remove('hidden')
}

async function deleteStack(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
  try {
    await api(`/api/stacks/${id}`, { method: 'DELETE' })
    loadStacks()
  } catch (err) {
    alert('Delete failed: ' + err.message)
  }
}

stackForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const id = document.getElementById('stack-id').value

  const payload = {
    name:     document.getElementById('stack-name').value.trim(),
    icon:     document.getElementById('stack-icon').value.trim(),
    category: document.getElementById('stack-category').value,
  }

  try {
    if (id) {
      await api(`/api/stacks/${id}`, { method: 'PUT',  body: JSON.stringify(payload) })
    } else {
      await api('/api/stacks',        { method: 'POST', body: JSON.stringify(payload) })
    }
    closeStackModal()
    loadStacks()
  } catch (err) {
    alert('Save failed: ' + err.message)
  }
})

// ── Helpers ───────────────────────────────────────────────────────
function escHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]))
}

// ── Boot ──────────────────────────────────────────────────────────
init()
