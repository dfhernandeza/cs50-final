/**Transactions container and tab rendering*/
function Transactions({
  url,
  isauthenticated,
  idtype,
  transactiontype,
  redirect,
}) {
  /**gets action from url and renders schedule tab */
  const action = window.location.pathname.replaceAll("/", "").replace(url, "");
  const [state, setstate] = React.useState({
    dow: [],
    om: [],
    oy: [],
    u: [],
    r: [],
    uf: [],
    /** Conditionally renders view (selected = true) */
    views: [
      {
        link: "dow",
        header: "Weekly",
        selected:
          action === "" ||
          action == "dow" ||
          (action != "om" && action != "oy" && action != "u" && action != "r")
            ? true
            : false,
      },
      {
        link: "om",
        header: "Monthly",
        selected: action === "om" ? true : false,
      },
      {
        link: "oy",
        header: "Yearly",
        selected: action === "oy" ? true : false,
      },
      {
        link: "u",
        header: "Unique Date",
        selected: action === "u" ? true : false,
      },
      {
        link: "r",
        header: "Range",
        selected: action === "r" ? true : false,
      },
    ],
    dowData: [],
    scheduleCssTrans: "hiddenscheduleout",
    scheduleEditCssTrans: "hiddenschedulein",
    categories: [],
    mindate: "",
    filterdate: "",
  });

  React.useEffect(() => {
    (async () => {
      if (isauthenticated) {
        /**fetches income or expense categories to populate select input options */
        const categories = await getSelectData(`/getcategories/${idtype}`);
        /**fetch every transacation by schedule */
        const transactions = await (
          await fetch(`/gettransactions/${idtype}`)
        ).json();
        /**fetch date joined to set min date to be selected */
        const date_joined = await (await fetch("/getjoineddate")).json();
        const mindate = new Date(
          parseInt(date_joined.year),
          parseInt(date_joined.month) - 1,
          parseInt(date_joined.day)
        )
          .toISOString()
          .split("T")[0];

        setstate({
          ...state,
          dow: transactions.DOW,
          om: transactions.OM,
          oy: transactions.OY,
          u: transactions.U,
          r: transactions.R,
          categories: categories,
          mindate: mindate,
        });
      }
    })();
  }, []);

  /**changes the displayed tab*/
  function handleClick(e) {
    const linktarget = e.target.dataset.link;
    let views = state.views;
    /**iterates over views object and sets the provided key to true and the rest to false */
    views.forEach(function (item) {
      item.link === linktarget
        ? (item.selected = true)
        : (item.selected = false);
    });

    setstate({ ...state, views: views });
  }

  function handleFilter(target) {
    let filterdate = target.value;
    const filteredarray = state.u.filter((item) => {
      if (item.schedule.datefa === filterdate) {
        return item;
      } else {
        return false;
      }
    });
    setstate({ ...state, uf: filteredarray, filterdate: filterdate });
  }

  function clearFilter() {
    setstate({ ...state, filterdate: "" });
  }
  /**Gets called when data is updated and renders changes*/
  async function updateTransactions() {
    const transactions = await (
      await fetch(`/gettransactions/${idtype}`)
    ).json();
    setstate({
      ...state,
      dow: transactions.DOW,
      om: transactions.OM,
      oy: transactions.OY,
      u: transactions.U,
      r: transactions.R,
    });
    var collapseElementList = [].slice.call(
      document.querySelectorAll(".collapse")
    );
    var collapseList = collapseElementList.map(function (collapseEl) {
      return new bootstrap.Collapse(collapseEl, { toggle: false });
    });
    collapseList.forEach(function (item) {
      item.hide();
    });
  }

  if (isauthenticated) {
    return (
      <div className="mx-auto wdt700">
        <NavBar views={state.views} onClick={handleClick} />
        <div className="p-2 bg-white rounded">
          {/**Conditional rendering */}
          {state.views[0].selected && (
            <WeeklyTransaction
              url={url}
              transactiontype={transactiontype}
              data={state.dow}
              updateFunction={updateTransactions}
              idtype={idtype}
              redirect={redirect}
              authenticated={authenticated}
              categories={state.categories}
            />
          )}
          {state.views[1].selected && (
            <MonthlyTransaction
              url={url}
              transactiontype={transactiontype}
              data={state.om}
              updateFunction={updateTransactions}
              idtype={idtype}
              redirect={redirect}
              authenticated={authenticated}
              categories={state.categories}
            />
          )}
          {state.views[2].selected && (
            <YearlyTransaction
              url={url}
              transactiontype={transactiontype}
              data={state.oy}
              updateFunction={updateTransactions}
              idtype={idtype}
              redirect={redirect}
              authenticated={authenticated}
              categories={state.categories}
            />
          )}
          {state.views[3].selected && (
            <Unique
              mindate={state.mindate}
              url={url}
              transactiontype={transactiontype}
              data={state.u}
              updateFunction={updateTransactions}
              idtype={idtype}
              redirect={redirect}
              authenticated={authenticated}
              categories={state.categories}
              onFilterChange={handleFilter}
              filterdate={state.filterdate}
              filtereddata={state.uf}
              onClearFilter={clearFilter}
            />
          )}
          {state.views[4].selected && (
            <RangeDatesTransactions
              url={url}
              transactiontype={transactiontype}
              data={state.r}
              updateFunction={updateTransactions}
              idtype={idtype}
              redirect={redirect}
              authenticated={authenticated}
              categories={state.categories}
              mindate={state.mindate}
            />
          )}
        </div>
      </div>
    );
  } else {
    return redirect(url);
  }
}
Transactions.propTypes = {
  /**Specifies whether is income or expenses panel*/
  url: PropTypes.string,
  /**Specifies whether user is authenticated or not */
  isauthenticated: PropTypes.bool,
  /**Integer Specifies id of transaction type, 1 for income and 2 por expenses */
  idtype: PropTypes.number,
  /** Specifies transaction type */
  transactiontype: PropTypes.string,
  /***Gets called when user is not authenticated */
  redirect: PropTypes.redirect,
};

