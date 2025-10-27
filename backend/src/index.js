const express = require('express')
const app = express();
require('dotenv').config();
const main =  require('./config/db')
const cookieParser =  require('cookie-parser');
const authRouter = require("./routes/userAuth");
const redisClient = require('./config/redis');
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit")
const aiRouter = require("./routes/aiChatting")
const videoRouter = require("./routes/videoCreator");
const cors = require('cors')

app.use(cors({
    origin:[
        'https://zero-day-coder.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000'
    ],  
    credentials: true 
}))

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

app.use('/api/user', authRouter);
app.use('/api/problem', problemRouter);
app.use('/api/submission', submitRouter);
app.use('/api/ai', aiRouter);
app.use("/api/video", videoRouter);


const InitalizeConnection = async ()=>{
    try{
        await Promise.all([main(), redisClient.connect()]);
        console.log("DB Connected");
        
        if (process.env.NODE_ENV !== 'production') {
            app.listen(process.env.PORT, () => {
                console.log("Server listening at port number: " + process.env.PORT);
            });
        }
    }
    catch(err){
        console.log("Error: "+err);
    }
}

InitalizeConnection();

module.exports = app;