const fs = require('fs');


// get random user user -> /user/random 
exports.randomUser = (req, res) => {
    fs.readFile(__dirname + '/users.json', (err, data) => {
        try {
            if (err) {
                res.send("Failed to read data");
            } else {
                const users = JSON.parse(data);
                if (users.length < 1) {
                    res.send({
                        success: false,
                        message: "No user found!"
                    });
                } else {
                    const randomNumber = Math.ceil(Math.random() * users.length);
                    const randomOne = users.find(user => user.id === randomNumber);
                    res.json(randomOne);
                }

            }
        } catch (error) {
            console.log(error);
            res.end(error.message);
        }
    });
};


// get single specific user info -> /user/:id
exports.specificUser = (req, res) => {
    fs.readFile(__dirname + '/users.json', (err, data) => {
        try {
            if (err) {
                res.send("Enternal Error");
            } else {
                const users = JSON.parse(data);
                const id = Number(req.params.id);
                if (id) {
                    const findUser = users.find(user => user.id === id);
                    if (findUser) {
                        res.json(findUser);
                    } else {
                        res.status(404).send({
                            success: false,
                            message: "User not found!"
                        });
                    }
                }
            }
        } catch (error) {
            console.log(error);
            res.end(error.message);
        }
    });
};






// get all user -> /user/all (can be use query parameta limit={1 to any Number})
exports.allUser = (req, res) => {
    fs.readFile(__dirname + '/users.json', (err, data) => {
        try {
            const users = JSON.parse(data);
            if (err) {
                res.send({
                    success: false,
                    error: "Failed to read data"
                });
            } else {
                if (Number(users) < 1) {
                    res.status(404).send({
                        success: false,
                        message: "No user data found!"
                    });
                }
                else if (Number(req.query.limit) <= users.length) {
                    const limit = Number(req.query.limit);
                    res.status(200).send({
                        length: users.slice(0, limit).length,
                        success: true,
                        data: users.slice(0, limit)
                    });
                } else {
                    res.status(200).send({
                        length: users.length,
                        success: true,
                        data: users
                    });
                }
            }
        } catch (error) {
            console.log(error);
            res.end(error.message);
        }
    });
};


// create a new user -> /user/save
exports.savedUser = (req, res) => {
    fs.readFile(__dirname + '/users.json', (err, data) => {
        try {
            if (!err) {
                const jsonData = JSON.parse(data);
                if (req.body.name && req.body.gender && req.body.photoUrl && req.body.contact && req.body.address) {
                    const newData = {
                        id: jsonData[jsonData.length - 1].id + 1,
                        photoUrl: req.body.photoUrl,
                        name: req.body.name,
                        gender: req.body.gender,
                        contact: req.body.contact,
                        address: req.body.address
                    };
                    jsonData.push(newData);
                    fs.writeFile(__dirname + '/users.json', JSON.stringify(jsonData), (error) => {
                        if (error) {
                            console.log(error);
                        } else {
                            res.status(200).send({
                                success: true,
                                message: "Successfully saved new user."
                            });
                        }
                    });
                } else {
                    res.status(406).send({
                        success: false,
                        message: "Please fulfil all required data."
                    });
                }
            }
        } catch (error) {
            console.log(error);
            res.end(error.message);
        }
    });
};

// update single user info ->  /user/update:id
exports.updateUserInfo = async (req, res) => {
    fs.readFile(__dirname + '/users.json', (err, data) => {
        try {
            if (!err) {
                const users = JSON.parse(data);
                const id = Number(req.params.id);
                if (id) {
                    const findUser = users.find(user => user.id === id);
                    if (findUser) {
                        const bodyData = req.body;
                        if (bodyData.photoUrl || bodyData.name || bodyData.gender || bodyData.contact || bodyData.address) {
                            const newInfo = {
                                photoUrl: bodyData.photoUrl || findUser.photoUrl,
                                name: bodyData.name || findUser.name,
                                gender: bodyData.gender || findUser.gender,
                                contact: bodyData.contact || findUser.contact,
                                address: bodyData.address || findUser.address
                            };
                            findUser.photoUrl = newInfo.photoUrl;
                            findUser.name = newInfo.name;
                            findUser.gender = newInfo.gender;
                            findUser.contact = newInfo.contact;
                            findUser.address = newInfo.address;
                            const newList = users.filter(u => u.id !== findUser.id);
                            newList.push(findUser);
                            newList.sort((a, b) => parseFloat(a.id) - parseFloat(b.id));
                            // console.log(newList);
                            fs.writeFile(__dirname + '/users.json', JSON.stringify(newList), (err) => {
                                if (err) {
                                    res.send({
                                        success: false,
                                        error: err.message
                                    });
                                } else {
                                    res.status(200).send({
                                        success: true,
                                        message: "Successfully update user info"
                                    });
                                }
                            });
                        }
                    } else {
                        res.status(404).send({
                            success: false,
                            message: "User not exist"
                        });
                    }
                }
            }
        } catch (error) {
            console.log(error);
            res.end(error.message);
        }
    });
};


// /user/bulk-update api 
exports.userBulkUpdate = (req, res) => {
    fs.readFile(__dirname + '/users.json', (err, data) => {
        try {
            if (!err) {
                const users = JSON.parse(data);
                const { userNewData } = req.body;
                const filteredUser = [];
                for (const requestedUser of userNewData) {
                    const foundedUsers = users.find(user => user.id === requestedUser.id);
                    if (foundedUsers) {
                        filteredUser.push(foundedUsers);
                    }
                }
                if (filteredUser.length > 0) {
                    const updatedUsers = users.map((user) => {
                        const updatedUser = userNewData.find((u) => u.id === user.id);
                        return updatedUser ? { ...user, ...updatedUser } : user;
                    });
                    fs.writeFile(__dirname + '/users.json', JSON.stringify(updatedUsers), (err) => {
                        if (err) {
                            res.send({
                                success: false,
                                message: err.message
                            });
                        } else {
                            res.status(200).send({
                                success: true,
                                message: "Successfully user information update."
                            });
                        }
                    });
                } else {
                    res.status(404).send({
                        success: false,
                        message: "No mathed Id user found!!"
                    });
                }
            }
        } catch (error) {
            console.log(error);
            res.end(error.message);
        }

    });
};




// delete user -> /user/delete/:id
exports.deleteAnUser = (req, res) => {
    fs.readFile(__dirname + '/users.json', (err, data) => {
        try {
            if (err) {
                res.send("Failed to read data");
            } else {
                const users = JSON.parse(data);
                const id = Number(req.params.id);
                if (id) {
                    const findUser = users.find(user => user.id === id);
                    if (findUser) {
                        const restUsers = users.filter(user => user.id !== id);
                        fs.writeFile(__dirname + '/users.json', JSON.stringify(restUsers), (err) => {
                            if (err) {
                                res.send({
                                    success: false,
                                    error: err.message
                                });
                            } else {
                                res.status(200).send({
                                    success: true,
                                    message: "Successfully deleted user"
                                });
                            }
                        });
                    } else {
                        res.status(404).send({
                            success: false,
                            message: "User not exist"
                        });
                    }
                }
            }
        } catch (error) {
            console.log(error);
            res.end(error.message);
        }
    });
};