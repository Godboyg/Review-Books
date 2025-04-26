const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.DB_URL).then(()=>{
    console.log("db connected");
});

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  description: String,
  ratings: [{
    type: Number ,
    default : 0
  }],
  createdAt: { type: Date, default: Date.now },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
});

module.exports = mongoose.model('Book', bookSchema);
