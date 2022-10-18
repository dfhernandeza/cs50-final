# Family Budget

## Description

A responsive web application created as a tool to keep track and categorize current and future expenses. It allows to schedule expenses and income weekly, monthly, and annually to estimate the cash flow at any desired point in time. It offers a way to organize the family budget for decision-making and a friendly means for data representation through tables and charts.

## Distinctiveness and Complexity

Family budget is a budget tracking tool that uses **Django** models objects to store expenses, income, categories, and schedules. For database query, it was necessary to use the advanced Q class to combine multiple logical conditions.  
I decided to create a complex user interface (over 50 components) with **React.js** (to learn as many functions as possible of this technology), as well as **Bootstrap**, **Charts.js**, and **Fontawesome**.



## Files


### \familybudget

#### helpers.py 
Python file that contains the functions to query and filter database (Django Models). It takes in time units as inputs, returning aggregated expenses and income data as output. 

##### getTransactions
It returns object containing summarized data for the provided filter.

##### transFunction
Populates the transactions list with a dictionary containing lists of expenses and income, the total amount of expenses and income, aggregate amounts by category, and the flow of cash at the end of the day.

##### aggrefateFunc
Returns a list of dicts containing the aggregate result by the provided key.

##### filterFunction
Filters schedules to consider only active schedules on the requested date and generates a list of dicts with clean data. 

###### getdatesBetween
Returns every date object between the start and end date provided.

##### accumulatedFunction
Returns dict containing summarized data. It iterates between start and end dates and stores transactions, aggregated values, and the flow of cash.

#### views.py 
Python file (Django web framework) that contains the method that renders the index html template, plus an API section that allows to expose the business logic and process registration, login, logout, data fetching, etc.

##### isauthenticated(function)
Returns Boolean after verifying if the user is authenticated.

##### logoutuser(function)
Logs user out (GET).

##### loginuser(function)
Logs user in (POST).

##### passwordchange(function)
Updates password of logged user (POST).

##### register(function)
Creates new user inserting it to db. (POST).

##### userinfo(function)
Returns JSON response with user's personal information (GET).

##### updateuserinfo(function)
Updates user's personal info (POST).

##### newtransaction(function)
Inserts new transaction and its schedule to db. (POST).

##### updatetransaction(function)
Updates a transaction (POST).

##### deletetransaction(function)
Deletes a transaction (POST).

##### getcategories(function)
Returns JSON containing id and text to populate html select options (GET).

##### getscheduletypes(function)
Returns JSON with schedule types (GET).

##### getdaysweek(function)
Returns JSON containing days of the week with the "checked" property set to false by default (GET).

##### gettransactions(function)
Returns JSON containing expenses or income grouped by schedule type (GET).

##### closetransaction(function)
Unsubscribes an expense or income schedule (POST).

##### dayweekaddremove(function)
Adds or removes a day from a weekly schedule (POST).

##### updatedayofmonth(function)
Updates day of the month's monthly schedule (POST).

##### updatedayofyear(function)
Updates the yearly schedule's day of the year (POST).

##### updateuniquedate(function)
Updates date of income or expense (POST).

##### updaterangedates(function)
Updates start and end dates of a range (POST).

##### getfilteredtrans(function)
Returns JSON containing filtered lists of income and expenses (GET).

### models.py

##### User(class)
Model to store user data.

##### TransactionType(class)
Model to store transaction type data (it allows to differentiate between income and expense).

##### TransactionCategory(class)
Model to store categories of transactions (food, transportation, etc.).

##### DayWeek(class)
Model to store days of the week (Monday, Tuesday, etc.).

##### DayYear(class)
Model to store day of year schedule data.

##### ScheduleType(class)
Model to store schedule types (weekly, monthly, etc.).

##### Transaction(class)
Model to store transaction data.

##### Schedule(class)
Model to store schedule data (date or dates when transactions would or will occur).


### \familybudget\static\familybudget

#### app.js 

React hooks components (JavaScript and JSX) that hold the root DOM node of the web application and manage the conditional rendering of the different existing sections.

#### functions.js 

JavaScript functions defined in global scope that support the functionality of react components.

#### styles.css 

Cascade Styles Sheets file that holds classes used to add style and transitions to components.

### \familybudget\static\familybudget\components

#### dashboardcomponents.js

React hooks components (JavaScript and JSX) and functions that together result in the user interface. The data fetched asynchronously from the server is represented, filtered, and aggregated over periods of time via tables, charts, and indicators.

#### formcomponents.js

React hooks components (JavaScript and JSX) used to generate form controls such as input, select, date select, checkboxes, and labels. These elements lift state up to be managed at the form level for data submission.

#### regcomponents.js

React hooks components (JavaScript and JSX) to generate the user interface for data submission such as registration, login, new transaction, password change, and user info updating.

#### transactioncomponents.js

React hooks components (JavaScript and JSX) that put together the user interface of the Income and Expenses management section. 

### \familybudget\templates\familybudget

#### index.html 

HTML5 doctype file containing the main schema (head and body), as well as the link and scrip tags required by libraries such as React, Babel, Bootstrap, ChartJS, and CSS files.

## How to run

- Install project dependencies by running pip install -r requirements.txt.
- Run python manage.py makemigrations and python manage.py migrate.

### To provide initial data (if needed)
- Run manage.py loaddata dayweek.json 
- Run manage.py loaddata scheduletype.json
- Run manage.py loaddata transactioncategory.json
- Run manage.py loaddata transactiontype.json
