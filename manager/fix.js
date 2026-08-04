// Reliable image saving and a lightweight image preview for the local editor.
const nativeFetch = window.fetch.bind(window)
async function makeWebImage(file, maxSize = 2200, quality = .9) {
  if (!file?.type?.startsWith('image/') || /svg|gif/.test(file.type)) return file
  const source = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(source.width, source.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(source.width * scale))
  canvas.height = Math.max(1, Math.round(source.height * scale))
  canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
  source.close?.()
  return blob ? new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'image'}.webp`, { type: 'image/webp' }) : file
}
window.fetch = async (input, init = {}) => {
  if (String(input) === '/api/image' && init.body instanceof FormData) {
    const image = init.body.get('image')
    if (image instanceof File) {
      const optimized = await makeWebImage(image)
      if (optimized !== image) init.body.set('image', optimized)
    }
  }
  return nativeFetch(input, init)
}
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

const noticeSetting = document.createElement('div')
noticeSetting.className = 'notice-setting'
noticeSetting.innerHTML = '<h3>슬라이드형 공지 / 추천</h3><label class="notice-toggle"><input id="notice-enabled" type="checkbox"> 대문과 링크 사이에 공지 영역 표시</label><p class="muted">여러 항목을 등록하면 약 5초마다 다음 공지로 자동 전환됩니다. 아래 점을 눌러 원하는 공지로 바로 이동할 수도 있습니다.</p><button type="button" id="add-notice">공지 추가</button><div id="notice-list"></div>'
document.querySelector('#hero').parentElement.append(noticeSetting)

const imageOptimizationSetting = document.createElement('div')
imageOptimizationSetting.className = 'image-optimization-setting'
imageOptimizationSetting.innerHTML = '<h3>이미지 자동 최적화</h3><p class="muted">앞으로 수정툴에서 추가하는 이미지는 자동으로 웹용 WebP 파일로 변환됩니다. 아래 버튼은 이미 등록된 이미지를 한 번에 웹용 복사본으로 바꾸며, 기존 원본 파일은 삭제하지 않습니다.</p><button type="button" id="optimize-existing-images">기존 이미지 일괄 최적화</button>'
document.querySelector('#hero').parentElement.append(imageOptimizationSetting)

const siteImageStyle = document.createElement('style')
siteImageStyle.textContent = '.site-image-preview-list{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 16px}.hero-image-item{width:110px}.site-image-preview-list img{display:block;width:110px;height:120px;object-fit:contain;background:#292834;border:1px solid #565260}.site-image-preview-list button{width:100%;margin:4px 0 0;padding:6px;background:#7b4654;color:#fff}'
document.head.append(siteImageStyle)

const siteLinksStyle = document.createElement('style')
siteLinksStyle.textContent = '.gallery-card-summary{display:flex;width:100%;align-items:center;justify-content:space-between;gap:12px;margin:0;padding:6px 0;background:transparent;color:#d8d5c6;text-align:left}.gallery-card-summary span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gallery-card-summary b{color:#ea497e;font-size:13px;font-weight:400;white-space:nowrap}.gallery-order-controls{display:flex;gap:5px;margin-bottom:4px}.gallery-order-controls button{margin:0;padding:5px 9px;background:#292834;color:#d8d5c6;border:1px solid #565260}.gallery-card-collapsed{padding:10px 14px}.gallery-card-collapsed>:not(.gallery-card-summary):not(.gallery-order-controls){display:none}.entry-editor-card-hidden,.gallery-editor-card-hidden{display:none}.entry-editor-pager,.gallery-editor-pager{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0}.entry-editor-pager button,.gallery-editor-pager button{margin:0;padding:7px 11px;background:#292834;color:#d8d5c6;border:1px solid #565260}.entry-editor-pager button.active,.gallery-editor-pager button.active{color:#ea497e;border-color:#ea497e}.site-links-setting{margin-top:26px}.site-link-card{display:grid;grid-template-columns:1fr 1.4fr 1fr 130px auto;gap:8px;align-items:center;margin:10px 0;padding:10px;border:1px solid #565260;background:#292834}.site-link-card input{margin:0}.site-link-logo{display:flex;gap:6px;align-items:center;font-size:11px}.site-link-logo input{max-width:90px}.site-link-logo img{width:30px;height:30px;object-fit:contain;background:#22212a}.site-link-controls{display:flex;gap:4px}.site-link-controls button{margin:0;padding:7px 9px}.site-link-card .site-link-remove{background:#7b4654;color:#fff}@media(max-width:700px){.site-link-card{grid-template-columns:1fr}.site-link-controls{display:grid;grid-template-columns:1fr 1fr 1fr}.site-link-card .site-link-remove{width:100%}}'
document.head.append(siteLinksStyle)

const noticeStyle = document.createElement('style')
noticeStyle.textContent = '.notice-setting{margin-top:26px}.notice-toggle{display:block;margin:10px 0}.notice-toggle input{width:auto;margin-right:8px}.notice-card{display:grid;grid-template-columns:110px minmax(0,1fr) auto;gap:10px;align-items:start;margin:10px 0;padding:10px;border:1px solid #565260;background:#292834}.notice-card-preview{width:110px;height:88px;background:#22212a;border:1px solid #565260;display:grid;place-items:center;color:#aaa7a0;font-size:11px}.notice-card-preview img{width:100%;height:100%;object-fit:cover}.notice-card input,.notice-card textarea{margin:0}.notice-card textarea{min-height:70px}.notice-card-actions{display:flex;gap:4px}.notice-card-actions button{margin:0;padding:7px 9px}.notice-card-actions .danger{background:#7b4654;color:#fff}@media(max-width:700px){.notice-card{grid-template-columns:1fr}.notice-card-preview{width:100%;height:160px}.notice-card-actions{display:grid;grid-template-columns:1fr 1fr 1fr}}'
document.head.append(noticeStyle)

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

let noticesDirty = false
function collectNotices() {
  if (!d) return
  d.site.notices = [...document.querySelectorAll('[data-notice]')].map((card) => {
    const index = Number(card.dataset.notice)
    const previous = d.site.notices?.[index] || {}
    return { id: card.dataset.noticeId || previous.id || crypto.randomUUID(), title: card.querySelector('[data-notice-key="title"]').value.trim(), text: card.querySelector('[data-notice-key="text"]').value.trim(), url: card.querySelector('[data-notice-key="url"]').value.trim(), image: previous.image || '' }
  }).filter((notice) => notice.title || notice.text || notice.image || notice.url)
  d.site.noticeEnabled = document.querySelector('#notice-enabled').checked
}
function renderNotices() {
  if (!d) return
  d.site.notices ||= []
  document.querySelector('#notice-enabled').checked = d.site.noticeEnabled !== false
  document.querySelector('#notice-list').innerHTML = d.site.notices.map((notice, index) => `<div class="notice-card" data-notice="${index}" data-notice-id="${notice.id || ''}"><div class="notice-card-preview">${notice.image ? `<img src="${notice.image}" alt="현재 공지 이미지">` : '이미지 없음'}</div><div><input data-notice-key="title" value="${escapeLinkText(notice.title || '')}" placeholder="공지 제목"><textarea data-notice-key="text" placeholder="짧은 설명 (선택)">${escapeLinkText(notice.text || '')}</textarea><input data-notice-key="url" value="${escapeLinkText(notice.url || '')}" placeholder="이동할 링크 또는 #/gallery 같은 내부 주소"><label>배너 이미지 (선택)<input class="notice-image-file" type="file" accept="image/*"></label></div><div class="notice-card-actions"><button type="button" data-move-notice="${index}" data-direction="-1" ${index === 0 ? 'disabled' : ''}>↑</button><button type="button" data-move-notice="${index}" data-direction="1" ${index === d.site.notices.length - 1 ? 'disabled' : ''}>↓</button><button type="button" class="danger" data-remove-notice="${index}">삭제</button></div></div>`).join('')
}
async function saveNoticeImages() {
  for (const card of document.querySelectorAll('[data-notice]')) {
    const file = card.querySelector('.notice-image-file')?.files[0]
    if (!file) continue
    const form = new FormData(); form.append('image', file)
    const response = await fetch('/api/image', { method: 'POST', body: form })
    const uploaded = await response.json()
    if (!response.ok) throw new Error(uploaded.error || '공지 이미지를 업로드하지 못했습니다.')
    const notice = d.site.notices.find((item) => item.id === card.dataset.noticeId)
    if (notice) notice.image = uploaded.url
  }
}
document.querySelector('#add-notice').addEventListener('click', () => { collectNotices(); d.site.notices.push({ id: crypto.randomUUID(), title: '', text: '', url: '', image: '' }); noticesDirty = true; renderNotices() })
document.querySelector('#notice-list').addEventListener('input', () => { noticesDirty = true })
document.querySelector('#notice-enabled').addEventListener('change', () => { noticesDirty = true })
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove-notice],[data-move-notice]')
  if (!button) return
  collectNotices()
  const index = Number(button.dataset.removeNotice ?? button.dataset.moveNotice)
  if (button.matches('[data-remove-notice]')) d.site.notices.splice(index, 1)
  else { const next = index + Number(button.dataset.direction); if (next < 0 || next >= d.site.notices.length) return; [d.site.notices[index], d.site.notices[next]] = [d.site.notices[next], d.site.notices[index]] }
  noticesDirty = true
  renderNotices()
})

async function optimizeStoredImage(url, cache) {
  if (!url || !url.startsWith('/content-images/')) return url
  if (cache.has(url)) return cache.get(url)
  const source = await nativeFetch(url)
  if (!source.ok) throw new Error('기존 이미지 파일을 읽지 못했습니다.')
  const blob = await source.blob()
  const file = new File([blob], url.split('/').pop() || 'image', { type: blob.type || 'image/jpeg' })
  const optimized = await makeWebImage(file)
  const form = new FormData(); form.append('image', optimized)
  const response = await nativeFetch('/api/image', { method: 'POST', body: form })
  const uploaded = await response.json()
  if (!response.ok) throw new Error(uploaded.error || '이미지 변환에 실패했습니다.')
  cache.set(url, uploaded.url)
  return uploaded.url
}
document.querySelector('#optimize-existing-images').addEventListener('click', async () => {
  if (!d || !confirm('등록된 이미지의 웹용 복사본을 만들까요? 원본 파일은 삭제되지 않습니다.')) return
  const targets = []
  const add = (object, key) => { if (object?.[key]) targets.push({ object, key }) }
  d.gallery.forEach((item) => add(item, 'url'))
  ;(d.sketches || []).forEach((item) => add(item, 'url'))
  d.profiles.forEach((item) => add(item, 'image'))
  d.entries.forEach((item) => add(item, 'image'))
  ;(d.stories || []).forEach((item) => add(item, 'coverImage'))
  ;(d.site.notices || []).forEach((item) => add(item, 'image'))
  ;(d.site.heroImages || []).forEach((_url, index) => targets.push({ object: d.site.heroImages, key: index }))
  const cache = new Map()
  try {
    for (let index = 0; index < targets.length; index += 1) {
      const target = targets[index]
      say(`이미지 최적화 중… ${index + 1} / ${targets.length}`)
      target.object[target.key] = await optimizeStoredImage(target.object[target.key], cache)
    }
    const response = await nativeFetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
    if (!response.ok) throw new Error('최적화된 목록을 저장하지 못했습니다.')
    draw()
    say(`완료했습니다. ${cache.size}개의 웹용 이미지 복사본을 만들었습니다.`)
  } catch (error) {
    say(error.message || '이미지 최적화에 실패했습니다.')
  }
})

const originalSaveButton = [...document.querySelectorAll('button')].find((button) => button.textContent.includes('모든 변경사항'))
// The base editor already has an inline save handler.  Keep this enhanced
// handler as the only save path so one click cannot write two different
// versions of the content file at once.
originalSaveButton?.removeAttribute('onclick')
let isSavingContent = false
originalSaveButton?.addEventListener('click', async (event) => {
  event.stopImmediatePropagation()
  event.preventDefault()
  if (isSavingContent) return
  isSavingContent = true
  originalSaveButton.disabled = true
  const previousButtonText = originalSaveButton.textContent
  originalSaveButton.textContent = '저장 중…'
  try {
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
    const entryImageFile = card.querySelector('.entry-image-file')?.files[0]
    if (entryImageFile) {
      const form = new FormData()
      form.append('image', entryImageFile)
      const response = await fetch('/api/image', { method: 'POST', body: form })
      const uploaded = await response.json()
      if (!response.ok) return say(uploaded.error || '도감 이미지 업로드에 실패했습니다.')
      item.image = uploaded.url
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
  try {
    collectNotices()
    await saveNoticeImages()
  } catch (error) {
    return say(error.message)
  }
  const response = await fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
  say(response.ok ? '저장됐습니다. 캐릭터사이트를 새로고침하세요.' : '저장에 실패했습니다.')
  if (response.ok) { siteLinksDirty = false; draw() }
  } finally {
    isSavingContent = false
    originalSaveButton.disabled = false
    originalSaveButton.textContent = previousButtonText
  }
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
    const orderControls = document.createElement('div')
    orderControls.className = 'gallery-order-controls'
    const index = Number(card.dataset.i)
    orderControls.innerHTML = `<button type="button" data-move-gallery="${index}" data-direction="-1" ${index === 0 ? 'disabled' : ''}>↑ 위로</button><button type="button" data-move-gallery="${index}" data-direction="1" ${index === d.gallery.length - 1 ? 'disabled' : ''}>↓ 아래로</button>`
    const summary = document.createElement('button')
    summary.type = 'button'
    summary.className = 'gallery-card-summary'
    summary.innerHTML = `<span>${escapeLinkText(item.title || '제목 없는 이미지')}</span><b>수정 펼치기 ↓</b>`
    summary.addEventListener('click', () => {
      const isCollapsed = card.classList.toggle('gallery-card-collapsed')
      summary.querySelector('b').textContent = isCollapsed ? '수정 펼치기 ↓' : '수정 접기 ↑'
    })
    card.prepend(summary)
    card.prepend(orderControls)
    card.classList.add('gallery-card-collapsed')
  })
}

function collectGalleryCards() {
  document.querySelectorAll('.card[data-type="gallery"]').forEach((card) => {
    const item = d.gallery[Number(card.dataset.i)]
    card.querySelectorAll('[data-k]').forEach((field) => { item[field.dataset.k] = field.value })
    item.tags = String(item.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean)
  })
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-move-gallery]')
  if (!button) return
  collectGalleryCards()
  const index = Number(button.dataset.moveGallery)
  const nextIndex = index + Number(button.dataset.direction)
  if (nextIndex < 0 || nextIndex >= d.gallery.length) return
  ;[d.gallery[index], d.gallery[nextIndex]] = [d.gallery[nextIndex], d.gallery[index]]
  draw()
})

let galleryEditorPage = 0
function renderGalleryPagination() {
  if (!d) return
  const cards = [...document.querySelectorAll('.card[data-type="gallery"]')]
  const pageSize = 10
  const pageCount = Math.max(1, Math.ceil(cards.length / pageSize))
  galleryEditorPage = Math.min(galleryEditorPage, pageCount - 1)
  cards.forEach((card, index) => card.classList.toggle('gallery-editor-card-hidden', Math.floor(index / pageSize) !== galleryEditorPage))
  let pager = document.querySelector('#gallery-editor-pager')
  if (!pager) {
    pager = document.createElement('nav')
    pager.id = 'gallery-editor-pager'
    pager.className = 'gallery-editor-pager'
    document.querySelector('#gallery').before(pager)
  }
  pager.innerHTML = Array.from({ length: pageCount }, (_, index) => `<button type="button" class="${index === galleryEditorPage ? 'active' : ''}" data-gallery-editor-page="${index}">${index + 1}</button>`).join('')
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-gallery-editor-page]')
  if (!button) return
  galleryEditorPage = Number(button.dataset.galleryEditorPage)
  renderGalleryPagination()
})

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

function renderEntryExtras() {
  if (!d) return
  document.querySelectorAll('.card[data-type="entries"]').forEach((card) => {
    if (card.querySelector('.entry-extra-setting')) return
    const entry = d.entries[Number(card.dataset.i)]
    const setting = document.createElement('div')
    setting.className = 'entry-extra-setting'
    setting.innerHTML = `<label>도감 오른쪽 정사각형 이미지 (선택)</label><input class="entry-image-file" type="file" accept="image/*">${entry.image ? `<img src="${entry.image}" alt="현재 도감 이미지">` : ''}<label>연결할 캐릭터 프로필 (선택)</label><select data-k="profileId"><option value="">연결하지 않음</option>${d.profiles.map((profile) => `<option value="${profile.id}" ${entry.profileId === profile.id ? 'selected' : ''}>${escapeLinkText(profile.name || '이름 없는 캐릭터')}</option>`).join('')}</select>`
    card.querySelector('.danger').before(setting)
  })
}

const entryExtraStyle = document.createElement('style')
entryExtraStyle.textContent = '.entry-extra-setting{clear:both;padding-top:12px}.entry-extra-setting select{box-sizing:border-box;width:100%;margin:6px 0;padding:10px;background:#292834;color:#d8d5c6;border:1px solid #565260;font:inherit}.entry-extra-setting img{display:block;width:92px;height:92px;margin:6px 0 12px;object-fit:cover;background:#292834;border:1px solid #565260}'
document.head.append(entryExtraStyle)

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-entry-editor-page]')
  if (!button) return
  entryEditorPage = Number(button.dataset.entryEditorPage)
  renderEntryPagination()
})

const sketchesSection = document.createElement('section')
sketchesSection.innerHTML = '<h2>낙서</h2><p class="muted">제목이나 설명 없이 이미지와 날짜만 기록합니다.</p><input id="sketch-file" type="file" accept="image/*"><label>날짜<input id="sketch-date" type="date"></label><button type="button" id="add-sketch">낙서 이미지 추가</button><div id="sketches-list"></div>'
document.querySelector('.w').append(sketchesSection)
document.querySelector('#sketch-date').value = new Date().toISOString().slice(0, 10)

function renderSketches() {
  if (!d) return
  d.sketches ||= []
  document.querySelector('#sketches-list').innerHTML = d.sketches.map((item, index) => `<div class="card" data-type="sketches" data-i="${index}">${item.url ? `<img src="${item.url}" alt="낙서">` : ''}<label>날짜<input data-k="date" type="date" value="${item.date || ''}"></label><button class="danger">삭제</button></div>`).join('')
}
document.querySelector('#add-sketch').addEventListener('click', async () => {
  const file = document.querySelector('#sketch-file').files[0]
  if (!file) return say('낙서 이미지를 선택해 주세요.')
  const form = new FormData(); form.append('image', file)
  const response = await fetch('/api/image', { method: 'POST', body: form })
  const uploaded = await response.json()
  if (!response.ok) return say(uploaded.error || '이미지 업로드에 실패했습니다.')
  d.sketches ||= []
  d.sketches.push({ id: crypto.randomUUID(), url: uploaded.url, date: document.querySelector('#sketch-date').value || new Date().toISOString().slice(0, 10) })
  document.querySelector('#sketch-file').value = ''
  draw()
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
draw = function () { originalDraw(); renderHeroImages(); renderSiteLinks(); renderNotices(); renderProfileLogoInputs(); renderProfilePreviewInputs(); renderGalleryTagInputs(); renderGalleryCardCollapses(); renderGalleryPagination(); renderEntryExtras(); renderEntryPagination(); renderSketches(); renderStories() }

// Turn the long studio into focused work tabs and keep saving in reach.
const studioStyle = document.createElement('style')
studioStyle.textContent = '.studio-tabs{position:sticky;top:0;z-index:20;display:flex;gap:7px;overflow-x:auto;padding:12px 0;background:#22212a;border-bottom:1px solid #565260}.studio-tab{flex:0 0 auto;margin:0;padding:8px 11px;background:transparent;color:#aaa7a0;border:1px solid transparent;font-size:13px}.studio-tab.active{color:#ea497e;border-color:#ea497e;background:#292834}.studio-panel-hidden{display:none}.studio-save-bar{position:fixed;z-index:30;left:50%;bottom:18px;display:flex;align-items:center;gap:12px;max-width:calc(100vw - 32px);padding:9px 12px;background:#292834;border:1px solid #565260;box-shadow:0 12px 30px rgba(0,0,0,.32);transform:translateX(-50%)}.studio-save-bar button{margin:0}.studio-save-bar span{font-size:12px}@media(max-width:600px){.studio-save-bar{bottom:12px;width:calc(100% - 28px);justify-content:space-between}.studio-save-bar button{font-size:13px}}'
document.head.append(studioStyle)

const panels = [
  { label: '기본 정보', element: document.querySelector('#title').closest('section') },
  { label: '캐릭터', element: document.querySelector('#profiles').closest('section') },
  { label: '갤러리', element: document.querySelector('#gallery').closest('section') },
  { label: '낙서', element: sketchesSection },
  { label: '세계관', element: document.querySelector('#entries').closest('section') },
  { label: '이야기', element: storiesSection },
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
