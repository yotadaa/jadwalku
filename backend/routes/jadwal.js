const router = require('express').Router();

let Jadwal = require('../models/jadwal.model');
1
router.route('/add').post((req, res) => {

    const id = req.body.id;
    const judul = req.body.judul;
    const hari = req.body.hari;
    const mulai = req.body.mulai;
    const selesai = req.body.selesai;
    const lokasi = req.body.lokasi;
    const repeat = req.body.repeat;
    const deskripsi = req.body.deskripsi;
    const email = req.body.email;
    const favorite = req.body.favorite;

    const newJadwal = new Jadwal({
        id,
        judul,
        hari,
        mulai,
        selesai,
        lokasi,
        repeat,
        deskripsi,
        email,
        favorite

    })

    newJadwal.save()
        .then(() => res.json('Jadwal Added'))
        .catch(err => res.status(400).json('Error ' + err))
});

router.route('/get').post(async (req, res) => {
    try {
        const { email } = req.body;

        const jadwalArray = await Jadwal.find({ email: email });

        const jadwalObject = jadwalArray.reduce((acc, jadwal) => {
            acc[jadwal._id.toString()] = jadwal;
            return acc;
        }, {});

        res.json({ success: true, jadwal: jadwalObject });
    } catch (error) {
        console.error('Error getting tugas:', error);
        res.status(500).json({ success: false, error: 'Retrieve failed' });
    }
});

router.post('/update-jadwal', async (req, res) => {
    try {
        const email = req.body.email;
        const updated = req.body.updated;

        // Use Jadwal instead of User
        const updatedJadwal = await Jadwal.findOneAndUpdate(
            {
                email: email,
                id: updated.id
            },
            {
                $set: {
                    judul: updated.judul,
                    hari: updated.hari,
                    mulai: updated.mulai,
                    selesai: updated.selesai,
                    lokasi: updated.lokasi,
                    repeat: updated.repeat,
                    deskripsi: updated.deskripsi,
                    favorite: updated.favorite
                }
            },
            {
                upsert: true,
                new: true
            }
        );

        res.json({ success: true });

    } catch (error) {
        console.error('Error updating jadwal:', error);
        res.status(500).json({ success: false, error: 'Update failed' });
    }
});

router.post('/delete', async (req, res) => {
    try {
        const jadwalId = req.body.id;

        const deletedJadwal = await Jadwal.findOneAndDelete({
            id: jadwalId
        });

        if (deletedJadwal) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: 'Jadwal not found' });
        }

    } catch (error) {
        console.error('Error deleting tugas:', error);
        res.status(500).json({ success: false, error: 'Deletion failed' });
    }
});

module.exports = router; 