// Reliable image saving and a lightweight image preview for the local editor.
const titleLineSetting = document.createElement('div')
titleLineSetting.innerHTML = '<label>메인 제목 줄바꿈</label><textarea id="title-lines" placeholder="한 줄마다 원하는 제목 줄을 입력하세요."></textarea><p class="muted">빈칸 없이 한 줄씩 입력하면 그 위치에서만 줄바꿈됩니다.</p>'
document.querySelector('#hero').parentElement.append(titleLineSetting)
fetch('/api/content').then((response) => response.json()).then((content) => {
  document.querySelector('#title-lines').value = (content.site.titleLines || [content.site.title]).join('\n')
})

const originalSaveButton = [...document.querySelectorAll('button')].find((button) => button.textContent.includes('모든 변경사항'))
originalSaveButton?.addEventListener('click', async (event) => {
  event.stopImmediatePropagation()
  event.preventDefault()
  const cards = [...document.querySelectorAll('.card')]
  for (const card of cards) {
    const item = d[card.dataset.type][card.dataset.i]
    card.querySelectorAll('[data-k]').forEach((field) => { item[field.dataset.k] = field.value })
    if (item.links) item.links = item.links.split(',').map((value) => value.trim()).filter(Boolean)
    const file = card.querySelector('.img')?.files[0]
    if (file) {
      say('프로필 이미지 업로드 중…')
      const form = new FormData()
      form.append('image', file)
      const response = await fetch('/api/image', { method: 'POST', body: form })
      const uploaded = await response.json()
      if (!response.ok) return say(uploaded.error || '이미지 업로드에 실패했습니다.')
      item.image = uploaded.url
    }
  }
  d.site.title = $('title').value
  d.site.titleLines = $('title-lines').value.split('\n').filter(Boolean)
  d.site.heroLines = $('hero').value.split('\n').filter(Boolean)
  const response = await fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
  say(response.ok ? '저장됐습니다. 캐릭터사이트를 새로고침하세요.' : '저장에 실패했습니다.')
  if (response.ok) draw()
}, true)

const overlay = document.createElement('div')
overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:99;place-items:center;padding:30px;cursor:zoom-out'
overlay.innerHTML = '<img style="max-width:100%;max-height:100%;object-fit:contain">'
document.body.append(overlay)
overlay.addEventListener('click', () => { overlay.style.display = 'none' })
document.addEventListener('click', (event) => {
  if (event.target.matches('.card img')) {
    overlay.querySelector('img').src = event.target.src
    overlay.style.display = 'grid'
  }
})

// Soft delete: items stay in the local content file until they are restored.
document.addEventListener('click', (event) => {
  const button = event.target.closest('.danger')
  if (!button) return
  event.preventDefault()
  event.stopImmediatePropagation()
  const card = button.closest('.card')
  const type = card.dataset.type
  const index = Number(card.dataset.i)
  d.trash ||= []
  d.trash.push({ type, item: d[type][index], deletedAt: new Date().toISOString() })
  d[type].splice(index, 1)
  draw()
  renderTrash()
  say('휴지통으로 옮겼습니다. 저장하면 반영됩니다.')
}, true)

const trashSection = document.createElement('section')
trashSection.innerHTML = '<h2>휴지통</h2><p class="muted">삭제한 항목을 다시 복구할 수 있습니다.</p><div id="trash-list"></div>'
document.querySelector('.w').append(trashSection)

function renderTrash() {
  if (!d) return
  const list = document.querySelector('#trash-list')
  const items = d.trash || []
  list.innerHTML = items.length ? items.map((entry, index) => `<div class="card"><b>${entry.type}</b> · ${entry.item.title || entry.item.name || '제목 없음'}<br><button data-restore="${index}">복구</button></div>`).join('') : '<p class="muted">휴지통이 비어 있습니다.</p>'
}
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-restore]')
  if (!button) return
  const index = Number(button.dataset.restore)
  const entry = d.trash[index]
  d[entry.type].push(entry.item)
  d.trash.splice(index, 1)
  draw()
  renderTrash()
  say('복구했습니다. 저장하면 반영됩니다.')
})
const originalDraw = draw
draw = function () { originalDraw(); renderTrash() }
renderTrash()
