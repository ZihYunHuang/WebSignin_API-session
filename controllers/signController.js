const signService = require('../services/signService');

const signController = {
    sign: async (req, res) => {
        let EmployeeID = req.body.EmployeeID;
        let EmployeeName = req.body.EmployeeName;
        let LoginDay = req.body.LoginDay;
        let LoginTime = req.body.LoginTime;
        let SignStatus = req.body.SignStatus;

        const ip =
            (req.headers["x-forwarded-for"] || "").split(",").pop() ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        if (req.session.EmployeeID == req.body.EmployeeID) {
            signService.sign(res, EmployeeID, EmployeeName, LoginDay, LoginTime, SignStatus, ip.substring(7, 21));
        } else {
            res.status(401).send({
                status: 'fail',
                data: '登入時間過久，系統已自動登出'
            });
        }
    }
}

module.exports = signController;