/**Navigation Tabs Item */
function NavItem({ onClick, item }) {
  /**Handles <a> element's onClick event */
  function handleClick(e) {
    onClick(e);
  }

  return (
    <li class="nav-item nav-item-custom">
      <a
        data-link={item.link}
        class={item.selected ? "nav-link active" : "nav-link"}
        aria-current="page"
        onClick={handleClick}
      >
        {item.header}
      </a>
    </li>
  );
}
NavItem.propTypes = {
  /**Gets called when <a> element's onClick event is triggered*/
  onClick: PropTypes.func,
  /**Specifies {link, selected, header}*/
  item: PropTypes.object,
};

/**Navigation Tabs Bar*/
function NavBar({ views, onClick }) {
  return (
    <ul class="nav nav-tabs ps-1">
      {views.map((item) => (
        <NavItem item={item} onClick={onClick} />
      ))}
    </ul>
  );
}
NavBar.propTypes = {
  /**Array of objects for each schedule */
  views: PropTypes.arrayOf(PropTypes.object),
  /** Gets called when NavItem's onClick event is triggered */
  onClick: PropTypes.func,
};

/**Table's Title and headers*/
function Header({
  header,
  status,
  filterdate,
  onFilterChange,
  mindate,
  scheduletype,
  onClearFilter,
}) {
  let conditionalheader;
  if (scheduletype === "U") {
    conditionalheader = (
      <div class="row accordion-header px-3 py-2 align-items-end">
        <div class="col-6 f11 fw-bold"> {header}</div>
        <div class="wmaxcontent col-6 f11 fw-bold">
          <div className="row">
            <div className="col-6">Filter:</div>
            <div className="col-6">
              <i
                class="fa-solid fa-filter-circle-xmark ms-1 float-end cp"
                onClick={onClearFilter}
              ></i>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <DateSelect
                value={filterdate}
                onValueChange={onFilterChange}
                min={mindate}
              />
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    conditionalheader = (
      <div class="row accordion-header px-3 py-2">
        <div class="col-12 f11 fw-bold"> {header}</div>
      </div>
    );
  }

  return (
    <div class="text-white ">
      <div class="bg-indigo">{conditionalheader}</div>
      <div class="bg-teal">
        <div class="row w-90 accordion-header px-3 py-2">
          <div class="col-6 f11 fw-bold">Item</div>
          <div class="col-3 f11 fw-bold">Amount</div>
          {status && <div class="col-3 f11 fw-bold">Status</div>}
        </div>
      </div>
    </div>
  );
}
Header.propTypes = {
  /**Specifies table's title */
  header: PropTypes.string,
  /**Specifies whether status col should be displayed */
  status: PropTypes.bool,
  /**Specifies filter date */
  filterdate: PropTypes.string,
  /**Gets called when the user selects a filter date */
  onFilterChange: PropTypes.func,
  /**Specifies minimum date to select */
  mindate: PropTypes.string,
  /**Specifies schedule type */
  scheduletype: PropTypes.string,
  /**Gets called when the user clicks on clear filter button  */
  onClearFilter: PropTypes.func,
};

/**Table row, vertically expandable and collapsible*/
function TransactionBody({ item, status, children }) {
  return (
    <>
      <div className="row">
        <div className="col-12  ">
          <div class="accordion-item">
            <h2 class="accordion-header" id={"flush-heading" + String(item.id)}>
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={"#flush-collapse" + String(item.id)}
                aria-expanded="false"
                aria-controls={"flush-collapse" + String(item.id)}
              >
                <div class="row w-90 align-items-end f9-11-13">
                  <div class="col-6  ">{item.description}</div>
                  <div class="col-3  ">{formatter.format(item.amount)}</div>
                  {status && (
                    <div class="col-3  ">
                      {item.active ? (
                        <span class="badge bg-success">Active</span>
                      ) : (
                        <span class="badge bg-danger">Inactive</span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            </h2>
            <div
              id={"flush-collapse" + String(item.id)}
              class="accordion-collapse collapse"
              aria-labelledby={"flush-heading" + String(item.id)}
              data-bs-parent="#accordionFlushExample"
            >
              <div class="accordion-body">
                <div class="mb-4 fb11-13-15">Schedule</div>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
TransactionBody.propTypes = {
  /**Object, specifies transaction's id, description, amount and active properties*/
  item: PropTypes.object,
  /**Specifies whether status col should be displayed */
  status: PropTypes.bool,
  /**Specifies Schedule React element passed as children */
  children: PropTypes.element,
};

/**Transaction's schedule section*/
function Schedule({
  updateFunction,
  scheduleEditview,
  item,
  categories,
  scheduleview,
  suscribe,
}) {
  const [state, setstate] = React.useState({
    deleteCssTrans: "hiddenscheduleout",
    scheduleCssTrans: "hiddenschedulein",
    scheduleEditCssTrans: "hiddenscheduleout",
  });

  /** shows delete view using transition css */
  function showDelete() {
    setstate({
      ...state,
      deleteCssTrans: "hiddenscheduleinn",
    });
  }
  /** hides delete view using transition css */
  function handleClickCancel() {
    setstate({
      ...state,
      deleteCssTrans: "hiddenscheduleout",
    });
  }
  /** shows edit view using transition css */
  async function handleClickEdit() {
    setstate({
      ...state,
      scheduleCssTrans: "hiddenscheduleout",
      scheduleEditCssTrans: "hiddenschedulein",
      success: "",
    });
  }
  /** hides edit view using transition css and calls updateTransctions function */
  async function handleDone() {
    setstate({
      ...state,
      scheduleEditCssTrans: "hiddenscheduleout",
      scheduleCssTrans: "hiddenschedulein",
    });

    updateFunction();
  }
  return (
    <>
      {/**This section is displayed or hidden using css transition */}
      <div className={state.scheduleEditCssTrans}>
        {/** Clones React Element passed as property and sets onDone property */}
        {React.cloneElement(scheduleEditview, { onDone: handleDone })}
        <hr />
        <EditInputs
          idtransaction={item.id}
          description={item.description}
          amount={item.amount}
          categoryId={item.categoryId}
          onDone={handleDone}
          categories={categories}
        />
      </div>
      {/**This section is displayed or hidden using css transition */}
      <div className={state.scheduleCssTrans}>
        {scheduleview}
        <Controls
          id={item.id}
          onClickEdit={handleClickEdit}
          onClickDelete={showDelete}
        />
      </div>
      <DeleteTransaction
        deleteCssTrans={state.deleteCssTrans}
        onCancel={handleClickCancel}
        idtransaction={item.id}
        updateFunction={updateFunction}
      />
      {/**This section is rendered whether is a recurring schedule or not */}
      {suscribe && (
        <TransactionSubscription
          item={item}
          onUpdate={updateFunction}
          idtransaction={item.id}
        />
      )}
    </>
  );
}
Schedule.propTypes = {
  /**Gets called when data is updated and renders changes*/
  updateFunction: PropTypes.func,
  /** Specifies Schedule Edition Section (React element) to be passed as children*/
  scheduleEditview: PropTypes.element,
  /**Specifies id, description, amount and categoryId */
  item: PropTypes.object,
  /**Specifies categories array */
  categories: PropTypes.arrayOf(PropTypes.object),
  /**Specifies Schedule Section (React element) to be passed as children  */
  scheduleview: PropTypes.element,
  /**Specifies whether subscription section should be rendered */
  suscribe: PropTypes.bool,
};

/**Transaction Subscription Section */
function TransactionSubscription({ onUpdate, item, idtransaction }) {
  const [state, setState] = React.useState({
    date: "",
    unsuscribeCssTrans: "hiddenscheduleout",
    idtransaction: idtransaction,
  });
  /**Unsubscribes schedule and hides interface using transition css*/
  async function handleUnsubscribe() {
    await unsuscribeTransaction(state, state.date, onUpdate);
    setState({
      ...state,
      unsuscribeCssTrans: "hiddenscheduleout",
    });
  }
  /**handles value change of date select input*/
  function handleChange(target) {
    setState({ ...state, date: target.value });
  }
  /**Shows unsuscribe interface using transition css*/
  function handleClick() {
    setState({
      ...state,
      unsuscribeCssTrans: "hiddenscheduleinn",
    });
  }
  /**Hides unsuscribe interface using transition css*/
  function handleClickCancel() {
    setState({
      ...state,
      unsuscribeCssTrans: "hiddenscheduleout",
    });
  }

  const date = state.date;
  return (
    <>
      <hr />
      <div className="align-items-end d-flex row">
        <div className="col-7 col-lg-3 col-md-4 col-sm-3">
          <div>{"Active from " + item.schedule.start}</div>
          {!item.active && <div>{"Active to " + item.schedule.end}</div>}
        </div>
        {item.active && (
          <div className="col-5 col-lg-2 col-md-3 col-sm-3 text-end">
            <span onClick={handleClick} class="badge rounded-pill bg-danger cp">
              Unsubscribe
            </span>
          </div>
        )}
      </div>

      {/** Updating state will trigger transition of element */}
      <div className={state.unsuscribeCssTrans}>
        <div className="mt-2">
          <hr />
          <div className="align-items-end d-flex row">
            <div className="col-7 col-lg-3 col-md-4 col-sm-3">
              <Label text="End Date" />
              <DateSelect
                onValueChange={handleChange}
                value={date}
                styles="bg-trnsp border-0 w-100"
              />
            </div>
            <div className="col-5 col-lg-2 col-md-3 col-sm-3 text-end">
              <button
                onClick={handleUnsubscribe}
                className="btn btn-warning btn-sm rounded-pill fsinhe"
              >
                Confirm
              </button>
            </div>
          </div>
          <InfoAlert
            styles="mt-2"
            text="Choose the date on which the transaction will be unsuscribed."
          />
          <span
            onClick={handleClickCancel}
            class="badge rounded-pill bg-info cp"
            data-caller="unsuscribe"
          >
            Cancel
          </span>
        </div>
      </div>
    </>
  );
}
TransactionSubscription.propTypes = {
  /**Updates data after unsubscription */
  onUpdate: PropTypes.func,
  /**Specifies schedule's star, end and active properties*/
  item: PropTypes.object,
  /**Specifies transaction's id*/
  idtransaction: PropTypes.string,
};

/**Edit and Delete buttons Section */
function Controls({ onClickEdit, onClickDelete, id }) {
  /**Shows edit interface using transition css*/
  function handleClick(e) {
    onClickEdit(e);
  }

  /**Shows delete interface using transition css*/
  function handleClickDelete() {
    onClickDelete();
  }

  return (
    <div className="mt-3 fs-6 fst-italic">
      <span data-id={id} onClick={handleClick} class="badge text-bg-primary cp">
        Edit
      </span>
      <span class="badge text-bg-dark ms-2 cp" onClick={handleClickDelete}>
        Delete
      </span>
    </div>
  );
}
Controls.propTypes = {
  /**Gets called when Edit button's click evenet is triggered */
  onClickEdit: PropTypes.func,
  /**Gets called when Delete button's click evenet is triggered */
  onClickDelete: PropTypes.func,
  /**Integer, specifies transaction's id */
  id: PropTypes.string,
};

/**Transaction's update inputs*/
function EditInputs({
  idtransaction,
  description,
  amount,
  categoryId,
  onDone,
  categories,
}) {
  const [state, setState] = React.useState({
    formData: {
      id: idtransaction,
      description: description,
      amount: amount,
      categoryId: categoryId,
    },
    categories: [],
    errors: {},
  });

  /**Handles data submission */
  async function handleSubmit() {
    if (handleValidationFunction(state, setState)) {
      const url = "/updatetransaction";
      const method = "POST";
      const resp = await makeCall(url, method, state.formData); // sends data to server (updates db)
      if (resp.status === 204) {
        onDone();
      }
    }
  }

  /**Handles form's controls onChange event */
  function handleChange(target) {
    handleChangeFunction(state, setState, target);
  }

  const statedescription = state.formData.description;
  const stateamount = state.formData.amount;
  const statecategoryId = state.formData.categoryId;

  return (
    <>
      <div className="mb-4 fb11-13-15">Transaction</div>
      <div className="row">
        <div className="col-8">
          <Label text="Description:" />
          <Input
            value={statedescription}
            styles="bg-transparent editInput w-100 text-uppercase"
            name="description"
            type="text"
            onValueChange={handleChange}
          />
          {"description" in state.errors && (
            <div className="text-danger">Please provide a description</div>
          )}
        </div>
        <div className="col-4">
          <Label text="Amount:" />
          <Input
            value={stateamount}
            styles="bg-transparent editInput w-100"
            name="amount"
            type="text"
            onValueChange={handleChange}
          />
          {"amount" in state.errors && (
            <div className="text-danger">Please provide an amount</div>
          )}
        </div>
        <div className="col-8 pt-3">
          <Label text="Category:" />
          <Select
            name="categoryId"
            styles="bg-transparent editInput w-100"
            onValueChange={handleChange}
            data={categories}
            value={statecategoryId}
          />
          {"categoryId" in state.errors && (
            <div className="text-danger">Please select a category</div>
          )}
        </div>
      </div>
      <span
        class="badge text-bg-primary mt-3 fsinhe fst-italic cp"
        onClick={handleSubmit}
      >
        Done
      </span>
    </>
  );
}
EditInputs.propTypes = {
  /**Specifies transaction's id */
  idtransaction: PropTypes.string,
  /**Specifies transaction's description*/
  description: PropTypes.string,
  /**Specifies transaction's amount */
  amount: PropTypes.string,
  /**Specifies transaction's category id */
  categoryId: PropTypes.string,
  /**Gets called when data is succesfully submitted */
  onDone: PropTypes.func,
  /**Specifies categories for type of transaction*/
  categories: PropTypes.arrayOf(PropTypes.object),
};
/**Delete Transaction */
function DeleteTransaction({
  onCancel,
  updateFunction,
  deleteCssTrans,
  idtransaction,
}) {
  /**Hides delete interface using transition css*/
  function handleClickCancel(e) {
    onCancel(e);
  }

  /**Deletes a transaction */
  async function deleteTransaction(e) {
    const body = { id: e.target.dataset.id }; // transaction id is stored in dataset object
    const url = "/deletetransaction";
    const method = "PUT";
    const resp = await makeCall(url, method, body);
    if (resp.status === 204) {
      onCancel();
      updateFunction();
    }
  }
  return (
    <div className={deleteCssTrans}>
      <hr />
      <div class="alert alert-info" role="alert">
        <div>Are you sure you want to delete this?</div>
        <div>
          <span
            data-id={idtransaction}
            onClick={deleteTransaction}
            class="badge rounded-pill bg-danger cp mt-2 me-2"
          >
            Confirm
          </span>
          <span
            onClick={handleClickCancel}
            data-caller="delete"
            class="badge rounded-pill bg-primary cp mt-2"
          >
            Cancel
          </span>
        </div>
      </div>
    </div>
  );
}
DeleteTransaction.propTypes = {
  /**Gets called when Cancel's onClick event is triggered*/
  onCancel: PropTypes.func,
  /**Get called when transaction is succesfully deleted*/
  updateFunction: PropTypes.func,
  /** Css for component's transition*/
  deleteCssTrans: PropTypes.string,
  /**Scpecifies Transaction's id */
  idtransaction: PropTypes.string,
};

/**Transaction Table Outter Component */
function Transaction({
  header,
  status,
  data,
  categories,
  suscribe,
  updateFunction,
  scheduleview,
  scheduleEditview,
  filteredarray,
  filterdate,
  onFilterChange,
  mindate,
  scheduletype,
  onClearFilter,
}) {
  let renderdata = [];

  if (scheduletype !== "U") {
    renderdata = data;
  } else if (filterdate === "") {
    renderdata = data;
  } else {
    renderdata = filteredarray;
  }

  return (
    <>
      <Header
        header={header}
        status={status}
        filterdate={filterdate}
        onFilterChange={onFilterChange}
        mindate={mindate}
        scheduletype={scheduletype}
        onClearFilter={onClearFilter}
      />
      {renderdata.length === 0 && (
        <div
          class="accordion accordion-flush noResultsBox text-orangered"
          id="accordionFlushExample"
        >
          <NoResulstComponent />
        </div>
      )}
      {renderdata.length > 0 && (
        <div class="accordion accordion-flush" id="accordionFlushExample">
          {/** -Iterate over each record in renderdata property
           *   -Item represents one expense or income for a specific type of schedule
           */}
          {renderdata.map((item) => (
            <TransactionBody item={item} status={status}>
              {/**Scheduleview and scheduleEditview components are passed as children of Schedule component */}
              <Schedule
                categories={categories}
                suscribe={suscribe}
                item={item}
                updateFunction={updateFunction}
                scheduleview={React.cloneElement(scheduleview, {
                  schedule: item.schedule,
                })}
                scheduleEditview={React.cloneElement(scheduleEditview, {
                  schedule: item.schedule,
                })}
              />
            </TransactionBody>
          ))}
        </div>
      )}
    </>
  );
}
Transaction.propTypes = {
  /**Table title according to type of schedule and transaction */
  header: PropTypes.string,
  /**Whether status table header should be displayed  */
  status: PropTypes.bool,
  /**Array of objects containig data for respective schedule */
  data: PropTypes.arrayOf(PropTypes.object),
  /**Array of objects containig categories for the respective type of transaction */
  categories: PropTypes.arrayOf(PropTypes.object),
  /**Whether susbscription section should be rendered */
  suscribe: PropTypes.bool,
  /**Gets called when database changes have been made successfully */
  updateFunction: PropTypes.func,
  /**React Element representing a section containing schedule info*/
  scheduleview: PropTypes.element,
  /**React Element representing a section containing form controls to update schedule info */
  scheduleEditview: PropTypes.element,
  /**Specifies filtered data by selected date */
  filteredarray: PropTypes.arrayOf(PropTypes.object),
  /**Specifies filter date */
  filterdate: PropTypes.string,
  /**Gets called when the user selects a filter date */
  onFilterChange: PropTypes.func,
  /**Specifies minimum date to select */
  mindate: PropTypes.string,
  /**Specifies schedule type */
  scheduletype: PropTypes.string,
  /**Gets called when the user clicks on clear filter button  */
  onClearFilter: PropTypes.func,
};

/**Contains a table of transactions of weekly schedule*/
function WeeklyTransaction({
  authenticated,
  url,
  transactiontype,
  data,
  updateFunction,
  categories,
}) {
  React.useEffect(() => {
    if (authenticated) {
      history.pushState("", "", `/${url}/dow`);
    }
  }, []);

  return (
    <Transaction
      header={`Weekly ${transactiontype}`}
      status={true}
      data={data}
      updateFunction={updateFunction}
      scheduleview={<WeeklySchedule />}
      scheduleEditview={<EditWeeklySchedule />}
      suscribe={true}
      categories={categories}
    />
  );
}
WeeklyTransaction.propTypes = {
  /**Specifies whether user is authenticated or not */
  authenticated: PropTypes.bool,
  /** Specifies whether is income or expenses panel */
  url: PropTypes.string,
  /**Specifies whether is income or expense transaction*/
  transactiontype: PropTypes.string,
  /**Array of objects containig categories for the respective type of transaction */
  data: PropTypes.arrayOf(PropTypes.object),
  /**Gets called when database changes have been made successfully*/
  updateFunction: PropTypes.func,
  /**Array of objects containig categories for the respective type of transaction */
  categories: PropTypes.bool,
};

/**Section containing weekly schedule info */
function WeeklySchedule({ schedule }) {
  return (
    <ul class="mb-2">
      {schedule.daysofweek.map((day) => (
        <li>{day.day}</li>
      ))}
    </ul>
  );
}
WeeklySchedule.propTypes = {
  /**Specifies a transaction's schedule */
  schedule: PropTypes.object,
};

/**Section containing form controls to update weekly schedule info */
function EditWeeklySchedule({ schedule }) {
  const [state, setstate] = React.useState({
    dowData: [],
    error: "",
  });

  React.useEffect(() => {
    (async () => {
      /**fetch list of days of the week */
      let daysofweek = await (await fetch("/getdaysweek")).json();
      /**get list of selected days for this schedule */
      let dow = schedule.daysofweek;
      /**for each day check will be true for the ones existing in the schedule */
      daysofweek.forEach((item) => {
        if (dow.find(({ id }) => id === item.id)) {
          item.checked = true;
        }
      });
      /**finally update state to show edit panel */
      setstate({
        ...state,
        dowData: daysofweek,
      });
    })();
  }, []);

  /**adds and removes days from a weekly schedule */
  async function addRemoveDay(e) {
    /**get id of day to be added or removed */
    const idday = e.target.dataset.idday;
    let checked = state.dowData.find(({ id }) => String(id) === idday).checked;
    let count = 0;
    state.dowData.forEach(function (item) {
      item.checked && count++;
    });
    if (count === 1 && checked) {
      setstate({ ...state, error: "At least one option must be selected" });
    } else if ((count === 1 && !checked) || count > 1) {
      /**get id of schedule */
      const idschedule = e.target.dataset.idschedule;
      const body = {
        idschedule: idschedule,
        idscheduledaysweek: idday,
      };
      const url = "/deletedayweek";
      const method = "PUT";
      /**call to fetch */
      const resp = await makeCall(url, method, body);
      /**if the call is successful*/
      if (resp.status === 204) {
        /**change the checked property to reflect the new state, the icon will be swapped between "X" and "+"*/
        let daysofweek = state.dowData;
        daysofweek.find(({ id }) => String(id) === idday).checked =
          !daysofweek.find(({ id }) => String(id) === idday).checked;
        setstate({ ...state, dowData: daysofweek, error: "" });
      }
    }
  }

  return (
    <>
      <ul class="mb-2 listitemcustom">
        {state.dowData.map((day) => (
          <li>
            {day.checked && (
              <i
                onClick={addRemoveDay}
                data-idschedule={schedule.id}
                data-idday={day.id}
                class="fa-solid fa-circle-xmark me-1 text-danger cp"
              ></i>
            )}{" "}
            {!day.checked && (
              <i
                onClick={addRemoveDay}
                data-idschedule={schedule.id}
                data-idday={day.id}
                class="fa-solid fa-plus me-1 text-success cp"
              ></i>
            )}
            {day.day}
          </li>
        ))}
      </ul>
      {state.error != "" && <div className="text-danger">{state.error}</div>}
    </>
  );
}
EditWeeklySchedule.propTypes = {
  /**Specifies a transaction's schedule */
  schedule: PropTypes.object,
};

/**Contains a table of transactions of monthly schedule*/
function MonthlyTransaction({
  authenticated,
  url,
  transactiontype,
  data,
  updateFunction,
  categories,
}) {
  React.useEffect(() => {
    if (authenticated) {
      history.pushState("", "", `/${url}/om`);
    }
  }, []);
  return (
    <Transaction
      header={`Monthly ${transactiontype}`}
      status={true}
      data={data}
      updateFunction={updateFunction}
      scheduleview={<MonthlySchedule />}
      scheduleEditview={<EditMonthlySchedule />}
      suscribe={true}
      categories={categories}
    />
  );
}
MonthlyTransaction.propTypes = {
  /**Specifies whether user is authenticated or not */
  authenticated: PropTypes.bool,
  /** Specifies whether is income or expenses panel */
  url: PropTypes.string,
  /**Specifies whether is income or expense transaction*/
  transactiontype: PropTypes.string,
  /**Array of objects containig categories for the respective type of transaction */
  data: PropTypes.arrayOf(PropTypes.object),
  /**Gets called when database changes have been made successfully*/
  updateFunction: PropTypes.func,
  /**Array of objects containig categories for the respective type of transaction */
  categories: PropTypes.bool,
};
/**Section containing monthly schedule info */
function MonthlySchedule({ schedule }) {
  return (
    <p>Every {ordinal_suffix_of(schedule.dayofmonth)} day of the month.</p>
  );
}
MonthlySchedule.propTypes = {
  /**Specifies a transaction's schedule */
  schedule: PropTypes.object,
};
/**Section containing form controls to update monthly schedule info */
function EditMonthlySchedule({ schedule, onDone }) {
  const [state, setstate] = React.useState({
    formData: {
      day: schedule.dayofmonth,
      idschedule: schedule.id,
    },
    errors: {},
  });

  function handleChange(target) {
    handleChangeFunction(state, setstate, target);
  }

  /**
   * updates schedule
   */
  async function handleSubmit() {
    if (handleValidationFunction(state, setstate)) {
      const url = "/updatedayofmonth";
      const method = "POST";
      const resp = await makeCall(url, method, state.formData);
      if (resp.status === 204) {
        onDone();
      }
    }
  }

  const day = state.formData.day;
  return (
    <>
      <Label text="Day of the Month:" />
      <Input
        value={day}
        styles="d-block bg-transparent editInput w-25 "
        name="day"
        type="number"
        min="1"
        max="28"
        onValueChange={handleChange}
      />
      {"day" in state.errors && (
        <div className="text-danger">
          Please provide an integer greater than 0 and less than 29
        </div>
      )}
      <span
        class="badge text-bg-primary mt-3 fsinhe fst-italic cp"
        onClick={handleSubmit}
      >
        Done
      </span>
    </>
  );
}
EditMonthlySchedule.propTypes = {
  /**Specifies a transaction's schedule */
  schedule: PropTypes.object,
  /**Gets called when database changes have been made successfully*/
  onDone: PropTypes.func,
};

/**Contains a table of transactions of yearly schedule*/
function YearlyTransaction({
  authenticated,
  url,
  transactiontype,
  data,
  updateFunction,
  categories,
}) {
  React.useEffect(() => {
    if (authenticated) {
      history.pushState("", "", `/${url}/oy`);
    }
  }, []);
  return (
    <Transaction
      header={`Yearly ${transactiontype}`}
      status={true}
      data={data}
      updateFunction={updateFunction}
      scheduleview={<YearlySchedule />}
      scheduleEditview={<EditYearlySchedule />}
      suscribe={true}
      categories={categories}
    />
  );
}
YearlyTransaction.propTypes = {
  /**Specifies whether user is authenticated or not */
  authenticated: PropTypes.bool,
  /** Specifies whether is income or expenses panel */
  url: PropTypes.string,
  /**Specifies whether is income or expense transaction*/
  transactiontype: PropTypes.string,
  /**Array of objects containig categories for the respective type of transaction */
  data: PropTypes.arrayOf(PropTypes.object),
  /**Gets called when database changes have been made successfully*/
  updateFunction: PropTypes.func,
  /**Array of objects containig categories for the respective type of transaction */
  categories: PropTypes.bool,
};

/**Section containing yearly schedule info */
function YearlySchedule({ schedule }) {
  return (
    <p>
      Every {ordinal_suffix_of(schedule.dayofyear.day)} day of{" "}
      {toMonthName(schedule.dayofyear.month)}.
    </p>
  );
}

YearlySchedule.propTypes = {
  /**Specifies a transaction's schedule */
  schedule: PropTypes.object,
};

/**Section containing form controls to update yearly schedule info */
function EditYearlySchedule({ schedule, onDone }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = parseInt(schedule.dayofyear.month);
  const day = parseInt(schedule.dayofyear.day);
  const dayofyear = new Date(year, month - 1, day).toISOString().split("T")[0];
  const [state, setState] = React.useState({
    formData: { dayofyear: dayofyear, idschedule: schedule.id },
    errors: {},
  });

  function handleChange(target) {
    handleChangeFunction(state, setState, target);
  }

  /**
   * updates schedule
   */
  async function handleSubmit() {
    if (handleValidationFunction(state, setState)) {
      const url = "/updatedayofyear";
      const method = "POST";
      const resp = await makeCall(url, method, state.formData);
      if (resp.status === 204) {
        onDone();
      }
    }
  }

  const dofy = state.formData.dayofyear;
  return (
    <>
      <Label text="Day of the year:" />
      <DateSelect
        value={dofy}
        onValueChange={handleChange}
        name="dayofyear"
        styles="d-block bg-trnsp border-0 w-50"
      />
      {"dayofyear" in state.errors && (
        <div className="text-danger">Please select a date</div>
      )}
      <span
        class="badge text-bg-primary mt-3 mb3 fsinhe fst-italic cp"
        onClick={handleSubmit}
      >
        Done
      </span>
    </>
  );
}
EditYearlySchedule.propTypes = {
  /**Specifies a transaction's schedule */
  schedule: PropTypes.object,
  /**Gets called when database changes have been made successfully*/
  onDone: PropTypes.func,
};

/**Contains a table of transactions non-scheduled*/
function Unique({
  authenticated,
  url,
  transactiontype,
  data,
  updateFunction,
  categories,
  mindate,
  filterdate,
  filtereddata,
  onFilterChange,
  onClearFilter,
}) {
  React.useEffect(() => {
    if (authenticated) {
      history.pushState("", "", `/${url}/u`);
    }
  }, []);
  return (
    <Transaction
      header={`Unique Date ${transactiontype}`}
      status={false}
      data={data}
      updateFunction={updateFunction}
      scheduleview={<UniqueSchedule />}
      scheduleEditview={<EditUniqueSchedule mindate={mindate} />}
      suscribe={false}
      categories={categories}
      mindate={mindate}
      filterdate={filterdate}
      filteredarray={filtereddata}
      onFilterChange={onFilterChange}
      scheduletype="U"
      onClearFilter={onClearFilter}
    />
  );
}
Unique.propTypes = {
  /**Specifies whether user is authenticated or not */
  authenticated: PropTypes.bool,
  /** Specifies whether is income or expenses panel */
  url: PropTypes.string,
  /**Specifies whether is income or expense transaction*/
  transactiontype: PropTypes.string,
  /**Array of objects containig categories for the respective type of transaction */
  data: PropTypes.arrayOf(PropTypes.object),
  /**Gets called when database changes have been made successfully*/
  updateFunction: PropTypes.func,
  /**Array of objects containig categories for the respective type of transaction */
  categories: PropTypes.bool,
  /**Specifies minimun date */
  mindate: PropTypes.string,
  /**Specifies filter date */
  filterdate: PropTypes.string,
  /**Gets called when the user selects a filter date */
  onFilterChange: PropTypes.func,
  /**Gets called when the user clicks on clear filter button  */
  onClearFilter: PropTypes.func,
  /**Specifies filtered data by selected date */
  filtereddata: PropTypes.arrayOf(PropTypes.object),
};

/**Section containing non-scheduled transaction date info */
function UniqueSchedule({ schedule }) {
  return (
    <p class=" ">
      Transaction made on <span class="fw-bold">{schedule.datefb}</span>
    </p>
  );
}
UniqueSchedule.propTypes = {
  /**Specifies a transaction's schedule */
  schedule: PropTypes.object,
};

/**Section containing form controls to update date of non-scheduled transaction */
function EditUniqueSchedule({ schedule, onDone, mindate }) {
  const [state, setstate] = React.useState({
    formData: {
      date: schedule.datefa,
      idschedule: schedule.id,
    },
    errors: {},
  });
  /**Handles onChange event */
  function handleChange(target) {
    handleChangeFunction(state, setstate, target);
  }

  /**
   * updates schedule
   */
  async function handleSubmit() {
    if (handleValidationFunction(state, setstate)) {
      const url = "/updateuniquedate";
      const method = "POST";
      const resp = await makeCall(url, method, state.formData);
      if (resp.status === 204) {
        onDone();
      }
    }
  }

  const date = state.formData.date;

  return (
    <>
      <Label text="Date:" />
      <DateSelect
        value={date}
        min={mindate}
        onValueChange={handleChange}
        name="date"
        styles="d-block bg-trnsp border-0 w-50"
      />
      {"date" in state.errors && (
        <div className="text-danger">Please select a date</div>
      )}
      <span
        class="badge text-bg-primary mt-3 mb3 fsinhe fst-italic cp"
        onClick={handleSubmit}
      >
        Done
      </span>
    </>
  );
}
EditUniqueSchedule.propTypes = {
  /**Specifies a transaction's schedule */
  schedule: PropTypes.object,
  /**Gets called when database changes have been made successfully*/
  onDone: PropTypes.func,
  /**Specifies minimun date */
  mindate: PropTypes.string,
};

/**Contains a table of transactions of range of dates schedule*/
function RangeDatesTransactions({
  authenticated,
  url,
  transactiontype,
  data,
  updateFunction,
  categories,
  mindate,
}) {
  React.useEffect(() => {
    if (authenticated) {
      history.pushState("", "", `/${url}/r`);
    }
  }, []);
  return (
    <>
      <Transaction
        header={`Range of Dates ${transactiontype}`}
        status={false}
        data={data}
        updateFunction={updateFunction}
        scheduleview={<RangeDatesSchedule />}
        scheduleEditview={<EditRangeDatesSchedule mindate={mindate} />}
        suscribe={false}
        categories={categories}
      />
    </>
  );
}
RangeDatesTransactions.propTypes = {
  /**Specifies whether user is authenticated or not */
  authenticated: PropTypes.bool,
  /** Specifies whether is income or expenses panel */
  url: PropTypes.string,
  /**Specifies whether is income or expense transaction*/
  transactiontype: PropTypes.string,
  /**Array of objects containig categories for the respective type of transaction */
  data: PropTypes.arrayOf(PropTypes.object),
  /**Gets called when database changes have been made successfully*/
  updateFunction: PropTypes.func,
  /**Array of objects containig categories for the respective type of transaction */
  categories: PropTypes.bool,
  /**Specifies minimun date */
  mindate: PropTypes.string,
};
/**Section containing range of dates schedule info */
function RangeDatesSchedule({ schedule }) {
  return (
    <p class=" ">
      {"Daily from " + schedule.datefromfb + " to " + schedule.datetofb}
    </p>
  );
}
RangeDatesSchedule.propTypes = {
  /**Specifies a transaction's schedule */
  schedule: PropTypes.object,
};
/**Section containing form controls to update info of range of dates schedule transaction */
function EditRangeDatesSchedule({ schedule, onDone, mindate }) {
  const [state, setstate] = React.useState({
    formData: {
      idschedule: schedule.id,
      rangefrom: schedule.datefromfa,
      rangeto: schedule.datetofa,
    },
    errors: {},
  });

  function handleChangeRange(target) {
    handleChangeFunction(state, setstate, target);
  }

  /**
   * updates schedule
   */
  async function handleSubmit() {
    if (handleValidationFunction(state, setstate)) {
      const url = "/updaterangedates";
      const method = "POST";
      const resp = await makeCall(url, method, state.formData);
      if (resp.status === 204) {
        onDone();
      }
    }
  }

  const rangefrom = state.formData.rangefrom;
  const rangeto = state.formData.rangeto;

  return (
    <>
      <div className="row">
        <div className="col-5">
          <DateSelect
            min={mindate}
            value={rangefrom}
            onValueChange={handleChangeRange}
            name="rangefrom"
            styles="bg-trnsp border-0 w-100"
          />
          {"rangefrom" in state.errors && (
            <div className="text-danger">Please select date from</div>
          )}
        </div>
        <div className="col-2">
          <i class="fa-solid fa-arrow-right text-black"></i>
        </div>
        <div className="col-5">
          <DateSelect
            min={rangefrom}
            value={rangeto}
            onValueChange={handleChangeRange}
            name="rangeto"
            styles="bg-trnsp border-0 w-100"
          />
          {"rangeto" in state.errors && (
            <div className="text-danger">Please select date to</div>
          )}
        </div>
      </div>

      <span
        class="badge text-bg-primary mt-3 mb3 fsinhe fst-italic cp"
        onClick={handleSubmit}
      >
        Done
      </span>
    </>
  );
}
EditRangeDatesSchedule.propTypes = {
  /**Specifies a transaction's schedule */
  schedule: PropTypes.object,
  /**Gets called when database changes have been made successfully*/
  onDone: PropTypes.func,
  /**Specifies minimun date */
  mindate: PropTypes.string,
};
/**Renders "no results" icon */
function NoResulstComponent() {
  return (
    <div class="align-items-center d-flex flex-column h-100 pt-4">
      <i class="fa-5x fa-face-grin-beam-sweat fa-regular"></i>
      <div class="fs-1 mt-3">No Results</div>
    </div>
  );
}

/**
 * Unsubscribe transaction's schedule (it will not be charged after provided date)
 * @param {object} state
 * @param {string} date
 * @param {function} onUpdate
 */
async function unsuscribeTransaction(state, date, onUpdate) {
  const method = "POST";
  const idtransaction = state.idtransaction;
  const body = { id: idtransaction, enddate: date };
  const url = "/closetransaction";
  const resp = await makeCall(url, method, body);
  if (resp.status === 204) {
    onUpdate(); //updates transactions
  }
}
