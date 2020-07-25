const   express                 =   require('express'),
        jwt                     =   require('jsonwebtoken'),
        keys                    =   require("./config/keys"),
        bodyParser              =   require('body-parser'),
        mongoose                =   require('mongoose');




const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect(keys.mongodb.url,{ useNewUrlParser: true });

var userschema = new mongoose.Schema({
    username:String,
    password:String,
    email:String,
    message:String
});
var user=mongoose.model("hb",userschema);

var postschema = new mongoose.Schema({
    username:String,
    email:String,
    message:String
});
var posts = mongoose.model("hb_post",postschema);



//==============================================================================

app.post("/signup",function(req,res){
    user.create({username:req.body.username,password:req.body.password,email:req.body.email},function(err,user1){
        if(err){
            res.sendStatus(403);
        }else{
            res.json({
                message:"user created Successfully "
            });
        }
    });
});

app.post("/login",function(req,res){

    user.findOne({username:req.body.username,password:req.body.password},function(err,user1){
        console.log(user1);
        jwt.sign({user:user1},'gagan',{expiresIn:600},function(err,token){
            res.json({
                token:token
            });
        });
    });
});

app.post("/createpost",loginverify,function(req,res){
    jwt.verify(req.token,'gagan',(err,authdata) => {
        if(err){
            res.sendStatus(403);
        }else{
            posts.create({username:authdata["user"]["username"],email:authdata["user"]["email"],message:req.body.message},function(err,createdpost){
                if(err){
                    res.sendStatus(403);
                }else{
                res.json({
                    createdpost
                });
                }
            });
        }
    });
});

app.post("/updatepost",loginverify,function(req,res){
    jwt.verify(req.token,'gagan',(err,authdata) => {
        if(err){
            res.sendStatus(403);
        }else{
            posts.findOneAndUpdate({username:authdata["user"]["username"],email:authdata["user"]["email"]},{username:authdata["user"]["username"],email:authdata["user"]["email"],message:req.body.message},function(err,updatedpost){
                if(err){
                    res.sendStatus(403);
                }else{
                res.json({
                    updatedpost
                });
                }
            });
        }
    });
});

app.post("/deletepost",loginverify,function(req,res){
    jwt.verify(req.token,'gagan',(err,authdata) => {
        if(err){
            res.sendStatus(403);
        }else{
            posts.findOneAndRemove({username:authdata["user"]["username"],email:authdata["user"]["email"],message:req.body.message},function(err,delpost){
                if(err){
                    res.sendStatus(403);
                }else{
                res.json({
                    message:"post deleted"
                });
                }
            });
        }
    });
});



app.get("/",function(req,res){
    res.json({
        "/signup":"body urlencoded: username password and email ",
        "/login": "body urlencoded: username and password",
        "/createpost":" headers: Authorization, body urlencoded: message",
        "/updatepost":"headers: Authorization, body urlencoded: message",
        "/deletepost":"headers: Authorization, body urlencoded: message"

    });
});

function loginverify(req,res,next){
    const bearerheader = req.headers['authorization'];

    if(typeof bearerheader!== 'undefined'){
        const bearer = bearerheader.split(' ');
        const bearertoken = bearer[1];
        req.token = bearertoken;
        next(); 

    }else{
        res.sendStatus(403);
    }
};

app.listen(process.env.PORT,process.env.IP,function(req,res){
    console.log("server is running");
});