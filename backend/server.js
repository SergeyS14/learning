const express = require('express')
const app = express()
const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const session = require('express-session')
const path = require('path')

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.log(err.message)
    }
    else {
        console.log('ok')
    }
})
const saltRounds = 10;
app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false}
}))


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'))

app.get('/', (req, res) => {
    const isAuthenticated = !!req.session.user
    res.render('index', {
        title: 'MAIN PAGE',
        message: 'MAIN PAGE',
        isAuthenticated,
        userName: req.session.user?.name
    })
})


app.get('/users', (req, res) => {
    db.all(`SELECT * FROM users`, [], (err, rows) => {
        if (err) {
            console.log(`error get users: ${err.message}`)
            return res.status(500).send('server error')
        }
        res.render('users', {users: rows})
    })
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email и пароль обязательны');
    }

    try {
        // Ищем пользователя по email
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) {
                return res.status(500).send('Ошибка при проверке пользователя');
            }

            if (!row) {
                return res.status(400).send('Пользователь с таким email не найден');
            }

            // Сравниваем введенный пароль с сохраненным хешированным паролем
            const match = await bcrypt.compare(password, row.password);

            if (!match) {
                return res.status(400).send('Неверный пароль');
            }

            req.session.userId = row.id;

            res.redirect('/profile')
        });
    } catch (err) {
        res.status(500).send('Ошибка сервера');
    }
});


app.get('/profile', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');  // Если не авторизован, перенаправить на страницу логина
    }

    // Если пользователь авторизован, выводим личный кабинет
    db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], (err, row) => {
        if (err) {
            return res.status(500).send('Ошибка при получении данных пользователя');
        }

        res.render('profile', { user: row });  // передаем данные в шаблон
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Ошибка при выходе');
        }
        res.send('you logout ept')
    })
})

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return res.status(400).send('Имя, Email и пароль обязательны')
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword], (err) => {
            if (err) {
                console.error('Ошибка при выполнении запроса:', err);
                return res.status(500).send('Ошибка при регистрации пользователя')
            }
            res.redirect('/')
        })
    } catch (err) {
        console.error('Ошибка при хэшировании пароля:', err);
        res.status(500).send('Ошибка сервера')
    }
})

app.post('/users/add', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send('Имя, Email и пароль обязательны');
    }
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
        db.run(query, [name, email, hashedPassword], function(err) {
            if (err) {
                console.error('Ошибка при добавлении пользователя:', err.message);
                return res.status(500).send('Ошибка сервера');
            }

            console.log('Пользователь добавлен:', this.lastID);
            res.redirect('/');
        });
    } catch (error) {
        console.error(error.message)
        res.status(500).send('error server')
    }

});

app.delete('/users/delete/:id', (req, res) => {
    const userId = req.params.id;
    const deleteQuery = `DELETE FROM users WHERE id = ?`;

    db.run(deleteQuery, [userId], function (err) {
        if (err) {
            console.error('Ошибка при удалении пользователя:', err.message);
            return res.status(500).send('Ошибка сервера');
        }

        if (this.changes === 0) {
            return res.status(404).send('Пользователь не найден');
        }

        console.log(`Пользователь с id=${userId} удалён`);
        res.sendStatus(200);
    });
});

app.post('/users/update/:id', async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const { updateEmail, password } = req.body;

    if (!updateEmail || !password) {
        return res.status(400).send('Email и пароль обязательны');
    }

    db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, user) => {
        if (err) {
            return res.status(500).send('error update')
        }
        if (!user) {
            return res.status(404).send('Пользователь не найден');
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return res.status(500).send('Ошибка при проверке пароля');
            }

            if (!result) {
                return res.status(403).send('Неверный пароль');
            }

            const updateQuery = `UPDATE users SET email = ? WHERE id = ?`;
            db.run(updateQuery, [updateEmail, userId], function (err){
                if (err) {
                    return res.status(500).send('error update email')
                }

                console.log(`Email пользователя с id ${userId} обновлен на ${updateEmail}`);
                res.status(200).send('Email обновлен');
            })
        })
    })
});



const PORT = 3000
app.listen(PORT, () => {
    console.log(`server start on port ${PORT}`)
})
