let Neighbor = require('../model/neighbor');

function getAll(req, res) {
    Neighbor.find().then((neighbors) => {
        res.send(neighbors);
    }).catch((err) => {
        res.send(err);
    });
}

function getOne(req, res) {
    let id = req.params.id;
    Neighbor.findById(id)
        .then((neighbor) => {
            if (!neighbor) {
                res.status(404).send('Neighbor not found');
            } else {
                res.send(neighbor);
            }
        })
        .catch((err) => {
            res.send(err);
        });
}

function create(req, res) {
    let neighbor = new Neighbor();
    neighbor.name = req.body.name;
    neighbor.avatarUrl = req.body.avatarUrl;
    neighbor.aboutMe = req.body.aboutMe;
    neighbor.phone = req.body.phone;
    neighbor.address = req.body.address;
    neighbor.isFavorite = req.body.isFavorite;
    neighbor.webSite = req.body.webSite;

    console.log(neighbor)

    neighbor.save()
        .then((neighbor) => {
                res.json({message: `${neighbor.name} saved with id ${neighbor.id}!`});
            }
        ).catch((err) => {
        res.send('cant post neighbor ', err);
    });
}

async function update(req, res) {
    console.log(req.body);
    try {
        const neighbor = await Neighbor.findByIdAndUpdate(req.params.id, req.body, {new: true});

        if (!neighbor) {
            return res.status(404).json({message: 'Neighbor not found'});
        }

        res.json({message: 'Updated successfully', neighbor});
    } catch (err) {
        console.error('Error updating neighbor:', err);
        res.status(500).send(err);
    }


}

async function deleteOne(req, res) {
    try {
        const neighbor = await Neighbor.findByIdAndDelete(req.params.id);

        if (!neighbor) {
            return res.status(404).json({message: 'Neighbor not found'});
        }

        res.json({message: `${neighbor.name} deleted successfully`});
    } catch (err) {
        console.error('Error deleting neighbor:', err);
        res.status(500).send(err);
    }

}


module.exports = {getAll, create, getOne, update, deleteOne};
