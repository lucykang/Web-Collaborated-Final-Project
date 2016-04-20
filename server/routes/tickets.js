"use strict";
var express = require('express');
var router = express.Router();
var ticketModel = require('../models/ticket');
var Ticket = ticketModel.Ticket;
//utility function to check if user is authenticated
function requireAuth(req, res, next) {
    //check if user is log in
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next();
}
//utitlity to check ticket priority
function checkPriority(urgency, impact) {
    switch (urgency) {
        case 'LOW':
            if (impact == 'LOW') {
                return 5;
            }
            else if (impact == 'MEDIUM') {
                return 4;
            }
            else if (impact == 'HIGH') {
                return 3;
            }
            break;
        case 'MEDIUM':
            if (impact == 'LOW') {
                return 4;
            }
            else if (impact == 'MEDIUM') {
                return 3;
            }
            else if (impact == 'HIGH') {
                return 2;
            }
            break;
        case 'HIGH':
            if (impact == 'LOW') {
                return 3;
            }
            else if (impact == 'MEDIUM') {
                return 2;
            }
            else if (impact == 'HIGH') {
                return 1;
            }
            break;
    }
}
;
//get tickets page
router.get('/', requireAuth, function (req, res, next) {
    var typeUser = req.user ? req.user.type : '';
    if (typeUser == 'Admin') {
        //use the Ticket model to query the Tickets collection
        Ticket.find({}).sort({ 'ticketPriority': 1 }).exec(function (error, tickets) {
            if (error) {
                console.log(error);
                res.end(error);
            }
            else {
                //no error, list of tickets
                res.render('tickets/index', {
                    title: 'Dashboard',
                    tickets: tickets,
                    typeU: typeUser,
                    type: req.user.type,
                    displayName: req.user ? req.user.displayName : ''
                });
            }
        });
    }
    else {
        res.redirect('/tickets/mytickets');
    }
});
// GET my tickets
router.get('/mytickets', requireAuth, function (req, res, next) {
    //var userId = '56ff1229fcd561a00b83d51f';
    //var userId:String = req.user ? req.user.id : ''; 
    var userId = req.user ? req.user.username : '';
    Ticket.find({ 'createdBy': userId }).sort({ 'ticketPriority': 1 }).exec(function (error, tickets) {
        if (error) {
            console.log(error);
            res.end(error);
        }
        else {
            //show the edit view
            res.render('tickets/mytickets', {
                title: 'My Tickets',
                tickets: tickets,
                type: req.user.type,
                displayName: req.user ? req.user.displayName : ''
            });
        }
    });
});
// GET my tickets
router.get('/closed', requireAuth, function (req, res, next) {
    //var userId = '56ff1229fcd561a00b83d51f';
    //var userId:String = req.user ? req.user.id : ''; 
    var typeUser = req.user.type;
    var userId = req.user ? req.user.username : '';
    if (typeUser == 'Admin') {
        Ticket.find({ 'incidentNarrative.ticketStatus': 'Closed' }).sort({ 'ticketPriority': 1 }).exec(function (error, tickets) {
            if (error) {
                console.log(error);
                res.end(error);
            }
            else {
                //show the edit view
                res.render('tickets/mytickets', {
                    title: 'Closed Tickets',
                    tickets: tickets,
                    type: req.user.type,
                    displayName: req.user ? req.user.displayName : ''
                });
            }
        });
    }
    else {
        res.redirect('/tickets');
    }
});
// get add page
router.get('/add', requireAuth, function (req, res, next) {
    res.render('tickets/add', {
        title: 'Create New Ticket',
        type: req.user.type,
        displayName: req.user ? req.user.displayName : ''
    });
});
// POST add page - save the new ticket
router.post('/add', requireAuth, function (req, res, next) {
    var createdBy = req.user ? req.user.username : '';
    var priority = checkPriority(req.body.ticketUrgency, req.body.ticketImpact);
    Ticket.create({
        ticketTitle: req.body.ticketTitle,
        createdBy: createdBy,
        ticketDescription: req.body.ticketDescription,
        customerName: req.body.customerName,
        customerPhone: req.body.customerPhone,
        ticketUrgency: req.body.ticketUrgency,
        ticketImpact: req.body.ticketImpact,
        ticketPriority: priority,
        incidentNarrative: { comment: 'Ticket submitted' }
    }, function (error, Ticket) {
        // did we get back an error or valid Ticket object?
        if (error) {
            console.log(error);
            res.end(error);
        }
        else {
            res.redirect('/tickets');
        }
    });
});
// GET edit page - show the current ticket in the form
router.get('/:id', requireAuth, function (req, res, next) {
    var id = req.params.id;
    var typeUser = req.user ? req.user.type : '';
    if (typeUser == 'Admin') {
        Ticket.findById(id, function (error, Ticket) {
            if (error) {
                console.log(error);
                res.end(error);
            }
            else {
                //show the edit view
                res.render('tickets/edit', {
                    title: 'Ticket Details',
                    ticket: Ticket,
                    typeU: typeUser,
                    type: req.user.type,
                    displayName: req.user ? req.user.displayName : ''
                });
            }
        });
    }
    else {
        Ticket.findById(id, function (error, Ticket) {
            if (error) {
                console.log(error);
                res.end(error);
            }
            else {
                //show the edit view
                res.render('tickets/details', {
                    title: 'Ticket Details',
                    ticket: Ticket,
                    typeU: typeUser,
                    type: req.user.type,
                    displayName: req.user ? req.user.displayName : ''
                });
            }
        });
    }
});
// POST edit page - update the selected ticket
router.post('/:id', requireAuth, function (req, res, next) {
    // grab the id from the url parameter
    var id = req.params.id;
    var priority = checkPriority(req.body.ticketUrgency, req.body.ticketImpact);
    var urgency = req.body.ticketUrgency;
    var impact = req.body.ticketImpact;
    // create and populate a ticket object
    var ticket = new Ticket({
        _id: id,
        ticketTitle: req.body.ticketTitle,
        ticketDescription: req.body.ticketDescription,
        ticketPriority: req.body.ticketPriority,
        customerName: req.body.customerName,
        customerPhone: req.body.customerPhone,
        ticketStatus: req.body.ticketStatus,
        incidentNarrative: [{
                comment: req.body.comment
            }],
    });
    var incidentComment = req.body.comment;
    var incidentStatus = req.body.ticketStatus;
    // run the update using mongoose and our model
    Ticket.update({ _id: id }, { $set: { ticketUrgency: urgency, ticketImpact: impact, ticketPriority: priority } }, function (error) {
        if (error) {
            console.log(error);
            res.end(error);
        }
    });
    // run the update using mongoose and our model
    Ticket.update({ _id: id }, { $push: { incidentNarrative: { comment: incidentComment, ticketStatus: incidentStatus } } }, function (error) {
        if (error) {
            console.log(error);
            res.end(error);
        }
        else {
            //if success update
            res.redirect('/tickets');
        }
    });
});
// make this public
module.exports = router;

//# sourceMappingURL=tickets.js.map
