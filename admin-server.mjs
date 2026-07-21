import express from 'express'
import multer from 'multer'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const contentPath = path.join(root, 'content', 'site-content.json')
const imageDir = path.join(root, 'public', 'content-images')
await fs.mkdir(imageDir, { recursive: true })

const storage = multer.diskStorage({
  destination: imageDir,
  filename: (_req, file, done) => done(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-')}`),
})
const app = express()
app.use(express.json({ limit: '2mb' }))
app.get('/manage', async (_req, res) => {
  const page = await fs.readFile(path.join(root, 'manager', 'index.html'), 'utf8')
  res.type('html').send(page.replace('</body>', '<script src="/manager-fix.js"></script></body>'))
})
app.get('/manager-fix.js', (_req, res) => res.sendFile(path.join(root, 'manager', 'fix.js')))
app.use('/manage', express.static(path.join(root, 'manager')))
app.use('/content-images', express.static(path.join(root, 'public', 'content-images')))
app.get('/api/content', async (_req, res) => res.json(JSON.parse(await fs.readFile(contentPath, 'utf8'))))
app.put('/api/content', async (req, res) => {
  if (!req.body?.site || !Array.isArray(req.body.entries) || !Array.isArray(req.body.gallery)) return res.status(400).json({ error: '내용 형식이 올바르지 않습니다.' })
  await fs.writeFile(contentPath, `${JSON.stringify(req.body, null, 2)}\n`, 'utf8')
  res.json({ ok: true })
})
app.post('/api/image', multer({ storage }).single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: '이미지를 선택해 주세요.' })
  res.json({ url: `/content-images/${req.file.filename}` })
})
app.listen(5174, () => console.log('관리 도구: http://localhost:5174/manage'))
