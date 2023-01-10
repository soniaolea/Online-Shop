// import all the modules 
const express = require('express');
const path = require('path');

//setup the express validator
const {check, validationResult} = require('express-validator'); //ES6 syntax for deconstructing an object

//database
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mychocolatestore');

const Order = mongoose.model('Order',{
    name : String,
    address : String,
    city : String,
    province : String,
    phone : String,
    email : String,
    subtotal : Number,
    provinceTax : Number,
    total : Number,
    productsNames : Array,
    productsQty : Array,
    productsUnitcost : Array,
    productsSubtotal : Array
});

// create express app
var myApp = express();

//setup middlewares
myApp.use(express.static(path.join(__dirname, 'public')));
// set the view engine and views directory
myApp.set('view engine', 'ejs');
myApp.set('views', __dirname+'/views');
//set up the body parser for extracting form data
myApp.use(express.urlencoded({extended:false}));

// routes
// home page
myApp.get('/', function(req, res){
    res.render('form'); // render form.ejs file from views
});

// get past orders from database
myApp.get('/orders',function(req, res){

    Order.find({}).exec(function(err, orders){

        var pageData = {
            orders : orders
        }

        res.render('orders', pageData); // will render views/orders.ejs

    });

});

//custom validation (at least one product)
function customQuantityValidation(value, {req}){ 

    var darkChocolate = req.body.darkChocolate;
    var milkChocolate = req.body.milkChocolate;
    var truffle = req.body.truffle;
    var whiteChocolate = req.body.whiteChocolate;

    if(darkChocolate <= 0 && milkChocolate <=0 && truffle <= 0 && whiteChocolate <=0){
        throw new Error('You must enter at least one product');
    }
    return true;   
}

//process page post() method for form submission
myApp.post('/receipt',[
    //express validations
    check('name', 'Please enter a name' ).notEmpty(),
    check('address', 'Please enter an address' ).notEmpty(),
    check('city', 'Please enter a city' ).notEmpty(),
    check('province', 'Please select a province' ).notEmpty(),
    check('phone', 'Please enter a valid phone').matches(/^[0-9\s]{10}$/), //validate 10 digit number
    check('email', 'Please enter a valid email').isEmail(),
    check('darkChocolate', 'Please enter a valid T-shirt quantity' ).matches(/^[0-9\s]*$/), //validate only numbers
    check('milkChocolate', 'Please enter a valid Milk Chocolate quantity' ).matches(/^[0-9\s]*$/), //validate only numbers
    check('truffle', 'Please enter a valid Truffle quantity' ).matches(/^[0-9\s]*$/),//validate only numbers
    check('whiteChocolate', 'Please enter a valid White Chocolate quantity' ).matches(/^[0-9\s]*$/), // validate only numbers
    check('whiteChocolate').custom(customQuantityValidation) //validate at least one product
], function(req, res){
    //fetch data
    var name = req.body.name;
    var address = req.body.address;
    var city = req.body.city;
    var province = req.body.province;
    var phone = req.body.phone;
    var email = req.body.email;
    var darkChocolate = req.body.darkChocolate;
    var milkChocolate = req.body.milkChocolate;
    var truffle = req.body.truffle;
    var whiteChocolate = req.body.whiteChocolate;
  
    //declare constant values
    const costDarkChocolate = 3.50;
    const costMilkChocolate = 2.00;
    const costTruffle = 5.00;
    const costWhiteChocolate = 1.50;
    const salesTaxON = 0.13;
    const salesTaxQC = 0.14975;
    const salesTaxNS = 0.15;
    const salesTaxNB = 0.15;
    const salesTaxMB = 0.12;
    const salesTaxBC = 0.05;
    const salesTaxPE = 0.15;
    const salesTaxSK = 0.11;
    const salesTaxAB = 0.05;
    const salesTaxNL = 0.15;
    const salesTaxNT = 0.05;
    const salesTaxNV = 0.05;
    const salesTaxYK = 0.05;

    //fetch the errors 
    const errors = validationResult(req); 

    //if errors are found
    if(!errors.isEmpty()){ 
        //kept user data
        var userData = {
                name: name,
                address: address,
                city: city,
                province: province,
                phone: phone,
                email: email,
                darkChocolate: darkChocolate,
                milkChocolate: milkChocolate,
                truffle: truffle,
                whiteChocolate: whiteChocolate
        }
        //get errors
        var errorsList = errors.array();

        //Store user data and errors
        var pageData = {
            errors: errorsList,
            userData: userData 
        };

        // res.render('form', {errors:errorsList});
        // render form.ejs file from views
        res.render('form', pageData);
    }

    else{
        //calculate unit cost
        var darkUnitCost = darkChocolate * costDarkChocolate; 
        var milkUnitCost = milkChocolate * costMilkChocolate;
        var truffleUnitCost = truffle * costTruffle;
        var whiteUnitCost = whiteChocolate * costWhiteChocolate;
        
        //store cart values in arrays to display products
        var productsNames = ['Dark Chocolate', 'Milk Chocolate', 'Truffle', 'White Chocolate'];
        var productsSubtotal = [darkUnitCost, milkUnitCost, truffleUnitCost, whiteUnitCost];
        var productsQty =[darkChocolate, milkChocolate, truffle, whiteChocolate];
        var productsUnitcost = [3.50, 2, 5, 1.5];

        //calculate subtotal
        var subtotal = darkUnitCost + milkUnitCost + truffleUnitCost + whiteUnitCost;

        //calculate province tax
        var provinceTax = 0;
        
        //Calculate province tax
        if(province == 'ON')
        {
            provinceTax = subtotal * salesTaxON;
        }
        else if(province =='QC')
        {
            provinceTax = subtotal * salesTaxQC;
        }
        else if(province == 'NS')
        {
            provinceTax = subtotal * salesTaxNS;
        }
        else if(province == 'NB')
        {
            provinceTax = subtotal * salesTaxNB;
        }
        else if(province == 'MB')
        {
            provinceTax = subtotal * salesTaxMB;
        }
        else if(province == 'BC')
        {
            provinceTax = subtotal * salesTaxBC;
        }
        else if(province == 'PE')
        {
            provinceTax = subtotal * salesTaxPE;
        }
        else if(province == 'SK')
        {
            provinceTax = subtotal * salesTaxSK;
        }
        else if(province == 'AB')
        {
            provinceTax = subtotal * salesTaxAB;
        }
        else if(province == 'NL')
        {
            provinceTax = subtotal * salesTaxNL;
        }
        else if(province == 'NT')
        {
            provinceTax = subtotal * salesTaxNT;
        }
        else if(province == 'NV')
        {
            provinceTax = subtotal * salesTaxNV;
        }
        else if(province == 'YK')
        {
            provinceTax = subtotal * salesTaxYK;
        }
        
        var total = subtotal + provinceTax;

    ////output data in form
    var pageData = {
        name: name,
        address: address,
        city: city,
        province: province,
        phone: phone,
        email: email,
        subtotal: subtotal.toFixed(2),
        provinceTax: provinceTax.toFixed(2),
        total: total.toFixed(2),
        productsNames: productsNames,
        productsQty: productsQty,
        productsUnitcost: productsUnitcost,
        productsSubtotal: productsSubtotal,
    };
    
    //save data to dabase
    // 1. create an object using a model
    var mychocolatestore = new Order(pageData);
    // 2. Save the object to save the data to the db
    mychocolatestore.save();

    // console.log(pageData);
    // render receipt.ejs file from views
    res.render('receipt', pageData); 
}
});


// listen at a port
myApp.listen(8080);
console.log('Open http://localhost:8080 in the brower');