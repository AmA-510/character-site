// Reliable image saving and a lightweight image preview for the local editor.
const titleLineSetting = document.createElement('div')
titleLineSetting.innerHTML = '<label>메인 제목 줄바꿈</label><textarea id="title-lines" placeholder="한 줄마다 원하는 제목 줄을 입력하세요."></textarea><p class="muted">빈칸 없이 한 줄씩 입력하면 그 위치에서만 줄바꿈됩니다.</p>'
document.querySelector('#hero').parentElement.append(titleLineSetting)

const siteImageSetting = document.createElement('div')
siteImageSetting.innerHTML = '<h3>메인 대표 이미지</h3><label>메인에 무작위로 표시할 이미지들</label><input id="hero-image" type="file" accept="image/*" multiple><button type="button" id="add-hero-images">선택한 이미지 추가</button><div id="hero-preview" class="site-image-preview-list"></div><p class="muted">여러 장을 한 번에 추가할 수 있습니다. 아래 목록의 제거 버튼으로 등록된 이미지를 관리할 수 있습니다.</p>'
document.querySelector('#hero').parentElement.append(siteImageSetting)

const siteImageStyle = document.createElement('style')
siteImageStyle.textContent = '.site-image-preview-list{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 16px}.hero-image-item{width:110px}.site-image-preview-list img{display:block;width:110px;height:120px;object-fit:contain;background:#292834;border:1px solid #565260}.site-image-preview-list button{width:100%;margin:4px 0 0;padding:6px;background:#7b4654;color:#fff}'
document.head.append(siteImageStyle)

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
    if (card.dataset.type === 'gallery') item.tags = String(item.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean)
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
const profileLogoStyle = document.createElement('style')
profileLogoStyle.textContent = '.profile-logo-setting{clear:both;padding-top:10px}.profile-logo-setting img{display:block;float:none;width:150px;height:72px;object-fit:contain;object-position:left center;margin:6px 0;background:#292834;border:1px solid #565260}'
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

const originalDraw = draw
draw = function () { originalDraw(); renderTrash(); renderHeroImages(); renderProfileLogoInputs(); renderGalleryTagInputs() }
renderTrash()
