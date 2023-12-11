const model = require('../models/item');


//GET

exports.index = (req,res,next)=>{
    
    res.render('trades');
}
//GET trades/new
exports.new = (req,res)=>{
    // res.send('send the new form');
    res.render('./newTrade',);
}



exports.create = (req, res, next) => {
    const { categories } = req.body;
  
    const resultArray = [];
  
    // Loop through the input array with a step of 3
    for (let i = 0; i < categories.length; i += 3) {
      // Extract category, budget, and month
      const category = categories[i];
      const budget = parseInt(categories[i + 1]); // Convert budget to a number
      const month = categories[i + 2];
      resultArray.push({ name: category, budget, month });
    }
  
    const categoryObjects = resultArray.map(({ name, budget, month }) => ({
      name,
      budget,
      month,
      user: req.session.user,
    }));
  
    // Use .then() to wait for the category existence check and save operations
    Promise.all(
      categoryObjects.map((categoryObj) => {
        // Check if the category already exists for the user and month
        return model
          .findOne({
            user: req.session.user,
            name: categoryObj.name,
            month: categoryObj.month,
          })
          .then((existingCategory) => {
            if (existingCategory) {
              // Category already exists, update the budget (or take other actions as needed)
              existingCategory.budget = existingCategory.budget+categoryObj.budget;
              return existingCategory.save();
            } else {
              // Category doesn't exist, create a new one
              return model.create({
                ...categoryObj,
                user: req.session.user,
              });
            }
          });
      })
    )
      .then((savedCategories) => {
        console.log('Categories saved successfully:', savedCategories);
        res.redirect('/users/profile');
      })
      .catch((error) => {
        console.error('Error saving categories:', error);
        // Handle the error, perhaps send an error response to the client
        res.status(500).send('Internal Server Error');
      });
  };
  


// exports.show = (req,res,next)=>{
//     let id = req.params.id;

//     model.findById(id).populate('vendor','firstName lastName')
//     .then(trade=>{
//         if(trade) {
//             console.log(trade);
//             res.render('trade',{trade});        
//         }
//         else {
//             let err = new Error('Cannot find a item with id ' + id);
//             err.status = 404;
//             next(err);
//         }
//     })
//     .catch(err=>next(err));

    
// }

// exports.edit = (req,res,next)=>{
//     let id = req.params.id;
//     model.findById(id)
//     .then(trade=>{
//         console.log("trade: ",trade);
//         if(trade) {
//             console.log("enter");

//             res.render('edit',{trade});
//         }
//         else {
//             let err = new Error('Cannot find a trade with id ' + id);
//             err.status = 404;
//             next(err);
//         }
//     })
//     .catch(err=>next(err));
    
// }

// exports.update = (req,res,next)=>{
//     let trade = req.body;
//     let id = req.params.id;

//     model.findByIdAndUpdate(id,trade,{useFindAndModify:false,runValidators:true})
//     .then(trade=>{
//         if(trade) {
//             res.redirect('/trades/'+id);        
//         }
//         else {
//             let err = new Error('Cannot find a trade with id ' + id);
//             err.status = 404;
//             next(err);
//         }
//     })
//     .catch(err=>{
//         if(err.name === 'ValidationError'){
//             err.status = 400;
//         }
//         next(err);
//     });
    
    
// }
// //delete /trades/:id: by id
// exports.delete = (req,res,next)=>{
//     let id = req.params.id;
    
//     model.findByIdAndDelete(id,{useFindAndModify:false})
//     .then(trade=>{
//         if(trade) {
//             res.redirect('/trades');
//         }
//         else {
//             let err = new Error('Cannot find a trade with id ' + id);
//             err.status = 404;
//             next(err);
//         }
//     })
//     .catch(err=>next(err));
    
// }
