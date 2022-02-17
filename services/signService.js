const prisma = require('../services/prismaClientService');
const userAgent = require('user-agents')

const signService = {
    sign: async (res, employeeID, employeeName, loginDay, loginTime, signStatus, signIP) => {
        try {
            let signDay = new Date().toISOString().substring(0, 10).replace(/-/g, '/');
            let signTime = new Date().toLocaleTimeString('en-US', { hour12: false });
            let userAgentData = new userAgent().toString();

            await prisma.$executeRaw`INSERT INTO Test.dbo.Signin
            (EmployeeID, EmployeeName, LoginDay, LoginTime, SignDay, SignTime, SignStatus, SignIP, UserAgent)
            VALUES(${employeeID}, ${employeeName}, ${loginDay}, ${loginTime}, ${signDay}, ${signTime}, ${signStatus}, ${signIP}, ${userAgentData});
            `;

            res.status(201).send({
                status: 'success',
                data: {
                    SignDay: signDay,
                    SignTime: signTime
                }
            });
        } catch (error) {
            res.status(417).send({
                status: 'fail',
                data: '資料重複'
            });
        }
    }
}

module.exports = signService;