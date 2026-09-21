const express = require('express')
const supabase = require('../config/supabase')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

// GET /api/stacks?category=frontend
router.get('/', async (req, res) => {
  let query = supabase.from('stacks').select('*').order('name')
  if (req.query.category) query = query.eq('category', req.query.category)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET /api/stacks/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('stacks')
    .select('*')
    .eq('id', req.params.id)
    .single()

  if (error) return res.status(404).json({ error: 'Stack not found' })
  res.json(data)
})

// POST /api/stacks (protected)
router.post('/', requireAuth, async (req, res) => {
  const { name, icon, category } = req.body
  if (!name) return res.status(400).json({ error: 'Name is required' })

  const { data, error } = await supabase
    .from('stacks')
    .insert([{ name, icon: icon || '', category: category || 'other' }])
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

// PUT /api/stacks/:id (protected)
router.put('/:id', requireAuth, async (req, res) => {
  const { name, icon, category } = req.body

  const { data, error } = await supabase
    .from('stacks')
    .update({ name, icon, category })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// DELETE /api/stacks/:id (protected)
router.delete('/:id', requireAuth, async (req, res) => {
  const { error } = await supabase
    .from('stacks')
    .delete()
    .eq('id', req.params.id)

  if (error) return res.status(500).json({ error: error.message })
  res.status(204).send()
})

module.exports = router
