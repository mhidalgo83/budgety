var budgetController = (function() {
  var Expense = function(id, description, value) {
    (this.id = id),
      (this.description = description),
      (this.value = value),
      (this.percentage = -1);
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    (this.id = id), (this.description = description), (this.value = value);
  };
  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum = sum + cur.value;
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
      var newItem;

      //Creates new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //Create new item based on "exp" or "inc" type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      //Push it into our data structure
      data.allItems[type].push(newItem);

      //Return the new element
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
      //Calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");
      //Calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      //Calculate the percentage of income that we spent
      if (data.totals.inc > 0 && data.totals.inc > data.totals.exp) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentages: function() {
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },
    testing: function() {
      console.log(data);
    }
  };
})();

var UIcontroller = (function() {
  var DOMString = {
    inputType: ".add__type",
    inputDesc: ".add__description",
    inputVal: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage"
  };

  var formatNumber = function(num, type) {
    var numSplit, int, dec;
    /*
    + or - before number
    exactly 2 decimal points 
    comma separating thousands
    */
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split(".");
    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMString.inputType).value, //Will either be inc or exp
        description: document.querySelector(DOMString.inputDesc).value,
        value: parseFloat(document.querySelector(DOMString.inputVal).value)
      };
    },
    addListItem: function(obj, type) {
      var html, newHtml, element;
      //Create HTML string with placeholder text
      if (type === "inc") {
        element = DOMString.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      } else if (type === "exp") {
        element = DOMString.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      }

      //Replace placeholder text with data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));
      //Insert HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    deleteListItem: function(selectorID) {
      var parentEl = document.getElementById(selectorID);
      parentEl.parentNode.removeChild(parentEl);
    },
    clearFields: function() {
      var fields, fieldsArr;

      fields = document.querySelectorAll(
        DOMString.inputDesc + ", " + DOMString.inputVal
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });
      fieldsArr[0].focus();
    },
    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMString.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMString.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMString.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMString.percentageLabel).textContent =
          obj.percentage + " %";
      } else {
        document.querySelector(DOMString.percentageLabel).textContent = "---";
      }
    },
    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMString.expensesPercLabel);

      var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };

      nodeListForEach(fields, function(current, i) {
        if (percentages[i] > 0) {
          current.textContent = percentages[i] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    getDOMString: function() {
      return DOMString;
    }
  };
})();

var controller = (function(budgetCtrl, UIctrl) {
  var setupEventListeners = function() {
    var DOM = UIctrl.getDOMString();
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", function(event) {
      if (event.key === "Enter" || event.which === "Enter") {
        ctrlAddItem();
      }
    });
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
  };

  var updateBudget = function() {
    //Calculate budget
    budgetCtrl.calculateBudget();
    //Return budget
    var budget = budgetCtrl.getBudget();
    //Update UI with new budget
    UIctrl.displayBudget(budget);
  };

  var updatePercentages = function() {
    //1.Calculate percentages
    budgetCtrl.calculatePercentages();
    //2. Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();
    //3. Update the UI with new percentages
    console.log(percentages);
    UIctrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function() {
    var input, newItem;
    //Field input item
    input = UIctrl.getInput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      //Add the item to the UI
      UIctrl.addListItem(newItem, input.type);

      //Clear fields...
      UIctrl.clearFields();
      //Calculate and update budget
      updateBudget();
      //Calculate and update percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);
      //1. Delete item from data structure
      budgetCtrl.deleteItem(type, ID);
      //2. Delete the item from teh UI
      UIctrl.deleteListItem(itemID);
      //3. Update and show new item
      updateBudget();
      //Update percentages
      updatePercentages();
    }
  };

  return {
    init: function() {
      console.log("Application has started");
      UIctrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0
      });
      setupEventListeners();
    }
  };
})(budgetController, UIcontroller);

controller.init();
