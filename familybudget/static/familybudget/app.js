/**Renders App's Layout and control navigation events*/
function App({ userisauthenticated }) {
  /**Gets action from url to conditionally render view*/
  const action = window.location.pathname.replaceAll("/", "");
  const [state, setState] = React.useState({
    authenticated: userisauthenticated,
    next: "",
    type: action === "newexpense" ? "2" : "1",
    views: {
      index: action === "" || action === "index" ? true : false,
      loginform: action === "login" ? true : false,
      signinform: action === "signin" ? true : false,
      expenses:
        action === "expenses" ||
        action === "expensesdow" ||
        action === "expensesom" ||
        action === "expensesoy" ||
        action === "expensesu" ||
        action === "expensesr"
          ? true
          : false,
      income:
        action === "income" ||
        action === "incomedow" ||
        action === "incomeom" ||
        action === "incomeoy" ||
        action === "incomeu" ||
        action === "incomer"
          ? true
          : false,
      accountsettings: action === "accountsettings" ? true : false,
      changepassword: action === "passwordupdate" ? true : false,
      personalinfo: action === "userinfo" ? true : false,
      newtransaction:
        action === "newexpense" || action === "newincome" ? true : false,
    },
    dropdown: [
      { link: "newtransaction", type: "2", text: "Expense" },
      { link: "newtransaction", type: "1", text: "Income" },
    ],
  });

  /**Handles onClick Logout Button's event */
  async function handleClickLogout() {
    /**async call to logout*/
    await fetch("/logout");

    await checkAuthentication();
  }

  async function checkAuthentication() {
    /**Updates global variable authenticated */
    await isauthenticated();
    /**Sets state authenticated property */
    setState({
      ...state,
      authenticated: authenticated,
    });
  }
  /**
   * handles the response after login and register is successfuly completed
   * @param {object} result contains next (string, specifies where user should be redirected) and result (bool, specifies whether result was successful) keys
   */
  async function handleResponse(result) {
    if (result.result) {
      /**Updates global variable authenticated */
      await isauthenticated();
      /**Gets views object */
      let views = renderViews(state.views, result.next);
      /**Sets state's authenticated and views properties */
      setState({
        ...state,
        views: views,
        next: "",
        authenticated: authenticated,
      });
    }
  }

  /**
   * handles redirect when user requests a login required view
   * @param {string} next requested view before redirection
   */
  function handleRedirect(next) {
    /**Gets views object */
    let views = renderViews(state.views, "loginform");
    /**Sets state's authenticated , views and next properties */
    setState({
      ...state,
      next: next,
      views: views,
      authenticated: authenticated,
    });
  }

  /**Handles header buttons click event, renders requested view on state updated
   * */
  function handleClick(e) {
    /**Get's dataset's link property*/
    const link = e.target.dataset.link;
    /**Gets views object */
    let views = renderViews(state.views, link);

    let type = "";
    /**Get's dataset's type property (only when needed)*/
    e.target.dataset.type === undefined
      ? (type = "")
      : (type = e.target.dataset.type);
    setState({ ...state, views: views, type: type });
  }

  return (
    <>
      <div className="container">
        <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom">
          <ul className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
            <li>
              <a
                onClick={handleClick}
                data-link="index"
                className="nav-link px-lg-2 text-white nav-item-custom cp"
              >
                Dashboard
              </a>
            </li>
            <li>
              <a
                onClick={handleClick}
                data-link="income"
                className="nav-link px-lg-2 text-white nav-item-custom cp"
              >
                Income
              </a>
            </li>
            <li>
              <a
                onClick={handleClick}
                data-link="expenses"
                className="nav-link px-lg-2 text-white nav-item-custom cp"
              >
                Expenses
              </a>
            </li>

            {state.authenticated && (
              <>
                <li>
                  <div class="dropdown">
                    <button
                      class="nav-link px-lg-2 text-white dropdown-toggle bg-transparent border border-0 nav-item-custom"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      New
                    </button>
                    <ul class="dropdown-menu fsinhe">
                      {state.dropdown.map((item) => (
                        <DropdownItem
                          key={item.link}
                          onOptionClick={handleClick}
                          link={item.link}
                          type={item.type}
                          text={item.text}
                        />
                      ))}
                    </ul>
                  </div>
                </li>
                <li>
                  <a
                    className="nav-link px-lg-2 text-white cp nav-item-custom"
                    data-link="accountsettings"
                    onClick={handleClick}
                  >
                    Account
                  </a>
                </li>
              </>
            )}
          </ul>

          <div className="col-md-3 text-end">
            <LogButtons
              authenticated={state.authenticated}
              onClickLogout={handleClickLogout}
              onClick={handleClick}
            />
          </div>
        </header>
        <div>
          {/**Conditional view render */}
          {state.views.loginform && (
            <LoginForm onLogingIn={handleResponse} next={state.next} />
          )}
          {state.views.signinform && (
            <RegisterForm onSigningIn={handleResponse} />
          )}
          {state.views.accountsettings && (
            <AccountSettings
              onClick={handleClick}
              redirect={handleRedirect}
              userisauthenticated={state.authenticated}
            />
          )}
          {state.views.changepassword && (
            <ChangePasswordForm
              redirect={handleRedirect}
              userisauthenticated={state.authenticated}
              checkAuthentication={checkAuthentication}
            />
          )}
          {state.views.personalinfo && (
            <UserInfo
              redirect={handleRedirect}
              isauthenticated={state.authenticated}
            />
          )}
          {state.views.newtransaction && (
            <NewTransactionForm
              type={state.type}
              header={state.type === "1" ? "Income" : "Expense"}
              redirect={handleRedirect}
              isauthenticated={state.authenticated}
            />
          )}
          {state.views.expenses && (
            <Transactions
              idtype={2}
              url="expenses"
              transactiontype="Expenses"
              redirect={handleRedirect}
              isauthenticated={state.authenticated}
            />
          )}
          {state.views.income && (
            <Transactions
              idtype={1}
              url="income"
              transactiontype="Income"
              redirect={handleRedirect}
              isauthenticated={state.authenticated}
            />
          )}
          {state.views.index && (
            <Dashboard
              redirect={handleRedirect}
              isauthenticated={state.authenticated}
            />
          )}
        </div>
      </div>
    </>
  );
}
App.propTypes = {
  /**Bool specifies whether user is authenticated or not*/
  isauthenticated: PropTypes.bool,
};

