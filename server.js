require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');//1. import JWT

const app = express();
const PORT =  process.env.PORT  ||  3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'public')));

//connect to mongodb
const mongoURI = process.env.MONGO_URI;

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('sucessfully connected to MongoDB!'))
.catch(err => console.error('MongoDB connection error:',err));

//define  a "schema" and "model"
const contactSchema =new mongoose.Schema({
    name:{type: String, required:true},
     email:{type: String, required:true},
      date:{type: Date, default:Date.now},
});
const Contact = mongoose.model('Contact',contactSchema);

const userSchema = new mongoose.Schema({
    username:{type: String, required: true, unique:true},
    password:{type: String, required: true }
});
const User = mongoose.model('User', userSchema);
const { verify } = require('crypto');
const { type } = require('os');
const { error } = require('console');

const verifyToken = (req,res, next) => {
    // look for the token in the request header
    const token = req.headers['authorization']?.split(' ')[1];

    if(!token) {
        return res.status(403).send("Access denied. No  token provided.");
    }

    try{
        //verify the token using our secret key 
        const verified = jwt.verify(token,process.env.JWT_SECRET);
        req.user = verified;// save your data to the request object
        next();//keep going to the route handler
        }catch(error){
            res.status(401).send("Invalid or expired token.");
         }
};
app.post('/submit', async (req,res)=> {
    try{
const{name, email} =req.body;
//create a new entry usin your model name

const newContact = new Contact({name,email});
await newContact.save();
 console.log(`Sucessfully saved data for: ${name}`);
 res.send("Data succesfully saved to MongoDB!");
    }catch(err){
        console.error("error writing to database:", err);
        res.status(500).send("Server error: Could not save  data.");
    }
});

//routes for registration(signup)
app.post('/register',async (req,res)=> {
    try{
const{username, password} =req.body;
// check if user already exists
const userExists = await User.findOne({username});
if (userExists){
    return res.status(400).send("Username is already taken.");
} 
// secure the pasword by hashing it (scrmbing it 10 times)
const hashedpassword = await bcrypt.hash(password,10);

//save the new user with the scrambled password
const newUser = new  User({username,password: hashedpassword});
await newUser.save();

res.status(201).send("Account created successfully! you can now log in.");
    }catch(error){
        console.error(error);
        res.status(500).send("error creating account.");
            } 
        });
        //ROUTE FOR SIGN IN (LOGIN)
        app.post('/login', async (req,res)=>{
            try{
                const{username,password} = req.body;
                 
                //find user by username
                const user =await User.findOne({username});
                if(!user) {
                    return res.status(400).send("Invalid username or password.");
                }
                const isMatch =await bcrypt.compare(password,user.password);
                if(!isMatch){
                    return res.status(400).send("Invalid username or password.");
                }
                //genrate a token that expires in 1 hour
                const token = jwt.sign(
                    {id: user._id, username: user.username},
                    process.env.JWT_SECRET,
                    {expiresIn:'1h'}
                );
                //send token back to the browser
                res.json({
                    message: "Login successful!",
                    token: token
                });
                   }catch(error){
                console.error(error);
                res.status(500).send("Error logging in.");
             }
        });
        //new example protected route(data backend)
        app.get('/api/dashboard-data', verifyToken,(req,res)=>{

            res.json({
                secretMessage:`Welcome to the secure dashboard, ${req.user.username}! Hereb is your private data.`
            });
        });
        const { body,validatioResult } =require('express-validator');

        app.post('/submit',
            body('email').isEmail().normalizeEmail(),
            body('name').trim().escape(),
            async(res,req) =>{
                const errors =validatioResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).send("Invalid input data entered.");
                 }
                
            
                try{
                    const{username,password} = req.body
                    const userExits = await User.findOne({username });
                    if(userExits){
                        return res.status(400).send("username is already taken.");
                    }

                    const hashedpassword = await bcrypt.hash(password, 10);
                    const newUser = new User({username,password: hashedpassword});
                    await newUser .save();

                    res.status(201).send("Account created successfully! You can now log in.");
                  }catch (error){
                    console.error(error);
                    res.status(500).send("Erorr creating account.");
                  }
                });
                
         app.listen(PORT,()=>{
            console.log(`server running smoothly on port${PORT}`);
         });
