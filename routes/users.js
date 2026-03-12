var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users')

/* GET all users. */
router.get('/', async function (req, res, next) {
    try {
        let data = await userModel.find({
            isDeleted: false
        }).populate({
            path: 'role',
            select: 'name description'
        });
        res.send(data);
    } catch (error) {
        res.status(500).send({
            message: error.message
        })
    }
});

/* GET user by id. */
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await userModel.findOne({
            isDeleted: false,
            _id: id
        }).populate({
            path: 'role',
            select: 'name description'
        });
        if (result) {
            res.send(result)
        } else {
            res.status(404).send({
                message: "User NOT FOUND"
            })
        }
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
});

/* CREATE new user. */
router.post('/', async function (req, res) {
    try {
        let newUser = new userModel({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            role: req.body.role,
            status: req.body.status || false,
            loginCount: req.body.loginCount || 0
        })
        await newUser.save()
        res.send(newUser)
    } catch (error) {
        res.status(400).send({
            message: error.message
        })
    }
})

/* UPDATE user by id. */
router.put('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let result = await userModel.findByIdAndUpdate(
            id, req.body, {
            new: true
        }).populate({
            path: 'role',
            select: 'name description'
        })
        res.send(result)
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
})

/* DELETE user by id (soft delete). */
router.delete('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let result = await userModel.findOne({
            isDeleted: false,
            _id: id
        });
        if (result) {
            result.isDeleted = true
            await result.save();
            res.send(result)
        } else {
            res.status(404).send({
                message: "User NOT FOUND"
            })
        }
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
})

/* ENABLE user by email and username. */
router.post('/enable', async function (req, res) {
    try {
        let email = req.body.email;
        let username = req.body.username;

        if (!email || !username) {
            return res.status(400).send({
                message: "Email and username are required"
            })
        }

        let result = await userModel.findOne({
            isDeleted: false,
            email: email,
            username: username
        });

        if (result) {
            result.status = true
            await result.save();
            res.send(result)
        } else {
            res.status(404).send({
                message: "User NOT FOUND"
            })
        }
    } catch (error) {
        res.status(500).send({
            message: error.message
        })
    }
})

/* DISABLE user by email and username. */
router.post('/disable', async function (req, res) {
    try {
        let email = req.body.email;
        let username = req.body.username;

        if (!email || !username) {
            return res.status(400).send({
                message: "Email and username are required"
            })
        }

        let result = await userModel.findOne({
            isDeleted: false,
            email: email,
            username: username
        });

        if (result) {
            result.status = false
            await result.save();
            res.send(result)
        } else {
            res.status(404).send({
                message: "User NOT FOUND"
            })
        }
    } catch (error) {
        res.status(500).send({
            message: error.message
        })
    }
})

module.exports = router;
