// Reliable image saving and a lightweight image preview for the local editor.
const titleLineSetting = document.createElement('div')
titleLineSetting.innerHTML = '<label>메인 제목 줄바꿈</label><textarea id="title-lines" placeholder="한 줄마다 원하는 제목 줄을 입력하세요."></textarea><p class="muted">빈칸 없이 한 줄씩 입력하면 그 위치에서만 줄바꿈됩니다.</p>'
document.querySelector('#hero').parentElement.append(titleLineSetting)

const siteImageSetting = document.createElement('div')
siteImageSetting.innerHTML = '<h3>메인 대표 이미지</h3><label>메인에 무작위로 표시할 이미지들</label><input id="hero-image" type="file" accept="image/*" multiple><button type="button" id="add-hero-images">선택한 이미지 추가</button><div id="hero-preview" class="site-image-preview-list"></div><p class="muted">여러 장을 한 번에 추가할 수 있습니다. 아래 목록의 제거 버튼으로 등록된 이미지를 관리할 수 있습니다.</p>'
document.querySelector('#hero').parentElement.append(siteImageSetting)

const siteLinksSetting = document.createElement('div')
siteLinksSetting.className = 'site-links-setting'
siteLinksSetting.innerHTML = '<h3>메인 링크 버튼</h3><p class="muted">메인 제목 아래에 표시할 정사각형 링크입니다. 버튼을 누르면 새 탭으로 열립니다.</p><button type="button" id="add-site-link">링크 버튼 추가</button><div id="site-links-list"></div>'
document.querySelector('#hero').parentElement.append(siteLinksSetting)

const siteImageStyle = document.createElement('style')
siteImageStyle.textContent = '.site-image-preview-list{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 16px}.hero-image-item{width:110px}.site-image-preview-list img{display:block;width:110px;height:120px;object-fit:contain;background:#292834;border:1px solid #565260}.site-image-preview-list button{width:100%;margin:4px 0 0;padding:6px;background:#7b4654;color:#fff}'
document.head.append(siteImageStyle)

const siteLinksStyle = document.createElement('style')
siteLinksStyle.textContent = '.gallery-card-summary{display:flex;width:100%;align-items:center;justify-content:space-between;gap:12px;margin:0;padding:6px 0;background:transparent;color:#d8d5c6;text-align:left}.gallery-card-summary span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gallery-card-summary b{color:#ea497e;font-size:13px;font-weight:400;white-space:nowrap}.gallery-card-collapsed{padding:10px 14px}.gallery-card-collapsed>:not(.gallery-card-summary){display:none}.entry-editor-card-hidden{display:none}.entry-editor-pager{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0}.entry-editor-pager button{margin:0;padding:7px 11px;background:#292834;color:#d8d5c6;border:1px solid #565260}.entry-editor-pager button.active{color:#ea497e;border-color:#ea497e}.site-links-setting{margin-top:26px}.site-link-card{display:grid;grid-template-columns:1fr 1.4fr 1fr 130px auto;gap:8px;align-items:center;margin:10px 0;padding:10px;border:1px solid #565260;background:#292834}.site-link-card input{margin:0}.site-link-logo{display:flex;gap:6px;align-items:center;font-size:11px}.site-link-logo input{max-width:90px}.site-link-logo img{width:30px;height:30px;object-fit:contain;background:#22212a}.site-link-controls{display:flex;gap:4px}.site-link-controls button{margin:0;padding:7px 9px}.site-link-card .site-link-remove{background:#7b4654;color:#fff}@media(max-width:700px){.site-link-card{grid-template-columns:1fr}.site-link-controls{display:grid;grid-template-columns:1fr 1fr 1fr}.site-link-card .site-link-remove{width:100%}}'
document.head.append(siteLinksStyle)

const escapeLinkText = (value = '') => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
let siteLinksDirty = false
document.querySelector('#site-links-list').addEventListener('input', () => { siteLinksDirty = true })
document.querySelector('#site-links-list').addEventListener('change', () => { siteLinksDirty = true })

function collectSiteLinks() {
  if (!d) return
  const previous = d.site.links || []
  d.site.links = [...document.querySelectorAll('[data-site-link]')].map((card) => {
    const index = Number(card.dataset.siteLink)
    return {
      id: card.dataset.siteLinkId || previous[index]?.id || crypto.randomUUID(),
      label: card.querySelector('[data-link-key="label"]').value.trim(),
      url: card.querySelector('[data-link-key="url"]').value.trim(),
      description: card.querySelector('[data-link-key="description"]').value.trim(),
      logoImage: previous[index]?.logoImage || '',
    }
  }).filter((link) => link.label && link.url)
}

