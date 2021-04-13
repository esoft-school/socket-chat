const express = require('express');
const router = express.Router();
const db = require('../models/db');
const bcrypt = require('bcryptjs');
const uuidv4 = require('uuidv4');

let auth = function(req, res, next) {
    console.log(req.cookies)
    db
        .getToken(req.cookies.token)
        .then((results)=>{
            if (results.length === 0) {
                res.redirect('/login');
            } else {
                next()
            }
        })
        .catch((err)=>{
            next(err);
        })
}

const isValidPassword = function(user, password) {
    return bcrypt.compareSync(password, user.password);
}

router.get('/', auth,  (req, res)=>{
    res.render('index')
});

router.get('/login', (req, res)=>{
    res.render('login');
});

router.get('/logout', (req, res)=>{
    console.log('Logout');
    db.delete(req.cookies.token).then( () => {
        res.clearCookie('token');
        res.render('login');
    });
});

router.post('/registration', (req, res, next)=>{
    console.log(req.body)
    if(req.body.password){
        db
            .getUser(req.body.email)
            .then((results)=>{
                if (results.length === 0){
                    data = {
                        username: req.body.username,
                        email: req.body.email,
                        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
                    };
                    db
                        .add('users', data)
                        .then((results)=>{
                            res.render('login');
                        })
                        .catch((err)=>{
                            next(err);
                        })
                } else {
                    const err = new Error('Такой пользователь уже есть!');
                    err.status = 400;
                    next(err);
                }
            })
            .catch((err)=>{
                next(err);
            })
    } else {
        const err = new Error('Не совпадает пароль и подтверждение пароля!');
        err.status = 400;
        next(err);
    }
})

router.post('/login', (req, res, next)=>{
    console.log(req.body.password)
    db
        .getUser(req.body.email)
        .then((results)=>{
            console.log(results[0])
            if (results[0] === undefined) {
                const err = new Error('Пользователь не найден')
                err.status = 400;
                next(err)
            }
            if (isValidPassword(results[0], req.body.password)) {
                data ={};
                data.login=req.body.email;
                data.token=uuidv4.uuid();
                db
                    .delete(req.body.email)
                    .then((results)=>{
                        db
                            .add('token', data)
                            .then((results)=>{
                                res.cookie('token', results.token, { maxAge: 5 * 60 * 1000, httpOnly: true });
                                res.redirect('/')
                            })
                            .catch((err)=>{
                                next(err)
                            })
                    })
                    .catch((err)=>{
                        next(err)
                    })
            } else {
                const err = new Error('Не верный логин или пароль!');
                err.status = 400;
                next(err);
            }
        })
        .catch((err)=>{
            next(err);
        })
})

module.exports = router;