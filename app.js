
// Budget controller
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {

        var sum = 0;
        data.allItems[type].forEach(function(cur) {

            sum += cur.value;


        });

        data.totals[type] = sum;

    };

    var data = {
        allItems: {
            exp: [],
            inc: []

        },

        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1

    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            // create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // create new item based on inc or exp
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            //push data to structure 
            data.allItems[type].push(newItem);
            // return the new item
            return newItem;
    

        },

        deleteItem: function(type, id) {

            var ids, index;

            ids = data.allItems[type].map(function(current) {

                return current.id;


            });

            index = ids.indexOf(id);

            if (index !== -1) {

                data.allItems[type].splice(index, 1);
            }


        },

        calculateBudget: function() {

            // calculate total income and expenses 
            calculateTotal('exp');
            calculateTotal('inc');




            //calculate budget income minus expenses 

            data.budget = data.totals.inc - data.totals.exp;



            /// calculate the percentage of income that we spent 

            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp,
                percentage: data.percentage
            }

        },

        testing: function() {
            console.log(data);
        }
    };

})();



// UI controller
var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'

    };

    return {
        getInput: function() {

            return {

                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
            
        },

        addListItem: function(obj,type) {
            var html, newHtml, element;

            // create html string with placehlder tags
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //replace placeholder with actual data

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // Insert html into dom

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


        },

        deleteListItem: function(selectorID) {

            var element = document.getElementById(selectorID);

            element.parentNode.removeChild(element);


        },

        clearFields: function() {
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array) {
                current.value = '';


            });

            // sets focus to first element
            fieldsArray[0].focus();


        },
        displayBudget: function(obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalIncome;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExpense;

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';


            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    };


})();



// App controller 
var controller = (function(budgetCntrl, UIcntrl) {

    var setupEventListners = function() {

        var DOM = UIcntrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', cntrlAddItem);

        document.addEventListener('keypress', function(event) {
     
             if (event.keyCode === 13 || event.which === 13) {
                 cntrlAddItem();
             }
     
     
        });

        document.querySelector(DOM.container).addEventListener('click', cntrlDeleteItem);

    };


    var updateBudget = function() {
        //calculate the budget 
        budgetCntrl.calculateBudget();


       // return the budget 
       var budget = budgetCntrl.getBudget();



       // display the budget ui
       UIcntrl.displayBudget(budget);


    }

    var cntrlAddItem = function() {

        var input, newItem;
         // 1. get the feild input data
         var input = UIcntrl.getInput();

         if (input.description !== "" && !isNaN(input.value) && input.value > 0 ) {

            // 2. add item to budget controller
                newItem = budgetCntrl.addItem(input.type, input.description, input.value);

        // 3. Add item to the UI controller 
                 UIcntrl.addListItem(newItem, input.type);
 
        // 3.1 clear fields 
                UIcntrl.clearFields();
 
        // 4 calculate and update budget 
                 updateBudget();

         }

    
    

    };

    var cntrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

       itemID =event.target.parentNode.parentNode.parentNode.parentNode.id; // DOM Traversing to go back to the top // class="item clearfix"  id income-0

       if (itemID) {

            // inc-1 
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);


            // 1 delete item from data structure 
            budgetCntrl.deleteItem(type, ID);


            // 2 delete item from user interface 

            UIcntrl.deleteListItem(itemID);


            //3 update and display new calculated budget 
            updateBudget();

       }


    };
    return {
        init: function() {
            console.log('app started');
            UIcntrl.displayBudget({ // reset everything to zero when app launches 
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: -1
            });
            setupEventListners();
        }
    }

})(budgetController, UIController);


controller.init();