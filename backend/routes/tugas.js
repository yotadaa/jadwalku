const router = require('express').Router();
let Tugas = require('../models/tugas.model');
let User = require('../models/user.model');


router.route('/add').post((req, res) => {
    try {
        const id = req.body.id;
        const judul = req.body.judul;
        const deadline = req.body.deadline;
        const deskripsi = req.body.deskripsi;
        const email = req.body.email;

        const newTugas = new Tugas({
            id: id,
            judul: judul,
            deadline: deadline,
            deskripsi: deskripsi,
            email: email
        })

        newTugas.save()
            .then(() => {
                res.json(true)
            })
            .catch(err => {
                res.status(400).json('Error ' + err);
                console.log(err)
            })
    } catch (error) {
        console.error('error:', error);
        res.status(500).json({ success: false, error: 'gagal menambahkan' });
    }
});

router.route('/get').post(async (req, res) => {
    try {
        const { email } = req.body;

        const tugasArray = await Tugas.find({ email: email });

        const tugasObject = tugasArray.reduce((acc, tugas) => {
            // Assuming tugas has a unique identifier, use it as the key
            acc[tugas._id.toString()] = tugas;
            return acc;
        }, {});

        res.json({ success: true, tugas: tugasObject });
    } catch (error) {
        console.error('Error getting tugas:', error);
        res.status(500).json({ success: false, error: 'Retrieve failed' });
    }
});

router.route('/get-share').post(async (req, res) => {
    try {
        const user = await User.findOne({ uniqueId: req.body.id });
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        const email = user.email;
        const tugasArray = await Tugas.find({ email: email });
        const tugasObject = tugasArray.reduce((acc, tugas) => {
            // Assuming tugas has a unique identifier, use it as the key
            acc[tugas._id.toString()] = tugas;
            return acc;
        }, {});

        res.json({ email: user.email, name: user.firstName + " " + user.lastName, tugas: tugasObject });
    } catch (error) {
        console.error('Error getting tugas:', error);
        res.status(500).json({ success: false, error: 'Retrieve failed' });
    }
});

router.route('/add-share').post(async (req, res) => {
    try {
        const { email, id } = req.body;

        // Use await to wait for the findOne method to complete
        const user = await User.findOne({ email: email });

        // Check if the user is found
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        //make the sharedTugas didnt keep duplicate values
        await User.findOneAndUpdate(
            { email: user.email },
            { $addToSet: { sharedTugas: id } },
            { upsert: true }
        );
        await user.save();

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating sharedTugas:', error);
        res.status(500).json({ success: false, error: 'Updating failed' });
    }
});


router.route('/share').post((req, res) => {
    try {

        const uniqueId = req.body.uniqueId;
        res.json({ success: true, data: { uniqueId: uniqueId } });
    } catch (error) {
        console.error('Error reading parameter:', error);
        res.status(500).json({ success: false, error: 'Error' });
    }
});


router.post('/delete', async (req, res) => {
    try {
        const taskId = req.body.id;

        const deletedTugas = await Tugas.findOneAndDelete({
            id: taskId
        });

        if (deletedTugas) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: 'Task not found' });
        }

    } catch (error) {
        console.error('Error deleting tugas:', error);
        res.status(500).json({ success: false, error: 'Deletion failed' });
    }
});

router.post('/update-tugas', async (req, res) => {
    try {
        const email = req.body.email;
        const updated = req.body.updated;
        const updatedTugas = await Tugas.findOneAndUpdate(
            {
                email: email,
                id: updated.id
            },
            {
                $set: {
                    judul: updated.judul,
                    deadline: updated.deadline,
                    deskripsi: updated.deskripsi,
                }
            },
            { upsert: true });

        res.json({ success: true })

    } catch (error) {
        console.error('Error updating tugas:', error);
        res.status(500).json({ success: false, error: 'Update failed' });
    }
});


module.exports = router; 