"use strict";
var express = require('express');
//emails
var sendgrid = require('sendgrid')('xxxx', 'xxxxx');
var passport = require('passport');
var router = express.Router();
// db references
var userModel = require('../models/user');
var User = userModel.User;
/* GET login landing page */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Home',
        displayName: req.user ? req.user.displayName : ''
    });
    // if(!req.user) {
    //     res.render('login', {
    //         title: 'Login',
    //         messages: req.flash('loginMessage'),
    //         displayName: req.user ? req.user.displayName : '',
    //         type: req.user? req.user.type : ''
    //     });
    //     return;
    // } else {
    //     return res.redirect('/tickets');
    // }
});
/* Process login request */
/*
router.post('/', passport.authenticate('local', function(req: express.Request, res: express.Response, next: any) {
    if(req.user.type === 'Customer'){
        next.successRedirect = '/mytickets';
        //res.redirect('/mytickets');
    }
    else if(req.user.type === 'Admin'){
        next.successRedirect = '/users';
        //res.redirect('/users');
    }
    else{
        next.failureRedirect= '/login';
        next.failureFlash = true;
    }
}));
*/
router.post('/', passport.authenticate('local', {
    successRedirect: '/tickets',
    failureRedirect: '/login',
    failureFlash: true
}));
/* Render Registration page */
router.get('/register', function (req, res, next) {
    if (!req.user) {
        res.render('register', {
            title: 'Register',
            messages: req.flash('registerMessage'),
            displayName: req.user ? req.user.displayName : '',
            type: req.user ? req.user.type : ''
        });
        return;
    }
    else {
        return res.redirect('/');
    }
});
/* Process Registration Request */
router.post('/register', function (req, res, next) {
    // attempt to register user
    User.register(new User({ username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        displayName: req.body.displayName,
        type: req.body.type
    }), req.body.password, function (err) {
        if (err) {
            console.log('Error Inserting New Data');
            if (err.name == 'UserExistsError') {
                req.flash('registerMessage', 'Registration Error: User Already Exists!');
            }
            return res.render('register', {
                title: 'Register',
                messages: req.flash('registerMessage'),
                displayName: req.user ? req.user.displayName : '',
                type: req.user ? req.user.type : ''
            });
        }
        // if registration is successful
        return passport.authenticate('local')(req, res, function () {
            res.redirect('/tickets');
        });
    });
});
/* Process Logout Request */
router.get('/logout', function (req, res) {
    req.logOut();
    res.redirect('/');
});
/* GET product page. */
router.get('/products', function (req, res, next) {
    res.render('index', {
        title: 'Products',
        displayName: req.user ? req.user.displayName : ''
    });
});
/* GET services page. */
router.get('/services', function (req, res, next) {
    res.render('index', {
        title: 'Services',
        displayName: req.user ? req.user.displayName : '' });
});
/* GET about page. */
router.get('/about', function (req, res, next) {
    res.render('index', {
        title: 'About',
        displayName: req.user ? req.user.displayName : '' });
});
/* GET contact page. */
router.get('/contact', function (req, res, next) {
    req.flash('successmessage', 'Thank You. Your message has been sent.');
    req.flash('errormessage', 'An Error has occurred.');
    res.render('contact', {
        title: 'Contact',
        messages: null,
        displayName: req.user ? req.user.displayName : '',
        type: req.user ? req.user.type : ''
    });
});
/* Email processing */
router.post('/contact', function (req, res, next) {
    sendgrid.send({
        to: 'tsiliopoulos@hotmail.com',
        from: req.body.email,
        subject: 'Contact Form Submission',
        text: "This message has been sent from the contact form at [MongoDB Demo]\r\n\r\n" +
            "Name: " + req.body.name + "\r\n\r\n" +
            "Phone: " + req.body.phone + "\r\n\r\n" +
            req.body.message,
        html: "This message has been sent from the contact form at [MongoDB Demo]<br><br>" +
            "<strong>Name:</strong> " + req.body.name + "<br><br>" +
            "<strong>Phone:</strong> " + req.body.phone + "<br><br>" +
            req.body.message
    }, function (err, json) {
        if (err) {
            res.status(500).json('error');
        }
        res.render('contact', {
            title: 'Contact',
            messages: req.flash('successmessage')
        });
    });
});
/* Render Login Page */
router.get('/login', function (req, res, next) {
    if (!req.user) {
        res.render('login', {
            title: 'Login',
            messages: req.flash('loginMessage'),
            displayName: req.user ? req.user.displayName : '',
            type: req.user ? req.user.type : ''
        });
        return;
    }
    else {
        return res.redirect('/tickets');
    }
});
/* Process Login Request */
router.post('/login', passport.authenticate('local', {
    successRedirect: '/tickets',
    failureRedirect: '/login',
    failureFlash: true
}));
module.exports = router;

//# sourceMappingURL=index.js.map
