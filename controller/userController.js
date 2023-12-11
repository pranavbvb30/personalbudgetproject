const model = require('../models/user');
const itemModel = require('../models/item');


//---------

//-----------



exports.new = (req, res)=>{
    res.render('./user/new');
};

exports.create = (req, res, next)=>{
    //res.send('Created a new trade');
    
        let user = new model(req.body);//create a new trade document
    user.save()//insert the document to the database
    .then(user=> res.redirect('/users/login'))
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('/users/new');
        }

        if(err.code === 11000) {
            req.flash('error', 'Email has been used');  
            return res.redirect('/users/new');
        }
        
        next(err);
    }); 
   
    
};

exports.getUserLogin = (req, res, next) => {
        return res.render('./user/login');
}

exports.login = (req, res, next)=>{
    let email = req.body.email;
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            console.log('wrong email address');
            req.flash('error', 'wrong email address');  
            res.redirect('/users/login');
            } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.flash('success', 'You have successfully logged in');

                    res.redirect('/users/profile');
            } else {
                req.flash('error', 'wrong password');      
                res.redirect('/users/login');
            }
            });     
        }     
    })
    .catch(err => next(err));
   
    
};

exports.profile = (req, res, next)=>{
    
    console.log("hello_profile");
    // categories = []
    // res.render('./user/profile',{categories});
    let id = req.session.user;
    console.log(id);
    Promise.all([itemModel.find({user:id})])
    .then(categories=>{
        // categories = new Set(categories)
        console.log("categories",categories);
        res.render('./user/profile', { categories });
    }
    )
    .catch(err=>next(err));
};

exports.getExpenseForm = (req, res, next) => {
    // Retrieve categories from MongoDB and pass them to the template
    let id = req.session.user;
    itemModel.find({user:id})
        .then(categories => {
            let categoryNamesList = categories.map(category => category.name);

            const categoryNamesSet = new Set(categoryNamesList);
            categoryNamesList = Array.from(categoryNamesSet);

            console.log(categoryNamesList);
            res.render('./newExpense', { categoryNamesList });
        })
        .catch(error => {
            console.error('Error retrieving categories:', error);
            res.status(500).send('Internal Server Error.');
        });
};
exports.postExpense = (req, res, next) => {
    // Handle expense submission as described in the previous response
    let expenses = req.body;

    console.log("expenses", expenses);

    let id = req.session.user;
    if (!Array.isArray(expenses.categoryName)){
        expenses.categoryName = [expenses.categoryName]
        expenses.amount = [expenses.amount]
        expenses.month = [expenses.month]
    }
    // Iterate over each category and amount
    for (let i = 0; i < expenses.categoryName.length; i++) {
        console.log("enter");

        const categoryName = expenses.categoryName[i];
        const amount = expenses.amount[i];
        const month = expenses.month[i];

        // Find the category based on its name
        // itemModel.findByIdAndUpdate(id,trade,{useFindAndModify:false,runValidators:true})
        itemModel.findOne({ user: id, name :categoryName,month : month })
            .then(category => {
                if (!category) {
                    throw new Error(`Category not found: ${categoryName}`);
                }
                console.log("Found Category:", category);
                // Update expenses associated with the found category
                return itemModel.updateOne({ user: id, name :categoryName,month : month}, { $inc: { expense: amount } });
            })
            .then(() => {
                console.log(`Expenses updated successfully for category: ${categoryName}`);
            })
            .catch(error => {
                console.error(`Error updating expenses for category ${categoryName}:`, error);
            });
    }
    res.redirect('/users/profile');

};

exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
   
 };