/**Login, Logout, Sign-up buttons conditionally rendered */
function LogButtons({ onClickLogout, onClick, authenticated }) {
  /**Handles Logout button's onClick event */
  function handleClickLogout() {
    onClickLogout();
  }
  /**Handles Login and Sign-up buttons's onClick event */
  function handleClick(e) {
    onClick(e);
  }

  let buttons;
  if (authenticated) {
    buttons = (
      <div>
        <button
          type="button"
          className="btn btn-outline-light me-2 bg-danger nav-item-custom btn-sm fsinhe"
          onClick={handleClickLogout}
        >
          Logout
        </button>
      </div>
    );
  } else {
    buttons = (
      <div>
        <button
          type="button"
          className="btn btn-outline-light me-2 bg-danger nav-item-custom btn-sm fsinhe"
          onClick={handleClick}
          data-link="loginform"
        >
          Login
        </button>
        <button
          type="button"
          className="btn btn-outline-light bg-danger nav-item-custom btn-sm fsinhe"
          onClick={handleClick}
          data-link="signinform"
        >
          Sign-up
        </button>
      </div>
    );
  }

  return buttons;
}

LogButtons.propTypes = {
  /**Gets called when user clicks Logout Button */
  onClickLogout: PropTypes.func,
  /**Gets called when user clicks Login or Sign-Up Buttons */
  onClick: PropTypes.func,
  /**Specifies whether user is authenticated */
  authenticated: PropTypes.bool,
};

await isauthenticated();
/**call to check if user is authenticated before render app*/
ReactDOM.render(
  <React.StrictMode>
    <App userisauthenticated={authenticated} />
  </React.StrictMode>,
  document.querySelector("#app")
);
