const express = require('express')
const supabase = require('../config/supabase')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

// GET /api/projects?page=1&limit=6
router.get('/', async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1)
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 6))
  const from  = (page - 1) * limit
  const to    = from + limit - 1

  const { data, error, count } = await supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .order('order_index', { ascending: true })
    .order('created_at',  { ascending: false })
    .range(from, to)

  if (error) return res.status(500).json({ error: error.message })

  res.json({
    data,
    meta: {
      total:      count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  })
})

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', req.params.id)
    .single()

  if (error) return res.status(404).json({ error: 'Project not found' })
  res.json(data)
})

// POST /api/projects (protected)
router.post('/', requireAuth, async (req, res) => {
  const { title, subtitle, description, image_url, live_url, github_url, stacks, featured, order_index } = req.body
  if (!title) return res.status(400).json({ error: 'Title is required' })

  const { data, error } = await supabase
    .from('projects')
    .insert([{
      title, subtitle, description, image_url, live_url, github_url,
      stacks:      stacks      ?? [],
      featured:    featured    ?? false,
      order_index: order_index ?? 0,
    }])
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

// PUT /api/projects/:id (protected)
router.put('/:id', requireAuth, async (req, res) => {
  const { title, subtitle, description, image_url, live_url, github_url, stacks, featured, order_index } = req.body

  const { data, error } = await supabase
    .from('projects')
    .update({ title, subtitle, description, image_url, live_url, github_url, stacks, featured, order_index })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// DELETE /api/projects/:id (protected)
router.delete('/:id', requireAuth, async (req, res) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', req.params.id)

  if (error) return res.status(500).json({ error: error.message })
  res.status(204).send()
})

module.exports = router