function renderSiteLinks() {
  if (!d) return
  d.site.links ||= []
  document.querySelector('#site-links-list').innerHTML = d.site.links.map((link, index) => `<div class="site-link-card" data-site-link="${index}" data-site-link-id="${link.id}"><input data-link-key="label" value="${escapeLinkText(link.label)}" placeholder="버튼 이름"><input data-link-key="url" value="${escapeLinkText(link.url)}" placeholder="https://..."><input data-link-key="description" value="${escapeLinkText(link.description)}" placeholder="짧은 설명 (선택)"><label class="site-link-logo">로고<input class="site-link-logo-file" type="file" accept="image/*">${link.logoImage ? `<img src="${link.logoImage}" alt="현재 로고">` : ''}</label><div class="site-link-controls"><button type="button" data-move-site-link="${index}" data-direction="-1" ${index === 0 ? 'disabled' : ''}>↑</button><button type="button" data-move-site-link="${index}" data-direction="1" ${index === d.site.links.length - 1 ? 'disabled' : ''}>↓</button><button type="button" class="site-link-remove" data-remove-site-link="${index}">삭제</button></div></div>`).join('')
}

document.querySelector('#add-site-link').addEventListener('click', () => {
  siteLinksDirty = true
  collectSiteLinks()
  d.site.links.push({ id: crypto.randomUUID(), label: '', url: '', description: '' })
  renderSiteLinks()
})

async function saveSiteLinkLogos() {
  for (const card of document.querySelectorAll('[data-site-link]')) {
    const file = card.querySelector('.site-link-logo-file')?.files[0]
    if (!file) continue
    const form = new FormData()
    form.append('image', file)
    const response = await fetch('/api/image', { method: 'POST', body: form })
    const uploaded = await response.json()
    if (!response.ok) throw new Error(uploaded.error || '링크 로고 이미지 업로드에 실패했습니다.')
    const link = d.site.links.find((item) => item.id === card.dataset.siteLinkId)
    if (link) link.logoImage = uploaded.url
  }
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove-site-link]')
  if (!button) return
  siteLinksDirty = true
  collectSiteLinks()
  d.site.links.splice(Number(button.dataset.removeSiteLink), 1)
  renderSiteLinks()
})

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-move-site-link]')
  if (!button) return
  siteLinksDirty = true
  collectSiteLinks()
  const index = Number(button.dataset.moveSiteLink)
  const nextIndex = index + Number(button.dataset.direction)
  if (nextIndex < 0 || nextIndex >= d.site.links.length) return
  ;[d.site.links[index], d.site.links[nextIndex]] = [d.site.links[nextIndex], d.site.links[index]]
  renderSiteLinks()
})

for (const [inputId, previewId] of [['hero-image', 'hero-preview']]) {
  document.querySelector(`#${inputId}`).addEventListener('change', (event) => {
    const preview = document.querySelector(`#${previewId}`)
    preview.innerHTML = [...event.target.files].map((file) => `<div class="hero-image-item"><img src="${URL.createObjectURL(file)}" alt="선택한 이미지"></div>`).join('')
  })
}

fetch('/api/content').then((response) => response.json()).then((content) => {
  document.querySelector('#title-lines').value = (content.site.titleLines || [content.site.title]).join('\n')
  renderHeroImages(content.site)
})

async function uploadSiteImages(inputId) {
  const files = [...document.querySelector(`#${inputId}`).files]
  const uploadedImages = []
  for (const file of files) {
    const form = new FormData()
    form.append('image', file)
    const response = await fetch('/api/image', { method: 'POST', body: form })
    const uploaded = await response.json()
    if (!response.ok) throw new Error(uploaded.error || '이미지 업로드에 실패했습니다.')
    uploadedImages.push(uploaded.url)
  }
  return uploadedImages
}

function heroImageList(site) {
  return site.heroImages?.length ? site.heroImages : site.heroImage ? [site.heroImage] : []
}

function renderHeroImages(site = d?.site) {
  if (!site) return
  document.querySelector('#hero-preview').innerHTML = heroImageList(site).map((url, index) => `<div class="hero-image-item"><img src="${url}" alt="등록된 메인 이미지"><button type="button" data-remove-hero-image="${index}">제거</button></div>`).join('')
}

async function saveHeroImages() {
  const response = await fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
  if (!response.ok) throw new Error('이미지 목록을 저장하지 못했습니다.')
}

