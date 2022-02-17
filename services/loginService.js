const ActiveDirectory = require('activedirectory');
const prisma = require('../services/prismaClientService');

const loginService = {
    adVerification: (req, res, account, password) => {
        let config = {
            url: 'ldap://192.168.22.100',
            baseDN: 'OU=GROUP,DC=ABC,DC=com,DC=tw',
            username: `${account}@example.com.tw`,
            password: password
        };

        let ad = new ActiveDirectory(config);
        ad.authenticate(`${account}@example.com.tw`, password, function (err, auth) {
            if (err) {
                res.status(401).send({
                    status: 'fail',
                    data: 'Login fail'
                });
            }

            if (auth) {
                ad.findUser(account, function (err, user) {
                    if (err) {
                        // 單獨用findUser驗證如帳密錯誤會報錯(會執行登入和find，因此會有兩次response)，所以先使用 ad.authenticate 進行驗證，過濾後再執行 findUser
                        console.log('ERROR: ' + JSON.stringify(err));
                        return;
                    }

                    if (!user) {
                        res.status(401).send({
                            status: 'fail',
                            data: 'Login fail'
                        })
                    } else {
                        // sesssion 認證
                        req.session.EmployeeID = account;

                        res.status(200).send({
                            status: 'success',
                            data: {
                                EmployeeName: user.displayName,
                                LoginDay: new Date().toISOString().substring(0, 10).replace(/-/g, '/'),
                                LoginTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
                                Token: token
                            }
                        })
                    };
                });
            }
            else {
                console.log('Authentication failed!');
            }
        });
    },
    systemVerification: async (res, account, password) => {
        try {
            const user = await prisma.users.findMany({
                where: {
                    EmployeeID: account,
                    Active: 1
                },
                select: {
                    EmployeeID: true
                }
            });

            if (user.length == 0) {
                res.status(401).send({
                    status: 'fail',
                    data: '無系統使用權限'
                })
                return false;
            } else {
                return true;
            }
        } catch (error) {
            console.log(error);
            res.status(417).send({
                status: 'fail',
                data: error
            })
        }
    }
}

module.exports = loginService;