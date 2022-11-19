const mongoose = require("mongoose")

const expenseSchema =  new mongoose.Schema({
    deductionType:{
        type: String,
        required: true
    },
    amount:{
        type:Number,
        required: true
    },
    date: {
        type:Date,
        default:Date.now,
    },
    processBy:{
        type: String,
        required: true
    }
})

const Expense = mongoose.model("Expense", expenseSchema);
module.exports =  Expense;