document.querySelector('#add-hero-images').addEventListener('click', async () => {
  try {
    const images = await uploadSiteImages('hero-image')
    if (!images.length) return say('추가할 이미지를 먼저 선택해 주세요.')
    d.site.heroImages ||= d.site.heroImage ? [d.site.heroImage] : []
    d.site.heroImages.push(...images)
    delete d.site.heroImage
    await saveHeroImages()
    document.querySelector('#hero-image').value = ''
    renderHeroImages()
    say(`${images.length}장의 메인 이미지를 추가했습니다.`)
  } catch (error) {
    say(error.message)
  }
})

document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-remove-hero-image]')
  if (!button) return
  const index = Number(button.dataset.removeHeroImage)
  d.site.heroImages ||= d.site.heroImage ? [d.site.heroImage] : []
  delete d.site.heroImage
  d.site.heroImages.splice(index, 1)
  try {
    await saveHeroImages()
    renderHeroImages()
    say('메인 이미지를 목록에서 제거했습니다.')
  } catch (error) {
    say(error.message)
  }
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
    if (card.dataset.type === 'gallery' || card.dataset.type === 'stories') item.tags = String(item.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean)
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
    const logoFile = card.querySelector('.profile-logo-file')?.files[0]
    if (logoFile) {
      const form = new FormData()
      form.append('image', logoFile)
      const response = await fetch('/api/image', { method: 'POST', body: form })
      const uploaded = await response.json()
      if (!response.ok) return say(uploaded.error || '로고 이미지 업로드에 실패했습니다.')
      item.logoImage = uploaded.url
    }
    const coverFile = card.querySelector('.story-cover-file')?.files[0]
    if (coverFile) {
      const form = new FormData()
      form.append('image', coverFile)
      const response = await fetch('/api/image', { method: 'POST', body: form })
      const uploaded = await response.json()
      if (!response.ok) return say(uploaded.error || '표지 이미지 업로드에 실패했습니다.')
      item.coverImage = uploaded.url
    }
  }
  d.site.title = $('title').value
  d.site.titleLines = $('title-lines').value.split('\n').filter(Boolean)
  d.site.heroLines = $('hero').value.split('\n').filter(Boolean)
  let savedLinks = d.site.links || []
  try {
    const latest = await fetch('/api/content')
    if (latest.ok) savedLinks = (await latest.json()).site.links || []
  } catch {}
  if (siteLinksDirty) {
    collectSiteLinks()
    await saveSiteLinkLogos()
  } else {
    d.site.links = savedLinks
  }
  const response = await fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
  say(response.ok ? '저장됐습니다. 캐릭터사이트를 새로고침하세요.' : '저장에 실패했습니다.')
  if (response.ok) { siteLinksDirty = false; draw() }
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
const profileLogoStyle = document.createElement('style')
profileLogoStyle.textContent = '.profile-logo-setting{clear:both;padding-top:10px}.profile-logo-setting img{display:block;float:none;width:150px;height:72px;object-fit:contain;object-position:left center;margin:6px 0;background:#292834;border:1px solid #565260}.profile-preview-setting{clear:both;display:grid;grid-template-columns:minmax(0,1fr) 118px;gap:14px;padding-top:14px}.profile-preview-controls label{display:block;margin-top:7px}.profile-preview-controls input[type="range"]{max-width:250px;padding:0}.profile-preview-editor-frame{width:118px;height:118px;overflow:hidden;background:#292834;border:1px solid #565260}.profile-preview-editor-image{display:block;width:100%;height:100%;object-fit:cover}@media(max-width:520px){.profile-preview-setting{grid-template-columns:1fr}.profile-preview-editor-frame{width:118px;height:118px}}'
document.head.append(profileLogoStyle)

function renderProfileLogoInputs() {
  if (!d) return
  document.querySelectorAll('.card[data-type="profiles"]').forEach((card) => {
    if (card.querySelector('.profile-logo-setting')) return
    const profile = d.profiles[Number(card.dataset.i)]
    const setting = document.createElement('div')
    setting.className = 'profile-logo-setting'
    setting.innerHTML = `<label>상세 설명 로고 이미지</label><input class="profile-logo-file" type="file" accept="image/*">${profile.logoImage ? `<img src="${profile.logoImage}" alt="현재 로고 이미지">` : ''}`
    const input = setting.querySelector('.profile-logo-file')
    input.addEventListener('change', () => {
      const file = input.files[0]
      if (!file) return
      let preview = setting.querySelector('img')
      if (!preview) { preview = document.createElement('img'); setting.append(preview) }
      preview.src = URL.createObjectURL(file)
      preview.alt = '선택한 로고 이미지'
    })
    card.append(setting)
  })
}

