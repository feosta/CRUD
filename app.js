const express = require('express'),
        mongoose = require('mongoose'),
        bodyParser = require('body-parser'),
        methodOverride = require('method-override'),
        passport = require('passport'),
        LocalStrategy = require('passport-local'),
        LocalStrategyMongoose = require('passport-local-mongoose'),
        session = require('express-session'),
        app = express();

//APP SETTINGS
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
app.use(session({
    secret:'iNT Full Stack Course',
    resave:false,
    saveUninitialized:false,
    }));
User = require('./modules/user');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser( User.serializeUser() );
passport.deserializeUser( User.deserializeUser() );

//MONGOOSE SETTINGS 
mongoose.connect('mongodb://localhost:27017/blogproject', { useNewUrlParser: true });

// DB Schema(s)
var commentSchema = new mongoose.Schema({
    text: String,
});
var Comment = mongoose.model('Comment', commentSchema);
///////
var postSchema = new mongoose.Schema({
    title: String,
    image: String,
    description: String,
    content: String,
    comments: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }
]
});
var Post = mongoose.model('Post', postSchema);
/////


//APP ROUTER
app.post('/add', (req, res) => {
    var title = req.body.titleTxt;
    var image = req.body.picUrl;
    var desc = req.body.descTxt;
    var content = req.body.contentTxt;
    Post.create({
        title: title,
        image: image,
        description: desc,
        content: content,
    }, (err, post) => {
        if (err) console.log('something wrong ' + err)
        else console.log('success ' + post)
    });
    res.redirect('/');
})

app.get('/register',(req,res)=>{
    res.render('register');
});

app.post('/register',(req,res)=>{
    var username = req.body.username;
    var password = req.body.password;
    var userObject = new User({username:username});
    User.register(userObject,password,(err,user)=>{
        if(err){
            console.log('error: '+err);
            res.render('register');
            }
        passport.authenticate('local')(req,res,()=>{
            res.redirect('account');
        });
    });
});

app.post('/login',passport.authenticate('local',{
    successRedirect:'/account',
    failureRedirect:'/login',
    }),(req,res)=>{
    });

app.get('/', (req, res) => {
    Post.find({}, (err, list) => {
        if (err) console.log('error ' + err);
        else {
            var data = {
                posts: list,
            }
            res.render('index', data);
        }
    });
})

app.get('/add', (req, res) => {
    res.render('new');
});

app.get('/:id', (req, res) => {
    var curID = req.params.id;
    Post.findOne({ _id: curID})
    .populate('comments')
    .exec(function(err, data){
        if (err) {
            console.log("error is " + err);
        } else {
            var postdata = {
                datas: data,
            }
            console.log(data);
            res.render('post', postdata);
        }
    })
})



app.get('/:id/edit', (req, res) => {
    Post.findById(req.params.id, (err, data) => {
        if (err) {
            console.log("error is " + err);
        } else {
            var postdata = {
                datas: data,
            }
            res.render('edit', postdata);
        }
    })
})

app.put('/:id', (req, res) => {
    let params = {
        title: req.body.titleTxt,
        image: req.body.picUrl,
        description: req.body.descTxt,
        content: req.body.contentTxt,
    };
    let postID = req.body.postID;
    Post.findByIdAndUpdate(postID, params, { new: true }, (err, obj) => {
        if (err) {
            console.log("error is " + err);
        } else {
            res.redirect('/' + postID);
        }
    })
})

app.delete('/:id', (req, res) => {
    let postID = req.params.id;
    console.log(postID);
    Post.findByIdAndRemove(postID, (err, data) => {
        if (data) console.log(data);
    });
    res.redirect('/');
})

app.post('/:id', (req, res) => {
    var commentPost = req.body.comment;
    var postID = req.params.id;
    console.log("comment is "+commentPost);
    Comment.create({
        text: commentPost
    }, function (err, data) {
        Post.findOne( { _id:postID},function (err, post) {
            if (err) {
                console.log('oops: ' + err);
            } else {
                console.log(data)
                post.comments.push(data);
                post.save(function (err, back) {
                    if (err) console.log('oops: ' + err);
                    else console.log(back);
                });
            }
            res.redirect('/' + postID);
            });
    });
});

app.listen(3000, () => {
    console.log('we working');
})