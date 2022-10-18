/**Form registration component */
function RegisterForm({ onSigningIn }) {
  const [state, setState] = React.useState({
    formData: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      passwordconfirm: "",
      baseline: "",
    },
    errors: {},
  });

  React.useEffect(() => {
    /**Pushes  signin to history's url*/
    history.pushState("", "", "/signin");
  },[]);
  /**Handles form controls value change*/
  function handleChange(target) {
    handleChangeFunction(state, setState, target);
  }

  /**Handles form submission*/
  async function handleSubmit(e) {
    e.preventDefault();
    if (handleValidation()) {
      const url = "/register";
      const method = "POST";
      const resp = await makeCall(url, method, state.formData);
      if (resp.status === 204) {
        onSigningIn({ next: "loginform", result: true }); // redirects user to login view
      }
    }
  }
  /**Handles form validation*/
  function handleValidation() {
    let errors = {};
    let formIsValid = true;

    for (const [key, value] of Object.entries(state.formData)) {
      if (value === "") {
        formIsValid = false;
        errors[key] = `${key} cannot be empty`;
      }
    }
    // Ensure password matches confirmation
    if (state.formData.password !== state.formData.passwordconfirm) {
      errors["confirmation"] = "The passwords must match";
      formIsValid = false;
    }

    setState({
      ...state,
      errors: errors,
    });
    return formIsValid;
  }

  const {
    first_name,
    last_name,
    username,
    email,
    password,
    passwordconfirm,
    baseline,
  } = state.formData;

  return (
    <>
      <div className="mx-auto wdt700 form-border mt-5">
        <h3 className="text-white mb-5">Register Form</h3>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <Input
                name="first_name"
                value={first_name}
                onValueChange={handleChange}
                type="text"
                styles="frmI"
                placeholder="First name"
                autofocus={true}
              />
              {"first_name" in state.errors && (
                <div className="text-danger">{state.errors["first_name"]}</div>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <Input
                name="last_name"
                value={last_name}
                onValueChange={handleChange}
                type="text"
                styles="frmI"
                placeholder="Last name"
                autofocus={false}
              />
              {"last_name" in state.errors && (
                <div className="text-danger">{state.errors["last_name"]}</div>
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-md-4 mb-3">
              <Input
                name="username"
                value={username}
                onValueChange={handleChange}
                type="text"
                styles="frmI"
                placeholder="Username"
                autofocus={false}
              />
              {"username" in state.errors && (
                <div className="text-danger">{state.errors["username"]}</div>
              )}
            </div>
            <div className="col-md-4 mb-3">
              <Input
                name="email"
                value={email}
                onValueChange={handleChange}
                type="email"
                styles="frmI"
                placeholder="Email"
                autofocus={false}
              />
              {"email" in state.errors && (
                <div className="text-danger">{state.errors["email"]}</div>
              )}
            </div>
            <div className="col-md-4 mb-3">
              <Input
                name="baseline"
                value={baseline}
                onValueChange={handleChange}
                type="number"
                styles="frmI"
                placeholder="Baseline"
                autofocus={false}
              />
              {"baseline" in state.errors && (
                <div className="text-danger">{state.errors["baseline"]}</div>
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <Input
                name="password"
                value={password}
                onValueChange={handleChange}
                type="password"
                styles="frmI"
                placeholder="Password"
                autofocus={false}
              />
              {"password" in state.errors && (
                <div className="text-danger">{state.errors["password"]}</div>
              )}
              {"confirmation" in state.errors && (
                <div className="text-danger">
                  {state.errors["confirmation"]}
                </div>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <Input
                name="passwordconfirm"
                value={passwordconfirm}
                onValueChange={handleChange}
                type="password"
                styles="frmI"
                placeholder="Password confirmation"
                autofocus={false}
              />
              {"passwordconfirm" in state.errors && (
                <div className="text-danger">
                  {state.errors["passwordconfirm"]}
                </div>
              )}
              {"confirmation" in state.errors && (
                <div className="text-danger">
                  {state.errors["confirmation"]}
                </div>
              )}
            </div>
          </div>
          <input className="btn btn-outline-light bg-teal mt-3 btn-sm fsinhe" type="submit" value="Submit"/>
        </form>
      </div>
    </>
  );
}
RegisterForm.propTypes = {
  /**Gets called when user is successfuly registered (redirects)*/
  onSigningIn: PropTypes.func,
};

/**Login Form Component  */
function LoginForm({onLogingIn, next}) {
  const [state, setState] = React.useState({
    formData: { username: "", password: "" },
    errors: {},
  });

  React.useEffect(() => {
    /**Pushes login to history's url*/
    history.pushState("", "", "/login");
  },[]);
  /**Handles form controls value change*/
  function handleChange(target) {
    handleChangeFunction(state, setState, target);
  }
  /**Handles form submission*/
  async function handleSubmit(e) {
    e.preventDefault();

    if (handleValidation()) {
      const method = "POST";
      const url = "/loginuser";
      const resp = await makeCall(url, method, state.formData);
      if (resp.status === 204) {
        if (next === "") {
          // sends user to index view
          onLogingIn({ next: "index", result: true });
        } else {
          // sends user to requested url
          onLogingIn({ next: next, result: true });
        }
      }
    }
  }
  /**Handles form validation*/
  function handleValidation() {
    let errors = {};
    let formIsValid = true;

    //username
    if (state.formData.username.trim() === "") {
      formIsValid = false;
      errors["username"] = "Username cannot be empty";
    }

    //password
    if (state.formData.password.trim() === "") {
      formIsValid = false;
      errors["password"] = "Password cannot be empty";
    }
    setState({
      ...state,
      errors: errors,
    });
    return formIsValid;
  }

  const { user, password } = state.formData;

  return (
    <>
      <div className="mx-auto wdt300 form-border mt-5">
        <h3 className="text-white mb-5">Login</h3>
        <form onSubmit={handleSubmit}>
          <div className="row mb-1">
            <div className="col-md-12 mb-4">
              <Input
                styles="frmI"
                name="username"
                value={user}
                onValueChange={handleChange}
                type="text"
                placeholder="Username"
                autofocus={true}
              />
              {"username" in state.errors && (
                <div className="text-danger">{state.errors["username"]}</div>
              )}
            </div>
            <div className="col-md-12 mb-4">
              <Input
                styles="frmI"
                name="password"
                value={password}
                onValueChange={handleChange}
                type="password"
                placeholder="Password"
                autofocus={false}
              />
              {"password" in state.errors && (
                <div className="text-danger">
                  {this.state.errors["password"]}
                </div>
              )}
            </div>
          </div>

          <input
            className="btn btn-outline-light bg-teal btn-sm fsinhe"
            value="Submit"
            type="submit"
          />
        </form>
      </div>
    </>
  );
}
LoginForm.propTypes = {
  /**Gets called when user is successfuly registered (redirects)*/
  onSigningIn: PropTypes.func,
  /**specifies redirect action */
  next: PropTypes.string
};

/**Account Settings Panel*/
function AccountSettings({userisauthenticated, onClick, redirect}) {
  /**Handles button click*/
  function handleClick(e) {
    onClick(e);
  }

  React.useEffect(() => {
    /**Pushes accountsettigs to url's history */
    history.pushState("", "", "/accountsettings");
  }, []);
  if(userisauthenticated)
  {
    return (
      <>
        <div>
          <div
            data-link="changepassword"
            onClick={handleClick}
            className="cp mb-4 btn btn-outline-light bg-steelblue btn-sm fsinhe"
          >
            <i
              className="fa-solid fa-key text-white me-2"
              data-link="changepassword"
              onClick={handleClick}
            ></i>
            <span className="" data-link="changepassword" onClick={handleClick}>
              Change Password
            </span>
          </div>
        </div>
        <div>
          <div
            data-link="personalinfo"
            onClick={handleClick}
            className="cp btn btn btn-outline-light bg-steelblue btn-sm fsinhe"
          >
            <i
              className="fa-solid fa-address-card me-2 text-white"
              data-link="personalinfo"
              onClick={handleClick}
            ></i>
            <span className="" data-link="personalinfo" onClick={handleClick}>
              Update Personal Info
            </span>
          </div>
        </div>
      </>
    );
  }
  else{
    return redirect("accountsettings")
  }
  
}
AccountSettings.propTypes =
{
  /**Specifies whether user is authenticated */
  userisauthenticated: PropTypes.bool,
  /**Gets called when user clicks a button */
  onClick: PropTypes.func,
  /**Gets called if user is not authenticated*/
  redirect: PropTypes.func
}

const changePasswordInitialState = {
  username: "",
  password: "",
  newpassword: "",
  newpasswordconfirm: "", 
}
function ChangePasswordForm({userisauthenticated, redirect, checkAuthentication}) {
  const [state, setState] = React.useState({
    formData: {
      username: "",
      password: "",
      newpassword: "",
      newpasswordconfirm: "",
    },
    errors: {},
    result: "OK",
  });

  /**Handles form's validation */
  function handleValidation() {
    let errors = {};
    let formIsValid = true;

    /**Iterates over formData object keys */
    for (const [key, value] of Object.entries(state.formData)) {
      if (value === "") {
        formIsValid = false;
        errors[key] = `${key} cannot be empty`;
      }
    }
    /**Ensures new password matches confirmation*/
    if (state.formData.newpassword !== state.formData.newpasswordconfirm) {
      errors["confirmation"] = "The passwords must match";
      formIsValid = false;
    }

    setState({
      ...state,
      errors: errors,
    });
    return formIsValid;
  }

  /**
   * sends data to server and updates db
   */
  async function handleSubmit(event) {
    event.preventDefault();
    if (handleValidation()) {
      const url = "/passwordchange";
      const method = "POST";
      const resp = await makeCall(url, method, state.formData);
      if (resp.status === 204) {
        setState({
          ...state,
          formData:changePasswordInitialState,
          result: "Success",
        });
        
      } else {
        setState({ ...state, result: "Error" });
      }
    }
  }

  React.useEffect(() => {
    if(state.result === "Success")
    {
      const timer = setTimeout(() => {checkAuthentication()}, 1500);
      return () => clearTimeout(timer);
    }

  }, [state.result]);



  /**Handles form inputs value change */
  function handleChange(target) {
    handleChangeFunction(state, setState, target);
  }

  /**Pushes accountsettigs to url's history */
  React.useEffect(() => {
    history.pushState("", "", "/passwordupdate");
  }, []);

  const { username, password, newpassword, newpasswordconfirm } = state.formData;

  if(userisauthenticated)
  {
    if(state.result === "Success"){
      return <SuccessCheckmark text={"Password Updated Successfully"}/>
    }
    else{
      return (
        <>
          <div className="mx-auto wdt400 form-border mt-5">
            <h3 className="text-white mb-5">Change Password</h3>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-12 mb-3">
                  <Input
                    name="username"
                    value={username}
                    onValueChange={handleChange}
                    type="text"
                    styles="frmI"
                    placeholder="Username"
                    autofocus={true}
                  />
                  {"username" in state.errors && (
                    <div className="text-danger">{state.errors["username"]}</div>
                  )}
                </div>
                <div className="col-md-12 mb-3">
                  <Input
                    name="password"
                    value={password}
                    onValueChange={handleChange}
                    type="password"
                    styles="frmI"
                    placeholder="Password"
                    autofocus={false}
                  />
                  {"password" in state.errors && (
                    <div className="text-danger">{state.errors["password"]}</div>
                  )}
                </div>
              </div>
              <div className="row">
                <div className="col-md-12 mb-3">
                  <Input
                    name="newpassword"
                    value={newpassword}
                    onValueChange={handleChange}
                    type="password"
                    styles="frmI"
                    placeholder="New Password"
                    autofocus={false}
                  />
                  {"newpassword" in state.errors && (
                    <div className="text-danger">{state.errors["newpassword"]}</div>
                  )}
                  {"confirmation" in state.errors && (
                    <div className="text-danger">
                      {state.errors["confirmation"]}
                    </div>
                  )}
                </div>
                <div className="col-md-12 mb-3">
                  <Input
                    name="newpasswordconfirm"
                    value={newpasswordconfirm}
                    onValueChange={handleChange}
                    type="password"
                    styles="frmI"
                    placeholder="Confirm"
                    autofocus={false}
                  />
                  {"newpasswordconfirm" in state.errors && (
                    <div className="text-danger">
                      {state.errors["newpasswordconfirm"]}
                    </div>
                  )}
                  {"confirmation" in state.errors && (
                    <div className="text-danger">
                      {state.errors["confirmation"]}
                    </div>
                  )}
                </div>
              </div>
              <input
                className="btn btn-outline-light mt-3 mb-3 bg-teal btn-sm fsinhe"
                type="submit"
              />
              {state.result === "Error" && (
                <WarningAlert text="Invalid username and/or password." />
              )}
              {state.result === "Success" && (
                <SuccessAlert text="The password was changed" />
              )}
            </form>
          </div>
        </>
      );
    }
    
  }
  else{
      redirect("changepassword")
  }
  
}
ChangePasswordForm.propTypes =
{
  /**Gets called if user is not authenticated*/
  redirect: PropTypes.func,
  /**Whether user is authenticated or not*/
  isauthenticated: PropTypes.bool
}

/**Update user info form */
function UserInfo({redirect, isauthenticated}) {
  const [state, setState] = React.useState({
    formData: {
      first_name: "",
      last_name: "",
      baseline: "",
      date_joined: "",
    },
    errors: {},
    result: "",
  });

  /**
   * sends data to server and updates db
   */
  async function handleSubmit(e) {
    e.preventDefault();
    if (handleValidationFunction(state, setState)) {
      const url = "/updateuserinfo";
      const method = "POST";
      const resp = await makeCall(url, method, state.formData);
      if (resp.status === 204) {
        setState({ ...state, result: "Success" });
      } else {
        setState({ ...state, result: "Error" });
      }
    }
  }
  /**Handles form controls value change*/
  function handleChange(target) {
    handleChangeFunction(state, setState, target);
  }

  React.useEffect(() => {
    (async () => {
      if (isauthenticated) {
        /**fetch user info */ 
        const resp = await fetch("/getuserinfo");
        const userinfo = await resp.json();
        /**fill form controls with data*/ 
        setState({ ...state, formData: userinfo });
        history.pushState("", "", "/userinfo");
      } else {
        redirect("personalinfo");
      }
    })();

    return () => {
      // this now gets called when the component unmounts
    };
  }, []);

  const { first_name, last_name, date_joined, baseline } = state.formData;

  if (isauthenticated) {
    return (
      <>
        <div className="mx-auto wdt400 form-border mt-5">
          <h3 className="text-white mb-5">User Info</h3>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-12 mb-3">
                <Label text="First Name:" styles="text-white" />
                <Input
                  name="first_name"
                  value={first_name}
                  onValueChange={handleChange}
                  type="text"
                  styles="frmI"
                  placeholder="First name"
                  autofocus={true}
                />
                {"first_name" in state.errors && (
                  <div className="text-danger">
                    {state.errors["first_name"]}
                  </div>
                )}
              </div>
              <div className="col-md-12 mb-3">
                <Label text="Last Name:" styles="text-white" />
                <Input
                  name="last_name"
                  value={last_name}
                  onValueChange={handleChange}
                  type="text"
                  styles="frmI"
                  placeholder="Last name"
                  autofocus={false}
                />
                {"last_name" in state.errors && (
                  <div className="text-danger">{state.errors["last_name"]}</div>
                )}
              </div>
              <div className="col-md-12 mb-3">
                <Label text="Baseline:" styles="text-white" />
                <Input
                  name="baseline"
                  value={baseline}
                  onValueChange={handleChange}
                  type="text"
                  styles="frmI"
                  placeholder="Last name"
                  autofocus={false}
                />
                {"baseline" in state.errors && (
                  <div className="text-danger">{state.errors["baseline"]}</div>
                )}
              </div>
              <div className="col-md-12 mb-3">
                <Label text="Date Joined:" styles="text-white" />
                <DateSelect
                  name="date_joined"
                  value={date_joined}
                  onValueChange={handleChange}
                  styles="frmI"
                  placeholder="Date Joined"
                />
                {"date_joined" in state.errors && (
                  <div className="text-danger">
                    {state.errors["date_joined"]}
                  </div>
                )}
              </div>
            </div>

            <input
              className="btn btn-outline-light mt-3 mb-3 bg-teal btn-sm fsinhe"
              type="submit"
            />
            {state.result === "Error" && (
              <WarningAlert text="An error ocurred." />
            )}
            {state.result === "Success" && (
              <SuccessAlert text="The user info was updated" />
            )}
          </form>
        </div>
      </>
    );
  } else {
    return redirect("personalinfo");
  }
}

UserInfo.propTypes =
{
  /**Gets called if user is not authenticated*/
  redirect: PropTypes.func,
  /**Whether user is authenticated or not*/
  isauthenticated: PropTypes.bool,
  /**Check if user is authenticated */
  checkAuthentication: PropTypes.func
}

/**New transaction form component*/
function NewTransactionForm({type, isauthenticated, header, redirect}) {
  const [state, setState] = React.useState({
    formData: {
      description: "",
      amount: "",
      categoryId: "",
      duedate: "",
      daterange: "",
      idtype: type,
      dayofmonth: "",
      dayofyear: "",
      rangefrom: "",
      rangeto: "",
      weekly: [],
      option: "",
    },
    errors: {},
    categories: [],
    scheduleop: [],
    result: {
      status: "",
      response: "",
    },
    mindate:""
  });

  async function getNewTransInitialState()
{
  const daysofweek = await (await fetch("/getdaysweek")).json();

  return  {
    description: "",
    amount: "",
    duedate: "",
    daterange: "",
    idtype: type,
    categoryId: "",
    dayofmonth: "",
    dayofyear: "",
    rangefrom: "",
    rangeto: "",
    weekly: daysofweek,
    option: "",
  }
}
/** */
React.useEffect(() => {
  if (isauthenticated) {
    (async () => {
      // fetch categories to populate category select options
      const categories = await getSelectData(`/getcategories/${type}`);
      setState(state => ({...state, categories:categories}));
    })();
  }
}, [type]);

  React.useEffect(() => {
    if (isauthenticated) {
      (async () => {
       // fetch categories to populate category select options
        //const categories = await getSelectData(`/getcategories/${type}`);
        // fetch schedules types to populate schedule select options
        const scheduleops = await (await fetch("/getscheduletypes")).json();
        // fetch days of week to populate days of week check boxes
        const daysofweek = await (await fetch("/getdaysweek")).json();
        // fetch date joined
        const date_joined = await (await fetch("/getjoineddate")).json();
        const mindate = new Date(
          parseInt(date_joined.year),
          parseInt(date_joined.month) - 1,
          parseInt(date_joined.day)
        )
          .toISOString()
          .split("T")[0];



        let formData = state.formData;
        // add days of week to state
        formData["weekly"] = daysofweek;

        
        setState(state => ({...state, scheduleop: scheduleops, formData: formData, mindate: mindate}))
        // push state to url
        type === "1"
          ? history.pushState("", "", "/newincome")
          : history.pushState("", "", "/newexpense");
      })();
    }
  }, []);

  React.useEffect(() => {
    if(state.result.status === "Success")
    {
      let result = state.formData;
      result.status = "";
      result.response = "";
      const timer = setTimeout(() => {setState({...state, result: result})}, 1500);
      return () => clearTimeout(timer);
    }

  }, [state.result.status]);



 

 


  /**Handles form inputs change*/
  function handleChange(target) {
    handleChangeFunction(state, setState, target);
  }

  /**Handles change of schedule option selected*/
  function handleOptionChange(e) {
    let formData = state.formData;
    formData["option"] = e.target.dataset.option;
    const errors = state.errors;
    delete errors.option; // removes error
    setState({ ...state, formData: formData, errors: errors });
  }

  /**Handles change when day of the week check box is clicked */
  function handleChangeCheckBox(target) {
    let formData = state.formData;
    // switches bewtween true and false when check box is clicked
    formData.weekly.find(({ day }) => day === target).checked =
      !formData.weekly.find(({ day }) => day === target).checked;
    const errors = state.errors;
    delete errors.weekly; // removes from errors
    setState({
      ...state,
      formData: formData,
      errors: errors,
    });
  }

  /**Handles form submission */
  async function handleSubmit(e) {
    e.preventDefault();
    if (handleValidation()) {
      const url = "/inserttransaction";
      const method = "POST";
      const resp = await makeCall(url, method, state.formData);
      let result = state.result;
      if (resp.status === 204) {
        result.status = "Success";
        result.response = `The ${header} was saved`; // displays success alert

        // resetting to initial state
        const initialstate = await getNewTransInitialState()
        setState({
          ...state,
          result: result,
          formData: initialstate,
        });
      } else {
        result.status = "Error";
        result.response = `An error ocurred`;
        setState({ ...state, result: result });
      }
    }
  }

  /**Handles form validation and adds errors to state's errors object
   * @return bool, true if form is valid
   */
  function handleValidation() {
    let errors = {};
    let formIsValid = true;

    if (state.formData.description === "") {
      errors["description"] = `Please provide a description`;
      formIsValid = false;
    }
    if (state.formData.amount === "") {
      errors["amount"] = `Please provide an amount`;
      formIsValid = false;
    }
    if (state.formData.categoryId === "") {
      errors["categoryId"] = `Please select a category`;
      formIsValid = false;
    }
    // error if no option for schedule is selected
    if (state.formData.option === "") {
      errors["option"] = `Please select an option for schedule`;
      formIsValid = false;
    } else if (state.formData.option === "U" && state.formData.duedate === "") {
      errors["duedate"] = "Please select a date";
      formIsValid = false;
    } else if (state.formData.option === "DOW") {
      let checked = false;
      // iterates over each day of week and ensures that at least one is selected
      state.formData.weekly.forEach(function (item) {
        item.checked && (checked = true);
      });
      if (!checked) {
        errors["weekly"] = "Please select at least one option";
        formIsValid = false;
      }
      
    } else if (
      state.formData.option === "OM" &&
      state.formData.dayofmonth === ""
    ) {
      errors["dayofmonth"] = "Please provide an integer";
      formIsValid = false;
    } else if (
      state.formData.option === "OY" &&
      state.formData.dayofyear === ""
    ) {
      errors["dayofyear"] = "Please select a date";
      formIsValid = false;
    } else if (
      state.formData.option === "R" &&
      (state.formData.rangefrom === "" || state.formData.rangeto === "")
    ) {
      errors["rangefrom"] = "Please select a date from and date to";
      errors["rangeto"] = "Please select a date from and date to";
      formIsValid = false;
    }

    setState({
      ...state,
      errors: errors,
    });
    return formIsValid;
  }

  const {
    description,
    categoryId,
    amount,
    duedate,
    dayofmonth,
    dayofyear,
    rangefrom,
    rangeto,
    weekly,
    option,
  } = state.formData;

  const errors = state.errors;

  if (isauthenticated) {
    return (
      <>
        <div className="mt-5 w-100 px-3">
          <h3 className="text-white mb-4 ">New {header}</h3>
          <form className=" " onSubmit={handleSubmit}>
            <div className="wdt">
              <Select
                name="categoryId"
                styles="frmI mb-3 text-uppercase"
                onValueChange={handleChange}
                data={state.categories}
                value={categoryId}
              />
            </div>
            {"categoryId" in errors && (
              <div className="text-danger">Please select a category</div>
            )}
            <div className="wdt">
              <Input
                name="amount"
                value={amount}
                styles="frmI mb-3 text-uppercase"
                onValueChange={handleChange}
                placeholder="Amount"
              />
            </div>
            {"amount" in errors && (
              <div className="text-danger">Please provide an amount</div>
            )}
            <div>
              <Input
                name="description"
                value={description}
                styles="frmI mb-3 text-uppercase"
                onValueChange={handleChange}
                placeholder="Description"
              />
              {"description" in errors && (
                <div className="text-danger">
                  Please describe the {header}
                </div>
              )}
            </div>
            <div className="wdt mt-3">
              <div class="dropdown">
                <button
                  class="finh btn btn-outline-light me-2 bg-darkcyan dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Schedule
                </button>
                <ul class="dropdown-menu fsinhe">
                  {state.scheduleop.map((item) => (
                    <DropdownItem
                      option={item.option}
                      text={item.text}
                      onOptionClick={handleOptionChange}
                    />
                  ))}
                </ul>
              </div>
            </div>
            {"option" in errors && (
              <div className="text-danger mt-3">{errors.option}</div>
            )}
            <div className="mt-3">
              {option === "U" && (
                <>
                  <InfoAlert text="Unique, only charged on selected date." />
                  <DateSelect
                    value={duedate}
                    min={state.mindate}
                    onValueChange={handleChange}
                    name="duedate"
                    styles="frmI wfitcontent"
                  />
                </>
              )}
              {"duedate" in errors && (
                <div className="text-danger">{errors.duedate}</div>
              )}
              {option === "DOW" && (
                <>
                  <InfoAlert text="Day of the week, select one or more." />
                  <Weekly
                    days={weekly}
                    onChange={handleChangeCheckBox}
                    styles="frmI"
                  />
                </>
              )}
              {"weekly" in errors && (
                <div className="text-danger">{errors.weekly}</div>
              )}
              {option === "OM" && (
                <>
                  <InfoAlert text="Once a month. Provide day of the month (integer greater than 0 and less than 29)" />
                  <Input
                    name="dayofmonth"
                    onValueChange={handleChange}
                    type="number"
                    styles="frmI w-25"
                    min="1"
                    max="28"
                    value={dayofmonth}
                    autofocus={false}
                  />
                </>
              )}
              {"dayofmonth" in errors && (
                <div className="text-danger">{errors.dayofmonth}</div>
              )}
              {option === "OY" && (
                <>
                  <InfoAlert text="Once a year, pick a date, it will be charged every year on that date." />
                  <DateSelect
                    value={dayofyear}
                    onValueChange={handleChange}
                    name="dayofyear"
                    styles="frmI w-50"
                  />
                </>
              )}
              {"dayofyear" in errors && (
                <div className="text-danger">{errors.dayofyear}</div>
              )}
              {option === "R" && (
                <>
                  <InfoAlert text="Range, pick date from and date to." />
                  <DateSelect
                    value={rangefrom}
                    onValueChange={handleChange}
                    min={state.mindate}
                    name="rangefrom"
                    styles="frmI me- wdd"
                  />
                  <i class="fa-solid fa-arrow-right ms-3 me-3 text-white"></i>
                  <DateSelect
                    min={rangefrom}
                    value={rangeto}
                    onValueChange={handleChange}
                    name="rangeto"
                    styles="frmI wdd"
                  />
                </>
              )}
              {("rangefrom" in errors || "rangeto" in errors) && (
                <div className="text-danger">{errors.rangefrom}</div>
              )}
            </div>
            <input
              type="submit"
              value="Submit"
              className="finh btn btn-outline-light bg-indigo mt-3"
            />
            {state.result.status === "Success" && (
              <SuccessAlert text={state.result.response} />
            )}
            {state.result.status === "Error" && (
              <WarningAlert text={state.result.response} />
            )}
          </form>
        </div>
      </>
    );
  } else {
    return redirect("newtransaction");
  }
}

NewTransactionForm.propTypes =
{
  /**Type of transaction (integer 1 for income and 2 for expenses as set in database) */
  type: PropTypes.number,
  /**Whether user is authenticated or not*/
  authenticated: PropTypes.bool,
  /** Type of transaction (Income or Expense) */
  header: PropTypes.string,
  /**Gets called if user is not authenticated*/
  redirect: PropTypes.func
}

function DropdownItem({onOptionClick, link, type, option, text }) {

  /**Handles click on option*/
  function handleClick(e) {
    onOptionClick(e);
  }

  return (
    <li>
      <a
        className="dropdown-item cp"
        data-link={link}
        data-type={type}
        onClick={handleClick}
        data-option={option}
      >
        {text}
      </a>
    </li>
  );
}
DropdownItem.propTypes ={
  /**Gets called when an option from dropdown menu is clicked  */
  onOptionClick: PropTypes.func,
  /**Type of transaction (integer 1 for income and 2 for expenses as set in database) */
  type: PropTypes.number,
  /** View identifier */
  link: PropTypes.string,
  /** Schedule option */
  option: PropTypes.string,
  /** a tag's inner text*/
  text: PropTypes.string

}

/**Succes alert */
function SuccessAlert({text}) {
  return (
    <div
      className="alert alert-success alert-dismissible fade show mt-3"
      role="alert"
    >
      {text}
      <button
        type="button"
        className="btn-close"
        data-bs-dismiss="alert"
        aria-label="Close"
      ></button>
    </div>
  );
}

SuccessAlert.propTypes ={
  /**Alert's inner text to be displayed */
  text: PropTypes.string
}

/**Warning alert */
function WarningAlert({text}) {
  return (
    <div
      className="alert alert-warning alert-dismissible fade show"
      role="alert"
    >
      {text}
      <button
        type="button"
        className="btn-close"
        data-bs-dismiss="alert"
        aria-label="Close"
      ></button>
    </div>
  );
}
WarningAlert.propTypes ={
  /**Alert's inner text to be displayed */
  text: PropTypes.string
}

/**Information alert */
function InfoAlert({text, styles}) {
  return (
    <div class={"alert alert-info wfitcontent " + styles} role="alert">
      {text}
    </div>
  );
}
InfoAlert.propTypes ={
  /**Alert's inner text to be displayed */
  text: PropTypes.string, 
  /**Aditional css*/
  styles: PropTypes.string
}

/**Days of the week checkbox list  */
function Weekly({days, onChange}) {
  return (
    <>
      {days.map((day) => (
        <CheckBox
          label={day.day}
          name={day.day}
          checked={day.checked}
          onChange={onChange}
        />
      ))}
    </>
  );
}
Weekly.propTypes = {
  /**Array of objects {day, checked} */
  days:PropTypes.arrayOf(PropTypes.object),
  /** Gets called when a checkbox is clicked */
  onChange: PropTypes.func
}
/**Renders animated success checkmark */
function SuccessCheckmark({text}) {
  return (
    <div className="pt-5">
    <div class="success-checkmark">
      <div class="check-icon">
        <span class="icon-line line-tip"></span>
        <span class="icon-line line-long"></span>
        <div class="icon-circle"></div>
        <div class="icon-fix"></div>
      </div>
    </div>
    <h3 className="text-center text-success bg-white">{text}</h3>
    </div>
  );
}
SuccessCheckmark.propTypes = {
  /**Specifies text to render */
  text: PropTypes.string
}