function renderProfilePreviewInputs() {
  if (!d) return
  document.querySelectorAll('.card[data-type="profiles"]').forEach((card) => {
    if (card.querySelector('.profile-preview-setting')) return
    const profile = d.profiles[Number(card.dataset.i)]
    const setting = document.createElement('div')
    setting.className = 'profile-preview-setting'
    setting.innerHTML = `<div class="profile-preview-controls"><label>메인 미리보기 짧은 소개</label><input data-k="previewText" value="${escapeLinkText(profile.previewText || '')}" placeholder="메인에 표시할 짧은 소개 (비워두면 기존 짧은 소개 사용)"><label>미리보기 이미지 위치 — 가로</label><input data-k="previewCropX" type="range" min="0" max="100" value="${profile.previewCropX ?? 50}"><label>미리보기 이미지 위치 — 세로</label><input data-k="previewCropY" type="range" min="0" max="100" value="${profile.previewCropY ?? 30}"><label>미리보기 이미지 확대</label><input data-k="previewCropScale" type="range" min="1" max="2" step="0.05" value="${profile.previewCropScale ?? 1}"></div>${profile.image ? `<div class="profile-preview-editor-frame"><img class="profile-preview-editor-image" src="${profile.image}" alt="메인 미리보기" style="object-position:${profile.previewCropX ?? 50}% ${profile.previewCropY ?? 30}%;transform:scale(${profile.previewCropScale ?? 1});transform-origin:${profile.previewCropX ?? 50}% ${profile.previewCropY ?? 30}%"></div>` : '<p class="muted">캐릭터 이미지를 등록하면 이곳에서 미리보기 위치를 조정할 수 있습니다.</p>'}`
    const refreshPreview = () => {
      const image = setting.querySelector('.profile-preview-editor-image')
      if (image) { const position = `${setting.querySelector('[data-k="previewCropX"]').value}% ${setting.querySelector('[data-k="previewCropY"]').value}%`; image.style.objectPosition = position; image.style.transformOrigin = position; image.style.transform = `scale(${setting.querySelector('[data-k="previewCropScale"]').value})` }
    }
    setting.querySelectorAll('input[type="range"]').forEach((input) => input.addEventListener('input', refreshPreview))
    card.append(setting)
  })
}

function renderGalleryTagInputs() {
  if (!d) return
  document.querySelectorAll('.card[data-type="gallery"]').forEach((card) => {
    if (card.querySelector('.gallery-tag-setting')) return
    const item = d.gallery[Number(card.dataset.i)]
    const setting = document.createElement('div')
    setting.className = 'gallery-tag-setting'
    setting.innerHTML = `<label>갤러리 태그</label><input data-k="tags" value="${(Array.isArray(item.tags) ? item.tags : String(item.tags || '').split(',')).filter(Boolean).join(', ')}" placeholder="예: 마리, 단독, 여행">`
    card.querySelector('.danger').before(setting)
  })
}

function renderGalleryCardCollapses() {
  if (!d) return
  document.querySelectorAll('.card[data-type="gallery"]').forEach((card) => {
    if (card.querySelector('.gallery-card-summary')) return
    const item = d.gallery[Number(card.dataset.i)]
    const summary = document.createElement('button')
    summary.type = 'button'
    summary.className = 'gallery-card-summary'
    summary.innerHTML = `<span>${escapeLinkText(item.title || '제목 없는 이미지')}</span><b>수정 펼치기 ↓</b>`
    summary.addEventListener('click', () => {
      const isCollapsed = card.classList.toggle('gallery-card-collapsed')
      summary.querySelector('b').textContent = isCollapsed ? '수정 펼치기 ↓' : '수정 접기 ↑'
    })
    card.prepend(summary)
    card.classList.add('gallery-card-collapsed')
  })
}

let entryEditorPage = 0
function renderEntryPagination() {
  if (!d) return
  const cards = [...document.querySelectorAll('.card[data-type="entries"]')]
  const pageSize = 5
  const pageCount = Math.max(1, Math.ceil(cards.length / pageSize))
  entryEditorPage = Math.min(entryEditorPage, pageCount - 1)
  cards.forEach((card, index) => card.classList.toggle('entry-editor-card-hidden', Math.floor(index / pageSize) !== entryEditorPage))
  let pager = document.querySelector('#entry-editor-pager')
  if (!pager) {
    pager = document.createElement('nav')
    pager.id = 'entry-editor-pager'
    pager.className = 'entry-editor-pager'
    document.querySelector('#entries').before(pager)
  }
  pager.innerHTML = Array.from({ length: pageCount }, (_, index) => `<button type="button" class="${index === entryEditorPage ? 'active' : ''}" data-entry-editor-page="${index}">${index + 1}</button>`).join('')
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-entry-editor-page]')
  if (!button) return
  entryEditorPage = Number(button.dataset.entryEditorPage)
  renderEntryPagination()
})

