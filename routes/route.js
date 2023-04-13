const User = require("../schema/userSchema")
const express = require("express")
const router = express.Router();
const jwt = require("jsonwebtoken")
const jwtkey = "user";
const multer = require("multer")
const upload = require("../middlware/upload")
const csv = require("csv-parser");
const fs = require("fs");
// First task
router.post("/", async (req, res) => {
    const user = new User({
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        fullname: req.body.fullname,
        role: req.body.role,
        mobile: req.body.mobile,
        address: req.body.address
    })

    try {
        const doesExit = await User.findOne({ email: user.email })
        if (doesExit) {
            return res.json("already existed")
        }
        const result = await user.save();
        res.status(200).json(result)
    } catch (err) {
        res.send(err)
    }

})

// Second Task
router.post("/login", async (req, res) => {
    const user = await User({
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
    })
    try {
        if (req.body.email && req.body.password) {
            const doesExit = await User.findOne({ email: user.email, password: user.password })
            if (doesExit) {
                jwt.sign({ doesExit }, jwtkey, { expiresIn: "5000s" }, (err, token) => {
                    if (err) {
                        res.status(404).json("error occure")
                    } else {
                        res.json({ doesExit, auth: token });
                    }
                })
            } else {
                res.status(404).json("email or password incorrect")
            }
        } else if (req.body.username && req.body.password) {
            const doesExit = await User.findOne({ username: user.username, password: user.password })
            if (doesExit) {
                jwt.sign({ doesExit }, jwtkey, { expiresIn: "5000s" }, (err, token) => {
                    if (err) {
                        res.status(404).json("error occure")
                    } else {
                        res.status(200).json({ doesExit, auth: token });
                    }
                })
            } else {
                res.status(404).json("email or password incorrect")
            }
        }
        else {
            res.status(404).json("please enter credentials")
        }
    } catch (error) {
        res.status(400).json(error);
    }
})

router.post("/important", async (req, res) => {
    const user = await User({
        email: req.body.email,
        password: req.body.password,
    })
    try {
        if (req.body.email && req.body.password) {
            const doesExit = await User.findOne({ email: user.email, password: user.password })
            const result = await User.updateOne(
                { flag: false },
                {
                    $set: { flag: true }
                })
            res.send(result)
        } else {
            res.status(404).json("email or password incorrect")
        }
    } catch (error) {
        res.status(500).json(error)
    }
})


//b)	Contact details - single user's full details [by mobile number or full name or address]

router.get("/search/:key", async (req, res) => {
    try {
        let result = await User.find({
            "$or": [
                { "fullname": new RegExp(req.params.key, "i") },
                { "mobile": new RegExp(req.params.key, "i") },
                { "address": new RegExp(req.params.key, "i") },
            ]
        })
        res.json({ result });
    } catch (error) {
        res.status(500).json(error)
    }
})

////b)	Contact details - single user's full details [by id]
router.get("/search_id/:key", async (req, res) => {
    try {
        let result = await User.findById(req.params.key)
        res.json({ result });
    } catch (error) {
        res.status(500).json(error)
    }
})


// Sort and Pagination

router.get("/page", paginatedResult(User), async (req, res) => {
    try {
        res.json(res.paginatedResult)
    } catch (error) {
        res.status(500).json(error)
    }
})

function paginatedResult(modal) {
    return async (req, res, next) => {

        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // const result = modal.slice(startIndex,endIndex)
        // res.status(200).json(modal)

        const results = {}

        if (endIndex < await modal.countDocuments().exec()) {
            results.next = {
                page: page + 1,
                limit: limit
            }
        }
        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit
            }
        }

        try {
            results.results = await modal.find().sort({ role: -1 }).limit(limit).skip(startIndex).exec();

            // If dont want to sort data then use this , only pagination
            // results.results = await modal.find().limit(limit).skip(startIndex).exec()
            res.paginatedResult = results;
            next();
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}

router.post("/upload", upload, (req, res) => {
    console.log(req.file.path)
    res.json("file uploaded")
    const result = [];
    try {

        fs.createReadStream(req.file.path).pipe(csv({})).on('data', (data) => {
            result.push(data)
        }).on('end', async () => {

            for (let contact of result) {
                const find = await User.find(contact)
                if (find.length === 1) {
                    console.log("existed data")
                }
                else {
                    const match = await User.findOne({ $and: [{ email: contact.email }, { username: contact.username }] })
                    console.log(match)
                    if (match) {
                        console.log("if condition")
                        await User.updateOne({ email: contact.email }, {
                            $set: {
                                fullname: contact.fullname,
                                role: contact.role,
                                mobile: contact.mobile,
                                address: contact.address,
                                flag: contact.flag
                            }
                        })
                        console.log("updated")
                    } else {
                        const cont = new User(contact);
                        await cont.save();

                    }
                }
            }
        })
    } catch (err) {
        res.send(err)
    }

})


module.exports = router;