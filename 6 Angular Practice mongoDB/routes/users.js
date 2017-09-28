var User = require('../models/user');
module.exports = function(router){
    var userRoute = router.route('/users');


    userRoute.get(function(req, res){
        var user = new User();
        user.username = 'jack';
        user.password = '666';
        user.save();
        res.send('<h1>get users</h1>');
        res.end();
    });


    return router;
};