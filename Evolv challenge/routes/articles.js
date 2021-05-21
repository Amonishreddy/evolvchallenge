 const express = require('express')
const Article = require('./../models/article')
const router = express.Router()

router.get('/new', (req, res) => {
  res.render('articles/new', { article: new Article() })
})
router.get('/addcomment/:id', async (req, res) => {
  const article = await Article.findById(req.params.id)
  res.render('articles/addcomment', { article: article})
})

router.get('/edit/:id', async (req, res) => {
  const article = await Article.findById(req.params.id)
  res.render('articles/edit', { article: article })
})


router.get('/:id', async (req, res) => {
  const article = await Article.findById(req.params.id)
  if (article == null) res.redirect('/')
  res.render('articles/show', { article: article })
})
router.post('/:id/addcomment' , async (req,res) => {
  var newId = Date.now();
  await Article.findByIdAndUpdate(req.params.id,{$addToSet:{comments : {body:req.body.addcomment, id:newId}}});

  res.redirect(`/articles/${req.params.id}`)
})


router.post('/', async (req, res, next) => {
  req.article = new Article()
  next()
}, saveArticleAndRedirect('new'))

router.put('/:id', async (req, res, next) => {
  req.article = await Article.findById(req.params.id)
  next()
}, saveArticleAndRedirect('edit'))

router.delete('/:id', async (req, res) => {
  await Article.findByIdAndDelete(req.params.id)
  res.redirect('/')
})
router.delete('/:pid/:cid', async (req, res) => {
  await Article.findByIdAndUpdate(req.params.pid,
    {
      $pull: { comments: {id:req.params.cid}},
    });
  res.redirect(`/articles/${req.params.pid}`)
})

function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article
    article.title = req.body.title
    article.description = req.body.description
    article.markdown = req.body.markdown
    try {
      article = await article.save()
      res.redirect(`/articles/${article.id}`)
    } catch (e) {
      res.render(`articles/${path}`, { article: article })
    }
  }
}

module.exports = router