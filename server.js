const express = require('express');
const app = express();
const connectDB = require('./config/db');

//connect to mongoDB
connectDB();

app.get('/' , (req,res)=>{res.send('API Connected')});
app.use(express.json({extended:false}));

//Using routes
app.use('/api/user' ,require('./routes/api/user') );
app.use('/api/auth' , require('./routes/api/auth'));


//listen to port 5000
const PORT = process.env.PORT || 5000 ;

app.listen(PORT , ()=>console.log(`server run on port ${PORT}`));
