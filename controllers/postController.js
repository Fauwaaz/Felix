const Post = require('../models/Post')
const sendgrid = require("@sendgrid/mail")
sendgrid.setApiKey(process.env.SG_EMAIL_API)

exports.viewCreateScreen = function(req, res) {
    res.render('create-post')
}

exports.create = async function(req, res) {
    let post = new Post(req.body, req.session.user._id)
    try {
        const newId = await post.create()
        // sendgrid.send({
        //     to: 'fauwaazshaikh999@gmail.com',
        //     from: 'fauwaaz@gmail.com',
        //     subject: 'New Post Created',
        //     text: `Your new post has been created with id:`,
        //     html: 'You did a <strong>Great Job</strong>'
        // })
        req.flash("success" , "New Post Succesfully Created")
        req.session.save(() => res.redirect(`/post/${newId}`))
    } catch(erros) {
        errors.forEach(error => req.flash("errors", error))
        req.session.save(() => res.redirect("/create-post"))
    }
}

exports.apiCreate = async function(req, res) {
    let post = new Post(req.body, req.apiUser._id)
    try {
        const newId = await post.create()
        res.json('congrats')
    } catch {
        res.json(errors)
    }   
}

exports.viewSingle = async function(req ,res) {
    try {
        let post = await Post.findSingleById(req.params.id, req.visitorId)
        res.render('single-post-screen', {post: post, title: post.title})
    } catch {
        res.render('404')
    }
}


exports.viewEditScreen = async function(req, res) {
    try {
        let post = await Post.findSingleById(req.params.id, req.visitorId) 
        if(post.isVisitorOwner) {
            res.render("edit-post", {post: post})
        } else {
            req.flash("errors", "You do not have permission to perform this data")
            req.session.save(() => res.redirect("/"))
        }
    } catch(errors) {
        res.render("404")
    }
}


exports.edit = async function(req, res){
    let post = new Post(req.body, req.visitorId, req.params.id)
    try {
        const status = await post.update()
        if(status == 'success'){
            req.flash('success', "Post successfully updated")
            req.session.save(function(){
                res.redirect(`/post/${req.params.id}/edit/`)
            })
        } else {
            post.errors.forEach(function(error){
                req.flash('errors', error)
            })
            req.session.save(function(){
                res.redirect(`/posts/${req.params.id}/edit`)
            })
        }
    } catch(errors) {
        req.flash("errors", "You do not have the persmission of that action")
        res.redirect('/')
    }
}

exports.delete = async function(req, res) {
    try {
        await Post.delete(req.params.id, req.visitorId)
        req.flash('success', "Post successfully deleted")
        req.session.save(() => res.redirect(`/profile/${req.session.user.username}`))
    } catch(errors) {
        req.flash("errors", "You do not have the persmission of that action")
        req.session.save(() => res.redirect('/'))
    }
}

exports.apiDelete = function(req, res) {
    try {
        Post.delete(req.params.id, req.apiUser._id)
        res.json("Post Deleted")
    } catch(errors) {
        res.json("Unauthorized")
    }
}


exports.search = async function(req, res) {
    try {
        const post = await Post.search(req.body.searchTerm)
        res.json(posts)
    } catch(errors) {
        res.json([])
    }
}