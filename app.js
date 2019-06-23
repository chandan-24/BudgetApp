// BUDGET CONTROLLER
var budgetController = (function (){

    // expense function constructor
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this .value = value;
    };

    //income function constructor
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this .value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    // data structure
    var data = {
        allItems:{
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: 0
    };

    // return an object
    return {
        // function to add and income or expense item to the data structure
        addItem: function(type, des, val){
            var newItem, ID;

            // create a new id
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else{
                ID = 0;
            } 
            
            //create new item based on 'inc' and 'exp' type
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }
            else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            // push it into our data
            data.allItems[type].push(newItem);
            // return new element
            return newItem;
        },

        calculateBudget: function(){

            // calculate total income and expense
            calculateTotal('exp');
            calculateTotal('inc');
            
            // calculate the budget: income-expense
            data.budget = data.totals.inc - data.totals.exp;
            
            //calculate the percentage of expenses
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
            }
            else
            {
                data.percentage = -1;
            }
            

        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function(){
            console.log(data);
        }
    }
   
})();




// UI CONTROLLER
var UIController = (function(){

    // all the class of the html documents stored here
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue:'.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage'
    }
    
    // return an object
    return {
        // function to fetch inputs from the fields of the UI
        getInput: function(){
            return{
                type: document.querySelector(DOMstrings.inputType).value, //will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) //will convert the string into floating point number
            };
        },

        // function to add items to the DOM/ UI
        addListItem: function(obj,type){

            var html, newHtml, element;

            //create HTML string with the placholder tag
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }
            else if(type === 'exp'){
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // insert the HTML into the DOM.
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        // function to clear all the input fields.
        clearFields: function(){
            var fields, fieldArray;

            // get all the input fields.
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldArray = Array.prototype.slice.call(fields);

            // for loop on every fields and setting its values to null.
            fieldArray.forEach(function(current, index, array){
                current.value = "";
            });

            // setting the cursor to the description field.
            fieldArray[0].focus();
        },

        displayBudget: function(obj){

            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else
            {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        // function that will return the DOM strings.
        getDOMstings: function(){
            return DOMstrings;
        }
    };

})();




//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){

    // gets the DOM strings from UI module
    var DOM = UICtrl.getDOMstings();

    // Event listeners 
    var setupEventListeners = function(){
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){

            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }

        });
    };

    var updateBudget = function(){
        
        // 1. Calculate the budget.
        budgetCtrl.calculateBudget();

        // 2. Return the budget.
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget the UI.
        UICtrl.displayBudget(budget);
    };

    // function that controls the addition of (income / expense)
    var ctrlAddItem = function(){

        // 1. Get the field input data.
        var input, newItem; 
        input = UICtrl.getInput();
        
        if(input.description !== '' && !isNaN(input.value) && input.value > 0){
            // 2. Add the item to the budget controller.
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI.
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();
            
            // 5. Calculate and update budget
            updateBudget();
        }

    };

    // return an object
    return {
        // initialisation function
        init: function(){
            setupEventListeners()
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            console.log('App started!!!');
        }
    }

})(budgetController, UIController);

controller.init();