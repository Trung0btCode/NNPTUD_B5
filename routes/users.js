var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users')

/* TEST ENDPOINT - check request body */
router.post('/test', async function (req, res) {
    console.log("=== TEST ENDPOINT ===");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("Content-Type:", req.get('Content-Type'));
    res.send({
        message: "Test endpoint",
        headers: req.headers,
        body: req.body,
        contentType: req.get('Content-Type')
    })
});

/* CREATE USER - NEW TEST ROUTE */
router.post('/', async function (req, res) {
    try {
        console.log("=== CREATE USER ENDPOINT ===");
        console.log("Request body:", req.body);
        
        if (!req.body.username || !req.body.password || !req.body.email || !req.body.role) {
            return res.status(400).send({
                message: "Missing fields",
                received: req.body
            })
        }

        // Check if role exists
        let roleModel = require('../schemas/roles');
        let roleExists = await roleModel.findOne({
            isDeleted: false,
            _id: req.body.role
        });

        if (!roleExists) {
            return res.status(404).send({
                message: "Role not found"
            })
        }

        let newUser = new userModel({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            fullName: req.body.fullName || "",
            avatarUrl: req.body.avatarUrl || "https://i.sstatic.net/l60Hf.png",
            role: req.body.role,
            status: false,
            loginCount: 0
        })
        
        await newUser.save();
        await newUser.populate('role', 'name description');
        
        console.log("User created successfully:", newUser._id);
        res.status(201).send({
            message: "User created successfully",
            data: newUser
        })
    } catch (error) {
        console.error("Error creating user:", error.message);
        res.status(400).send({
            message: error.message
        })
    }
});

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
        // Debug: log the request body
        console.log("Request body:", req.body);
        
        // Validate required fields
        if (!req.body.username || !req.body.password || !req.body.email || !req.body.role) {
            console.log("Validation failed:", {
                username: req.body.username,
                password: req.body.password,
                email: req.body.email,
                role: req.body.role
            });
            return res.status(400).send({
                message: "Username, password, email and role are required",
                received: {
                    username: req.body.username,
                    password: req.body.password,
                    email: req.body.email,
                    role: req.body.role
                }
            })
        }

        // Check if role exists
        let roleModel = require('../schemas/roles');
        let roleExists = await roleModel.findOne({
            isDeleted: false,
            _id: req.body.role
        });

        if (!roleExists) {
            return res.status(404).send({
                message: "Role not found or invalid role ID"
            })
        }

        let newUser = new userModel({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            fullName: req.body.fullName || "",
            avatarUrl: req.body.avatarUrl || "https://i.sstatic.net/l60Hf.png",
            role: req.body.role,
            status: req.body.status || false,
            loginCount: req.body.loginCount || 0
        })
        await newUser.save()
        
        // Populate role info before sending response
        await newUser.populate({
            path: 'role',
            select: 'name description'
        });
        
        res.status(201).send(newUser)
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
