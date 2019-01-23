const Paynow = require("paynow");
const Product = require('../models/product');
const User = require('../models/user');
require('dotenv/config');
let paynow = new Paynow(process.env.PAYNOW_ID, process.env.PAYNOW_KEY);


exports.getHomePage = (req, res, next) => {

    Product.findAll()
        .then(products => {
            res.render('carwash', {
                pageTitle: 'Home | DialaWash',
                products: products,
                hasProducts: products.length > 0,
                path: '/',
                errorMessage: null,
                successMessage: null


            })
        })
        .catch(err => console.log(err));

}



// Paynow Ecocash Controller
exports.postEcocash = async (req, res, next) => {

    let { ecocash:ecocashNumber, email, service, price } = req.body;
    
    if (service === 'callout') {
        productId = 1;
        price = 30;
        name = req.body.name;
    } else if (service === 'inhouse') {
        productId = 3;
        price = 20;
    } else {
        productId = 2;
        price = 10;
    }

    // Paynow ecoach flow begins here
    let paynow = new Paynow();
    let payment = paynow.createPayment("Invoice 2", email);
    payment.add("Carwash", 2.0);
    paynow.sendMobile(payment, ecocashNumber, 'ecocash')
        .then((response) => {
            if (response.success) {
                // Get Payment instructions for the selected mobile money method
                let instructions = response.instructions

                // Get poll url for the transaction. This is the url used to check the status of the transaction. 
                // You might want to save this, we recommend you do it
                let pollUrl = response.pollUrl;

                console.log(instructions)

                Product.findAll()
                    .then(products => {
                        let success = 'Ecocash payment successful!';
                        res.render('carwash', {
                            pageTitle: 'Home | DialaWash',
                            products: products,
                            hasProducts: products.length > 0,
                            path: '/',
                            errorMessage: null,
                            successMessage: success


                        })
                    })
                    .catch(err => console.log(err));

            } else {
                console.log(response.error)
                Product.findAll()
                    .then(products => {
                        let error = 'Ecocash payment failed!';
                        return res.render('carwash', {
                            pageTitle: 'Home | DialaWash',
                            products: products,
                            hasProducts: products.length > 0,
                            path: '/',
                            errorMessage: error,
                            successMessage: null


                        })
                    })
                    .catch(err => console.log(err));
            }
        }).catch(ex => {
            // Ahhhhhhhhhhhhhhh
            // *freak out*
            console.log('Your application has broken an axle', ex)
        });
















}