const storiesSection = document.createElement('section')
storiesSection.innerHTML = '<h2>이야기</h2><p class="muted">짧은 소설, 독백, 기록을 추가할 수 있습니다.</p><button type="button" id="add-story">이야기 추가</button><div id="stories-list"></div>'
document.querySelector('.w').append(storiesSection)

const escapeStoryText = (value = '') => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function renderStories() {
  if (!d) return
  d.stories ||= []
  document.querySelector('#stories-list').innerHTML = d.stories.map((story, index) => `<div class="card" data-type="stories" data-i="${index}">${story.coverImage ? `<img src="${story.coverImage}" alt="표지 이미지">` : ''}<input data-k="title" value="${escapeStoryText(story.title)}" placeholder="이야기 제목"><input data-k="summary" value="${escapeStoryText(story.summary)}" placeholder="짧은 소개"><input data-k="tags" value="${escapeStoryText((Array.isArray(story.tags) ? story.tags : []).join(', '))}" placeholder="태그: 마리, 여행"><textarea data-k="body" placeholder="이야기 본문">${escapeStoryText(story.body)}</textarea><label>표지 이미지 (선택)</label><input class="story-cover-file" type="file" accept="image/*"><button onclick="removeItem('stories',${index})" class="danger">삭제</button></div>`).join('')
}

document.querySelector('#add-story').addEventListener('click', () => {
  d.stories ||= []
  d.stories.push({ id: crypto.randomUUID(), title: '', summary: '', body: '', tags: [], coverImage: '' })
  draw()
})

const originalDraw = draw
draw = function () { originalDraw(); renderTrash(); renderHeroImages(); renderSiteLinks(); renderProfileLogoInputs(); renderProfilePreviewInputs(); renderGalleryTagInputs(); renderGalleryCardCollapses(); renderEntryPagination(); renderStories() }
renderTrash()

// Turn the long studio into focused work tabs and keep saving in reach.
storiesSection.after(trashSection)

const studioStyle = document.createElement('style')
studioStyle.textContent = '.studio-tabs{position:sticky;top:0;z-index:20;display:flex;gap:7px;overflow-x:auto;padding:12px 0;background:#22212a;border-bottom:1px solid #565260}.studio-tab{flex:0 0 auto;margin:0;padding:8px 11px;background:transparent;color:#aaa7a0;border:1px solid transparent;font-size:13px}.studio-tab.active{color:#ea497e;border-color:#ea497e;background:#292834}.studio-panel-hidden{display:none}.studio-save-bar{position:fixed;z-index:30;left:50%;bottom:18px;display:flex;align-items:center;gap:12px;max-width:calc(100vw - 32px);padding:9px 12px;background:#292834;border:1px solid #565260;box-shadow:0 12px 30px rgba(0,0,0,.32);transform:translateX(-50%)}.studio-save-bar button{margin:0}.studio-save-bar span{font-size:12px}@media(max-width:600px){.studio-save-bar{bottom:12px;width:calc(100% - 28px);justify-content:space-between}.studio-save-bar button{font-size:13px}}'
document.head.append(studioStyle)

const panels = [
  { label: '기본 정보', element: document.querySelector('#title').closest('section') },
  { label: '캐릭터', element: document.querySelector('#profiles').closest('section') },
  { label: '갤러리', element: document.querySelector('#gallery').closest('section') },
  { label: '세계관', element: document.querySelector('#entries').closest('section') },
  { label: '이야기', element: storiesSection },
  { label: '휴지통', element: trashSection },
]

const studioTabs = document.createElement('nav')
studioTabs.className = 'studio-tabs'
panels[0].element.before(studioTabs)

function activateStudioTab(index) {
  panels.forEach((panel, panelIndex) => {
    panel.element.classList.toggle('studio-panel-hidden', panelIndex !== index)
    studioTabs.children[panelIndex].classList.toggle('active', panelIndex === index)
  })
}

panels.forEach((panel, index) => {
  panel.element.classList.add('studio-panel')
  const tab = document.createElement('button')
  tab.type = 'button'
  tab.className = 'studio-tab'
  tab.textContent = panel.label
  tab.addEventListener('click', () => activateStudioTab(index))
  studioTabs.append(tab)
})
activateStudioTab(0)

const studioSaveBar = document.createElement('div')
studioSaveBar.className = 'studio-save-bar'
studioSaveBar.append(originalSaveButton, document.querySelector('#notice'))
document.body.append(studioSaveBar)
