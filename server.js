const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path")
const ExpenseData = require("./models/expenseModel");
const BillingData = require("./models/billingModel");
require("dotenv").config({ path: "./.env" });

//middleware
app.use(express.json());
app.use(cors());

//routes for expense
app.post("/addExpense", async (req, res) => {
  const deduction = req.body.deduction;
  const amount = req.body.amount;
  const processBy = req.body.process;
  const expense = new ExpenseData({
    deductionType: deduction,
    amount: amount,
    processBy: processBy,
  });
  try {
    await expense.save();
  } catch (err) {
    console.log(err);
  }
});

app.get("/readExpense", async (req, res) => {
  ExpenseData.find({}, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

app.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  await ExpenseData.findByIdAndRemove(id).exec();
  res.send("deleted");
});

app.get("/readExpense/:id", async (req, res) => {
  const id = req.params.id;

  const response = await ExpenseData.findOne({ _id: id });
  res.json({ success: true, data: response });
});

app.put("/editExpense/:id", async (req, res) => {
  const deductionType = req.body.deduction;
  const amount = req.body.amount;
  const processBy = req.body.process;
  const id = req.params.id;

  const response = await ExpenseData.findByIdAndUpdate(
    { _id: id },
    { deductionType, amount, processBy }
  );
  res.json({ success: true, data: response });
});
//routes for billing
app.post("/addBilling", async (req, res) => {
  const name = req.body.name;
  const contact = req.body.contact;
  const description = req.body.description;
  const total = req.body.total;

  const billing = new BillingData({
    name: name,
    contact: contact,
    description: description,
    total: total,
  });
  try {
    await billing.save();
  } catch (err) {
    console.log(err);
  }
});

app.get("/readBilling", async (req, res) => {
  BillingData.find({}, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});


app.delete("/deleteBilling/:id", async (req, res) => {
  const id = req.params.id;

  await BillingData.findByIdAndRemove(id).exec();
  res.send("deleted");
});

app.get("/readBills/:id", async (req, res) => {
  const id = req.params.id;

  const response = await BillingData.findOne({ _id: id });
  res.json({ success: true, data: response });
});

app.put("/editBill/:id", async (req, res) => {
  const name = req.body.name;
  const contact = req.body.contact;
  const description = req.body.description;
  const total = req.body.total;
  const id = req.params.id;

  const response = await BillingData.findByIdAndUpdate(
    { _id: id },
    { name, contact, description, total }
  );
  res.json({ success: true, data: response });
});

//sales route
app.get("/sales", async (req, res) => {
  const data = await BillingData.aggregate(
    [
      {
        $group: {
          _id: {
            Month: {
              $month: "$date",
            },
            Year: {
              $year: "$date",
            },
          },
          Sales: {
            $sum: "$total",
          },
        },
      },
      {
        $project: {
          Sales: "$Sales",
          Month: {
            $arrayElemAt: [
              [
                "",
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ],
              "$_id.Month",
            ],
          },
        },
      },
      {
        $sort: {
          "_id.Month": 1,
          "_id.Year":1
        }
      }
    ],
    function (err, result) {
      return result;
    }
  );

  res.json({ success: true, data: data });
});
// total sales in a year
app.get("/salesAYear", async (req, res) => {
  const totalSale = await BillingData.aggregate(
    [
      {
        $group: {
          _id: {
            Year: {
              $year: "$date",
            },
          },
          Sales: {
            $sum: "$total",
          },
        },
      },
    ],
    function (err, result) {
      return result;
    }
  );

  res.json({ success: true, data: totalSale });
});
/////
app.get("/netProfit", async(req,res)=>{
  const totalSale = await BillingData.aggregate(
    [
      {
        $group: {
          _id: {
            Year: {
              $year: "$date",
            },
          },
          Sales: {
            $sum: "$total",
          },
        },
      },
    ],
    function (err, result) {
      return result;
    }
  );


  const totalExpense = await ExpenseData.aggregate(
    [
      {
        $group: {
          _id: {
            Year: {
              $year: "$date",
            },
          },
          Expense: {
            $sum: "$amount",
          },
        },
      },
    ],
    function (err, result) {
      return result;
    }
  );

  const totalProfit = totalSale[0].Sales - totalExpense[0].Expense;

  res.json({ success: true, data: {netProfit: totalProfit, totalLoss:totalExpense[0].Expense, 
    totalSales: totalSale[0].Sales,
    totalSalesYear: totalSale[0]._id.Year,
    totalExpenseYear: totalExpense[0]._id.Year
    
  }} );
})


//loss route for expenses
app.get("/loss", async (req, res) => {
  const ExpenseLoss = await ExpenseData.aggregate(
    [
      {
        $group: {
          _id: {
            Month: {
              $month: "$date",
            },
            Year: {
              $year: "$date",
            },
          },
          Loss: {
            $sum: "$amount",
          },
        },
      },
      {
        $project: {
          Loss: "$Loss",
          Month: {
            $arrayElemAt: [
              [
                "",
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ],
              "$_id.Month",
            ],
          },
        },
      },
      {
        $sort: {
          "_id.Month": 1,
          "_id.Year": 1
        }
      }
    ],
    function (err, result) {
      return result;
    }
  );

  res.json({ success: true, data: ExpenseLoss });
});

//expense in a year
app.get("/expenseInAYear", async (req, res) => {
  const totalExpense = await ExpenseData.aggregate(
    [
      {
        $group: {
          _id: {
            Year: {
              $year: "$date",
            },
          },
          Expense: {
            $sum: "$amount",
          },
        },
      },
    ],
    function (err, result) {
      return result;
    }
  );

  res.json({ success: true, data: totalExpense });
});

//database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("We are now connected to MONGODB"))
  .catch((err) => console.log(err));

// 
if(process.env.NODE_ENV === "production"){
  app.use(express.static("client/build"));
  app.get("*",(req,res)=>{
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`We are now connected on port ${port}`);
});
