var express = require('express');
var router = express.Router();
let roleModel = require('../schemas/roles')
let userModel = require('../schemas/users')

/* GET all roles. */
router.get('/', async function (req, res, next) {
    try {
        let data = await roleModel.find({
            isDeleted: false
        });
        res.send(data);
    } catch (error) {
        res.status(500).send({
            message: error.message
        })
    }
});

/* GET role by id. */
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await roleModel.findOne({
            isDeleted: false,
            _id: id
        });
        if (result) {
            res.send(result)
        } else {
            res.status(404).send({
                message: "Role NOT FOUND"
            })
        }
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
});

/* CREATE new role. */
router.post('/', async function (req, res) {
    try {
        let newRole = new roleModel({
            name: req.body.name,
            description: req.body.description
        })
        await newRole.save()
        res.send(newRole)
    } catch (error) {
        res.status(400).send({
            message: error.message
        })
    }
})

/* UPDATE role by id. */
router.put('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let result = await roleModel.findByIdAndUpdate(
            id, req.body, {
            new: true
        })
        res.send(result)
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
})

/* DELETE role by id (soft delete). */
router.delete('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let result = await roleModel.findOne({
            isDeleted: false,
            _id: id
        });
        if (result) {
            result.isDeleted = true
            await result.save();
            res.send(result)
        } else {
            res.status(404).send({
                message: "Role NOT FOUND"
            })
        }
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
})

/* GET all users by role id. */
router.get('/:id/users', async function (req, res, next) {
    try {
        let roleId = req.params.id;
        
        // Check if role exists
        let roleExists = await roleModel.findOne({
            isDeleted: false,
            _id: roleId
        });

        if (!roleExists) {
            return res.status(404).send({
                message: "Role NOT FOUND"
            })
        }

        let data = await userModel.find({
            isDeleted: false,
            role: roleId
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

module.exports = router;
