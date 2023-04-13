// Upadate the data

router.post("/post",async (req,res)=>{
    const username = req.body.username
    const mobile = req.body.mobile
    try {
        // const doesExit = await User.findOne({ username: username })
        const doesExit = await User.updateOne({username:username},
            {
                $set:{
                    mobile:mobile
                }
            })
        if(doesExit){
            // res.status(200).json(doesExit)
            const result = await User.findOne({username:username})
            res.status(200).json({result})
        }
        else{
            res.status(500).json("give proper username")
        }
    } catch (error) {
        res.status(404).json("Not Found");
    }
})