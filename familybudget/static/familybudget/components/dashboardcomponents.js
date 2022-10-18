/**hardcode months */
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**Main container for data navigation */
function Dashboard({ isauthenticated, redirect }) {
  let year;
  let month;
  let day;
  let filter;
  let dateStart;
  let dateEnd;

  const queryString = window.location.search;
  // if url query string is empty, then render today's info
  if (queryString === "") {
    const d = new Date(); // today's date object
    month = d.getMonth();
    year = d.getFullYear();
    day = d.getDate();
    filter = "date";
    const url = urlConstuctor("", filter, year, month, day); // generates url
    history.pushState("", "", url.href); // pushes generated url to history
  } else {
    // if url search params are provided then
    const urlParams = new URLSearchParams(queryString);
    filter = urlParams.get("f");
    year =
      urlParams.get("year") === null
        ? new Date().getFullYear()
        : parseInt(urlParams.get("year")); // if year param is not provided then assing today's year
    month =
      urlParams.get("month") === null
        ? new Date().getMonth()
        : parseInt(urlParams.get("month")) - 1; // if month param is not provided then assing today's month, otherwise substract 1 (0-11) month index
    day = urlParams.get("day") === null ? "" : parseInt(urlParams.get("day")); // if day param is not provided then assing empty string
    dateStart = urlParams.get("start") === null ? "" : urlParams.get("start"); // if start param is not provided then assing empty string
    dateEnd = urlParams.get("end") === null ? "" : urlParams.get("end"); // if end param is not provided then assing empty string
  }

  /**
   * @param {number} year
   * @param {number} month
   * @returns array containing every day of provided month and year
   */
 




  const [state, setstate] = React.useState({
    filter: filter,
    year: year,
    month: month,
    months: months,
    day: day,
    days: [],
    data: {},
    ready: false,
    fromRange: dateStart,
    toRange: dateEnd,
    mindate: "",
    mglstyle: "text-white",
    frBorder: "",
    trBorder: "",
  });


  function getDays(year, month, data = null) {
    // returns the last day of previous month, add 1 to get desired month
    const getDays = new Date(year, month + 1, 0).getDate();
    let days = [];
    for (let i = 1; i < getDays + 1; i++) {
      days.push(i);
    }
    const [day_joined, month_joined, year_joined] = getDateJoined(data);
    if (year === year_joined && month === month_joined - 1) {
      const daysfiltered = days.filter(function (value) {
        // filter to get only dates greater than user's join date
        if (day_joined > value) {
          return false;
        } else {
          return value;
        }
        
      });
      return daysfiltered;
    
    }
    else
    {
      return days;
    }

    
  }

  // get ref to selected day button
  const dayRef = React.useRef();
  const overFlowRef = React.useRef();


  function getDateJoined(data)
  {
    let day_joined = parseInt(data.date_joined.day);
    let month_joined = parseInt(data.date_joined.month);
    let year_joined = parseInt(data.date_joined.year);

    return [day_joined, month_joined, year_joined]
  }

  /**
   * handles click on navigation arrows, updating month and year displayed
   * @param {object}  target clicked html element
   */
  function handleClickArrow(target) {
    const [day_joined, month_joined, year_joined] = getDateJoined(state.data);
    let days;
    //let day_joined = parseInt(state.data.date_joined.day);
    //let month_joined = parseInt(state.data.date_joined.month);
    //let year_joined = parseInt(state.data.date_joined.year);
    let d = target.dataset.d; // store direction of arrow in variable, l for left and d for right

    if (d === "l") {
      // check if month and year to be displayed in navigation are not the same as date joined (can't go any further)
      if (!(month_joined - 1 === state.month && year_joined === state.year)) {
        // if month = 0 then current month is january
        if (state.month === 0) {
          month = 11; //we have to jump to december
          year = state.year - 1; // we subtract 1 year
          days = getDays(year, 11, state.data); // get number of day of december
          setstate({
            ...state,
            year: year,
            month: month,
            days: days,
            day: "",
          });
        /**  if (year === year_joined && month === month_joined - 1) {
            const daysfiltered = days.filter(function (value) {
              // filter to get only dates greater than user's join date
              if (day_joined > value) {
                return false;
              } else {
                return value;
              }
            });
            setstate({
              ...state,
              year: year,
              month: month,
              days: daysfiltered,
              day: "",
            });
          } else {
            
          }*/
        } else {
          month = state.month - 1;
          days = getDays(state.year, month, state.data);
          setstate({ ...state, month: month, days: days, day: "" });
         /* if (state.year === year_joined && month === month_joined - 1) {
            const daysfiltered = days.filter(function (value) {
              if (day_joined > value) {
                return false;
              } else {
                return value;
              }
            });
            setstate({
              ...state,
              year: year,
              month: month,
              days: daysfiltered,
              day: "",
            });
          } else {
            
          }*/
        }
      }
    } else {
      if (state.month === 11) {
        month = 0; // january
        year = state.year + 1; // add one year
        days = getDays(year, 0, state.data); // gets number of days for january
        setstate({ ...state, year: year, month: month, days: days, day: "" });
      } else {
        month = state.month + 1;
        days = getDays(state.year, month, state.data);
        setstate({ ...state, month: month, days: days, day: "" });
      }
    }
  }

  /**
   * handles click on day, month or year button updating data rendered
   * @param {object}  target clicked html element
   */
  async function handleClick(target) {
    const type = target.dataset.type; //extract type of event target from dataset
    setstate({ ...state, ready: false }); // update state to display data loading placeholder
    // filter by event target origin
    if (type === "day") {
      day = parseInt(target.dataset.id); // get day from event target dataset
      const url = urlConstuctor(
        "/getfilteredtrans",
        "date",
        state.year,
        state.month,
        day
      ); // build url
      let data = await (await fetch(url.href)).json(); // fetch data

      // update state
      setstate({
        ...state,
        data: data,
        day: day,
        ready: true,
        filter: "date",
        fromRange: "",
        toRange: "",
      });

      history.pushState("", "", url.search); // push url to history
      // center clicked day
      centerDayScroll();
    } else if (type === "month") {
      const url = urlConstuctor(
        "/getfilteredtrans",
        "month",
        state.year,
        state.month
      ); // build url
      let data = await (await fetch(url.href)).json(); // fetch data
      setstate({
        ...state,
        data: data,
        ready: true,
        day: "",
        filter: "month",
        fromRange: "",
        toRange: "",
      });
      history.pushState("", "", url.search); // push url to history
    } else if (type === "year") {
      const url = urlConstuctor("/getfilteredtrans", "year", state.year); // build url
      let data = await (await fetch(url.href)).json(); // fetch data
      setstate({
        ...state,
        data: data,
        ready: true,
        day: "",
        filter: "year",
        fromRange: "",
        toRange: "",
      });
      history.pushState("", "", url.search); // push url to history
    } else if (type === "range") {
      if (state.fromRange !== "" && state.toRange !== "") {
        const url = urlConstuctor(
          "/getfilteredtrans",
          "range",
          "",
          "",
          "",
          state.fromRange,
          state.toRange
        ); // build url
        let data = await (await fetch(url.href)).json(); // fetch data
        setstate({
          ...state,
          data: data,
          ready: true,
          day: "",
          filter: "range",
        });
        history.pushState("", "", url.search); // push url to history
      } else {
        let frBorder = "";
        let trBorder = "";

        if (state.fromRange === "") {
          frBorder = "text-danger";
        }
        if (state.trBorder === "") {
          trBorder = "text-danger";
        }
        setstate({
          ...state,
          mglstyle: "text-danger",
          frBorder: frBorder,
          trBorder: trBorder,
        });
      }
    }
  }

  /**
   * @param {object}  target clicked html element
   * @method handles change of value of target element updating state and passing value to child component
   */
  function handleValueChange(target) {
    const name = target.name;
    if (name === "fromRange") {
      setstate({
        ...state,
        fromRange: target.value,
        mglstyle: "text-white",
        frBorder: "",
      });
    } else {
      setstate({
        ...state,
        toRange: target.value,
        mglstyle: "text-white",
        trBorder: "",
      });
    }
  }

  /**
   *
   * @param {string} f filter
   * @param {number} year integer
   * @param {number}  month index (0-11)
   * @param {number} day integer
   * @param {string} rangefrom start date
   * @param {string} rangeto end date
   * @returns builds url plus parameters to fetch data
   */
  function urlConstuctor(
    urlpar,
    f,
    year,
    month = "",
    day = "",
    rangefrom = "",
    rangeto = ""
  ) {
    const url = new URL(urlpar, window.location.origin);
    if (f === "date") {
      url.searchParams.append("f", f);
      url.searchParams.append("month", parseInt(month) + 1); // adds 1 because server side manages months (1-12)
      url.searchParams.append("year", year);
      url.searchParams.append("day", day);
    } else if (f === "month") {
      url.searchParams.append("f", f);
      url.searchParams.append("month", parseInt(month) + 1);
      url.searchParams.append("year", year);
    } else if (f === "year") {
      url.searchParams.append("f", f);
      url.searchParams.append("year", year);
    } else if (f === "range") {
      url.searchParams.append("f", f);
      url.searchParams.append("start", rangefrom);
      url.searchParams.append("end", rangeto);
    }

    return url;
  }

  React.useEffect(() => {
    (async () => {
      if (isauthenticated) {
        // building url to get data
        const url = urlConstuctor(
          "/getfilteredtrans",
          state.filter,
          state.year,
          state.month,
          state.day,
          state.fromRange,
          state.toRange
        );
        // fetch data
        let data = await (await fetch(url.href)).json();
        // center day button
        
        //set min date of from range to be equal to date joined
        const mindate = new Date(
          parseInt(data.date_joined.year),
          parseInt(data.date_joined.month) - 1,
          parseInt(data.date_joined.day)
        )
          .toISOString()
          .split("T")[0];

        // get array of days for requested month and year
          let days = getDays(year, month, data);




        setstate({ ...state, data: data, ready: true, mindate: mindate, days:days });
        if (state.filter === "date") {
          centerDayScroll();
        }
      } else {
        redirect("index");
      }
    })();
  }, []);

  /**
   * Centers the selected day inside overflowed div.
   */
  function centerDayScroll() {
    const oL = dayRef.current.offsetLeft; // get offset left position from ref to clicked day button
    const sW = overFlowRef.current.scrollWidth; // get scroll width from ref to days container div (overflowed)
    const oW = overFlowRef.current.offsetWidth; // get offset Width from ref to days container div

    // check position of clicked day and set scroll left property for overflowed container div
    if (oL < sW - oW / 2) {
      overFlowRef.current.scrollLeft = oL / 2 - 25; // scroll half of div
    } else if (oL > sW - oW / 2) {
      overFlowRef.current.scrollLeft = sW; //scroll to end
    }
  }

  //store data and pass it to children component
  const fromRange = state.fromRange;
  const toRange = state.toRange;

  if (isauthenticated) {
    return (
      <>
        <Navigation
          mindate={state.mindate}
          filter={state.filter}
          day={state.day}
          days={state.days}
          month={months[state.month]}
          monthindex={state.month}
          onClickArrow={handleClickArrow}
          year={state.year}
          dayRef={dayRef}
          overFlowRef={overFlowRef}
          onClick={handleClick}
          onValueChange={handleValueChange}
          toRange={toRange}
          fromRange={fromRange}
          mglstyle={state.mglstyle}
          frBorder={state.frBorder}
          trBorder={state.trBorder}
        />
        <Body
          ready={state.ready}
          filter={state.filter}
          data={state.data}
          month={months[state.month] + " " + state.year}
          year={state.year}
        />
      </>
    );
  } else {
    return redirect("index"); // redirect to login view
  }
}
Dashboard.propTypes = {
  /**Specifies whether user is authenticated */
  isauthenticated: PropTypes.bool,
  /**Gets called when user is not authenticated */
  redirect: PropTypes.func,
};

/**Contains navigation filter section */
function Navigation({
  onClick,
  filter,
  monthindex,
  month,
  year,
  onClickArrow,
  overFlowRef,
  days,
  day,
  dayRef,
  mindate,
  frBorder,
  onValueChange,
  fromRange,
  trBorder,
  toRange,
  mglstyle,
}) {
  /**Handles onClick event */
  function handleClick(e) {
    onClick(e.target);
  }

  return (
    <>
      {/** Month and Year section */}
      <MonthYear
        filter={filter}
        monthindex={monthindex}
        month={month}
        year={year}
        onClickArrow={onClickArrow}
        onClick={onClick}
      />
      {/** Days section */}
      <div
        className="border border-white overflow-auto p-1 text-white no-bar  f10-8-9"
        ref={overFlowRef}
      >
        <div className="d-flex justify-content-between">
          {
            days.map((item) =>
              day === item ? (
                <Day
                  day={item}
                  styles="bg-dark rounded-1"
                  dayRef={dayRef}
                  onClick={onClick}
                />
              ) : (
                <Day day={item} onClick={onClick} styles="" />
              )
            ) /* apply black background to highkight selected day */
          }
        </div>
      </div>
      {/** Range section */}
      <div className="border-bottom border-start border-end border-white px-2 py-2">
        <div className="row">
          <div className="col-4">
            <DateSelect
              min={mindate}
              name="fromRange"
              styles={"frmI " + frBorder}
              onValueChange={onValueChange}
              value={fromRange}
            />
          </div>
          <div className="col-2 text-center">
            <i class="fa-solid fa-arrow-right text-white"></i>
          </div>
          <div className="col-4">
            <DateSelect
              name="toRange"
              min={fromRange}
              styles={"frmI " + trBorder}
              onValueChange={onValueChange}
              value={toRange}
            />
          </div>
          <div className="col-2 text-center">
            <i
              data-type="range"
              onClick={handleClick}
              class={"fa-solid fa-magnifying-glass cp " + mglstyle}
            ></i>
          </div>
        </div>
      </div>
    </>
  );
}
Navigation.propTypes = {
  /**Gets called when onClick events is triggered */
  onClick: PropTypes.func,
  /**Specifies filter */
  filter: PropTypes.string,
  /**Specifies month index (0-11)*/
  monthindex: PropTypes.number,
  /**Specifies month name */
  month: PropTypes.string,
  /**Specifies year */
  year: PropTypes.number,
  /**Gets called when arrow onClick event is triggered */
  onClickArrow: PropTypes.func,
  /**Ref to days container */
  overFlowRef: PropTypes.object,
  /**Array of numbers containing every day of a month */
  days: PropTypes.arrayOf(PropTypes.number),
  /**Specifies day */
  day: PropTypes.number,
  /**Ref to day element */
  dayRef: PropTypes.object,
  /**Specifies minimum value (date) date field */
  mindate: PropTypes.string,
  /**Specifies border css (from range filter) */
  frBorder: PropTypes.string,
  /**Gets called when onChange event is triggered */
  onValueChange: PropTypes.func,
  /**Specifies "from range" filter's value */
  fromRange: PropTypes.string,
  /**Specifies border css (to range filter) */
  trBorder: PropTypes.string,
  /**Specifies "to range" filter's value */
  toRange: PropTypes.string,
  /**Specifies magnifying-glass css color */
  mglstyle: PropTypes.string,
};
/**Contains Month and Year navigation */
function MonthYear({ onClickArrow, onClick, monthindex, filter, month, year }) {
  function handleClickArrow(e) {
    onClickArrow(e.target);
  }
  function handleClick(e) {
    onClick(e.target);
  }
  return (
    <div className="border-top border-start border-end rounded-top">
      <div className="row align-items-center align-items-center">
        <div className="col-2 text-center">
          <i
            class="fa-solid fa-arrow-left text-white cp "
            onClick={handleClickArrow}
            data-d="l"
          ></i>
        </div>
        <div className="col-4">
          <div
            data-type="month"
            data-id={monthindex}
            onClick={handleClick}
            className={
              /* applies black background color to highlight selected filter */
              "text-center text-white cp " +
              (filter === "month" && "bg-dark rounded-pill")
            }
          >
            {month}
          </div>
        </div>
        <div className="col-4">
          <div
            onClick={handleClick}
            data-type="year"
            className={
              /* applies black background color to highlight selected filter */
              "text-center text-white cp " +
              (filter === "year" && "bg-dark rounded-pill")
            }
          >
            {year}
          </div>
        </div>
        <div className="col-2 text-center">
          <i
            class="fa-solid fa-arrow-right text-white cp "
            onClick={handleClickArrow}
            data-d="r"
          ></i>
        </div>
      </div>
    </div>
  );
}
MonthYear.propTypes = {
  /**Gets called when arrow's onClick event is triggered */
  onClickArrow: PropTypes.func,
  /**Gets called when onClick event is triggered */
  onClick: PropTypes.func,
  /**Specifies month index (0-11) */
  monthindex: PropTypes.number,
  /**Specifies filter */
  filter: PropTypes.string,
  /**Specifies month name*/
  month: PropTypes.string,
  /**Specifies year */
  year: PropTypes.number,
};
/**Displays a day */
function Day({ onClick, day, dayRef, styles }) {
  function handleClick(e) {
    onClick(e.target);
  }
  return (
    <div
      data-type="day"
      data-id={day}
      ref={dayRef}
      className={"p-1 cp " + styles}
      onClick={handleClick}
    >
      {day}
    </div>
  );
}
Day.propTypes = {
  /**Gets called when onClick event is triggered */
  onClick: PropTypes.func,
  /**Specifies day */
  day: PropTypes.number,
  /**Ref to div */
  dayRef: PropTypes.object,
  /**Specofies additional css */
  styles: PropTypes.string,
};

/**Data displaying section*/
function Body({ ready, filter, data, month, year }) {
  const [state, setstate] = React.useState({ load: false, height: "" });
  const boxRef = React.useRef();

  /**
   * Sets the body's hight to fill the remaining space
   */
  function reSize() {
    // boxref is a ref to body component and I get the position of top side
    let height =
      window.innerHeight - boxRef.current.getBoundingClientRect().top - 10;
    setstate({ ...state, height: height }); //update height
  }

  React.useLayoutEffect(() => {
    //adding event listener to resize body on window resize
    window.addEventListener("resize", reSize);
     reSize(); // resize on component mounted
    return () => window.removeEventListener("resize", reSize);
  }, [ready]);

  return (
    <div
      ref={boxRef}
      className="border border-white border-top-0 overflow-auto rounded-bottom"
      style={{ height: state.height }}
    >
      {
        !ready && (
          <Loading />
        ) /* Shows placeholder until data response is completed*/
      }
      {/* renders views upon filter changed */}
      {ready && filter === "date" && <DaySummary data={data} />}
      {ready && filter === "month" && (
        <MonthSummary data={data} month={month} />
      )}
      {ready && filter === "year" && <YearSummary data={data} year={year} />}
      {ready && filter === "range" && <RangeSummary data={data} />}
    </div>
  );
}
Body.propTypes = {
  /**Specifies whether call to fetch was completed*/
  ready: PropTypes.bool,
  /**Specifies type of filter */
  filter: PropTypes.string,
  /**Data object */
  data: PropTypes.object,
  /**Month name and year */
  month: PropTypes.string,
  /**Year */
  year: PropTypes.number,
};
/**Indicates that something is still loading*/
function Loading() {
  return (
    <>
      <div class="placeholder-glow py-2 mx-2">
        <p>
          <span class="placeholder col-6 placeholder-lg bg-light me-2"></span>
          <span class="placeholder col-3 placeholder-lg bg-light"></span>
          <span class="placeholder col-12 placeholder-xs my-2 bg-light"></span>
          <div>
            <span class="placeholder col-2 placeholder-lg bg-light me-2"></span>
            <span class="placeholder col-2 placeholder-lg bg-light"></span>
          </div>
          <div className="w-100 d-flex justify-content-center mt-1">
            <span class="placeholder w-25 placeholder-lg bg-light my-2"></span>
          </div>
          <span class="placeholder col-12 placeholder-xs my-2 bg-light"></span>
          <div className="w-100 d-flex justify-content-around mt-1">
            <span class="placeholder col-2 placeholder-lg bg-light"></span>
            <span class="placeholder col-2 placeholder-lg bg-light"></span>
            <span class="placeholder col-2 placeholder-lg bg-light"></span>
            <span class="placeholder col-2 placeholder-lg bg-light"></span>
          </div>
          <span class="placeholder col-12 placeholder-xs my-2 bg-light"></span>
          <div className="w-100 d-flex justify-content-around mt-1">
            <span class="placeholder col-2 placeholder-lg bg-light"></span>
            <span class="placeholder col-2 placeholder-lg bg-light"></span>
            <span class="placeholder col-2 placeholder-lg bg-light"></span>
            <span class="placeholder col-2 placeholder-lg bg-light"></span>
          </div>{" "}
          {[...Array(30)].map((e, i) =>    <div className="w-100 d-flex justify-content-around mt-1">
                  <span class="placeholder col-2 placeholder-lg bg-light"></span>
                  <span class="placeholder col-2 placeholder-lg bg-light"></span>
                  <span class="placeholder col-2 placeholder-lg bg-light"></span>
                  <span class="placeholder col-2 placeholder-lg bg-light"></span>
                </div>)}
        </p>
      </div>
    </>
  );
}
/**Container for data filtered by specific date */
function DaySummary({ data }) {
  return (
    <Content
      initialaccumulated={data.transactions[0].accumulated_start}
      finalaccumulated={data.transactions[0].accumulated_end}
      data={data}
      buttonschildren={<DaySummaryButtons />}
      contentchildren={<DaySummaryContent data={data} />}
    />
  );
}
DaySummary.propTypes = {
  /**Specifies data for selected date */
  data: PropTypes.object,
};
/**Contains Collapse Tables and Charts*/
function DaySummaryContent({ data }) {
  return (
    <>
      <div class="collapse text-warning h-100" id="collapseIncome">
        <TransactionTable
          title="Income Table"
          data={data.transactions[0].income}
          total={data.transactions[0].totalin}
        />
      </div>
      <div class="collapse text-warning h-100 show" id="collapseExpenses">
        <TransactionTable
          title="Expenses Table"
          data={data.transactions[0].expenses}
          total={data.transactions[0].totalex}
        />
      </div>
      <div class="collapse text-warning h-100 py-1 px-2" id="collapseExChart">
        <PieChart
          data={data.transactions[0].dayexaggregatecat}
          title="Expenses by Category"
        />
      </div>
      <div class="collapse text-warning h-100 py-1 px-2" id="collapseInChart">
        <PieChart
          data={data.transactions[0].dayinaggregatecat}
          title="Income by Category"
        />
      </div>
    </>
  );
}
DaySummaryContent.propTypes = {
  /**Specifies data for selected date */
  data: PropTypes.object,
};
/**Contains collapse control Buttons*/
function DaySummaryButtons() {
  return (
    <>
      <button
        class="btn btn-warning fsinhe btn-sm "
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapseExpenses"
        aria-expanded="false"
        aria-controls="collapseExpenses"
      >
        Expenses
      </button>
      <button
        class="btn btn-light fsinhe btn-sm ms-2"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapseIncome"
        aria-expanded="false"
        aria-controls="collapseIncome"
      >
        Income
      </button>

      <div class="btn-group">
        <button
          type="button"
          class="btn btn-success dropdown-toggle fsinhe btn-sm ms-2"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Charts
        </button>
        <ul class="dropdown-menu fsinhe">
          <li>
            <a
              class="dropdown-item"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseExChart"
              aria-expanded="false"
              aria-controls="collapseExChart"
            >
              Expense by Category
            </a>
          </li>
          <li>
            <a
              class="dropdown-item"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseInChart"
              aria-expanded="false"
              aria-controls="collapseInChart"
            >
              Income by Category
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
/**Displays a row for a transaction */
function TransactionRow({ item }) {
  return (
    <div className="row">
      <div className="col-8 p-1 ps-4">{item.description}</div>
      <div className="col-4 p-1">{formatter.format(item.amount)}</div>
    </div>
  );
}
TransactionRow.propTypes = {
  /**Specifies a transaction object {description, amount} */
  item: PropTypes.object,
};
/**Displays Initial and Final accumulated data */
function HeaderFooter({ text, amount }) {
  return (
    <div
      className="customheight text-white   bg-danger"
      style={{ "--h": "10%" }}
    >
      <div className="h-100 d-inline-block">
        <div className="d-flex h-100 align-items-center">
          <div className="ps-2 fst-italic">{text}</div>
        </div>
      </div>
      <div className="h-100 d-inline-block">
        <div className="d-flex h-100 align-items-center">
          <div className="ps-2">{formatter.format(amount)}</div>
        </div>
      </div>
    </div>
  );
}
HeaderFooter.propTypes = {
  /**Label */
  text: PropTypes.string,
  /**Amount */
  amount: PropTypes.number,
};
/** Pie chart, income or expenses by category */
function PieChart({ data, title }) {
  const chartref = React.useRef();

  // generate an array of colors, one for each category
  let colors = [];
  data.forEach((item) => {
    colors.push(generateLightColorHex());
  });

  React.useEffect(() => {
    // if there's no transactions then do nothing
    if (data.length !== 0) {
      const ctx = chartref.current.getContext("2d");
      const myChart = new Chart(ctx, {
        type: "pie",
        plugins: [ChartDataLabels],
        data: {
          labels: data.map((item) => item.category),
          datasets: [
            {
              label: "Dataset",
              data: data.map((item) => item.amount),
              backgroundColor: colors,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          tooltip: {
            enabled: false,
          },
          plugins: {
            datalabels: {
              labels: {
                title: {
                  font: {
                    weight: "bold",
                  },
                },
              },
              display: "auto",
              anchor: "end",
              align: "start",
              offset: 0,
              formatter: (value, ctx) => {
                let sum = 0;
                let dataArr = ctx.chart.data.datasets[0].data;
                dataArr.map((data) => {
                  sum += data;
                });
                let percentage = ((value * 100) / sum).toFixed(2) + "%";
                return percentage;
              },
              color: "#000000",
            },
            title: {
              display: true,
              text: title,
            },
            legend: {
              labels: {
                font: {
                  size: 9,
                },
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  var sum = context.dataset.data.reduce(function (a, b) {
                    return a + b;
                  }, 0);
                  let label = ((context.raw / sum) * 100).toFixed(2);
                  return (
                    context.label +
                    " " +
                    label.toString() +
                    "% => " +
                    formatter.format(context.raw)
                  );
                },
              },
            },
          },
          layout: {
            padding: {
              bottom: 10,
            },
          },
        },
      });
    }

    return () => {};
  }, []);

  // if no data, then return No results
  if (data.length !== 0) {
    return (
      <div className="h-100 bg-white rounded-3 chart-lg-w50">
        <canvas ref={chartref}></canvas>
      </div>
    );
  } else {
    return <NoResulstComponent />;
  }
}
PieChart.propTypes = {
  /**Array of summarized data */
  data: PropTypes.arrayOf(PropTypes.object),
  /**Chart title */
  title: PropTypes.string,
};

/**Displays a table of income or expenses on a date*/
function TransactionTable({ data, title, total }) {
  if (data.length !== 0) {
    return (
      <div className="h-100">
        <div
          className="customheight border-2 border-bottom border-warning text-center"
          style={{ "--h": "12%" }}
        >
          {title}
        </div>
        <div
          className="customheight border-2 border-bottom border-warning"
          style={{ "--h": "10%" }}
        >
          <div className="row align-content-center h-100">
            <div className="col-8 p-1 ps-4">Description</div>
            <div className="col-4 p-1">Amount</div>
          </div>
        </div>

        <div className="customheight ofx-hidden pt-2" style={{ "--h": "66%" }}>
          {data.map((item) => (
            <TransactionRow item={item} />
          ))}
        </div>

        <div
          className="customheight border-2 border-top border-warning"
          style={{ "--h": "12%" }}
        >
          <div className="row">
            <div className="col-8 p-1 ps-4">Total</div>
            <div className="col-4 p-1">{formatter.format(total)}</div>
          </div>
        </div>
      </div>
    );
  } else {
    return <NoResulstComponent />;
  }
}
TransactionTable.propTypes = {
  /** Array of transactions*/
  data: PropTypes.arrayOf(PropTypes.object),
  /**Title for the table*/
  title: PropTypes.string,
  /** Total amount for the date */
  total: PropTypes.number,
};
/**Container for data filtered by specific month */
function MonthSummary({ data, month }) {
  return (
    <Content
      initialaccumulated={data.transactions[0].accumulated_start}
      finalaccumulated={
        data.transactions[data.transactions.length - 1].accumulated_end
      }
      data={data}
      buttonschildren={
        <MonthYearSummaryButtons tablebuttontext={"Daily Table"} filter="Day" />
      }
      contentchildren={
        <MonthYearSummaryContent
          chartfilter="month"
          filter="Day"
          data={data}
          tabletitle={"Daily Table " + month}
        />
      }
    />
  );
}
MonthSummary.propTypes = {
  /**Specifies data for selected month */
  data: PropTypes.object,
  /**Specifies Month and year */
  month: PropTypes.string,
};
/**Contains Collapse Tables and Charts*/
function MonthYearSummaryContent({ tabletitle, data, filter, chartfilter }) {
  return (
    <>
      <div class="collapse text-warning h-100 show" id="collapseSummaryTable">
        <SummaryTable
          title={tabletitle}
          data={data.summary}
          totalincome={data.totalincome}
          totalexpenses={data.totalexpenses}
          filter={filter}
        />
      </div>
      <div
        class="collapse text-warning h-100"
        id="collapseAggregatedTableExpenses"
      >
        <AggregatedTable
          type="Expenses"
          data={data.totalaggexbydes}
          total={data.totalexpenses}
        />
      </div>
      <div
        class="collapse text-warning h-100"
        id="collapseAggregatedTableIncome"
      >
        <AggregatedTable
          type="Income"
          data={data.totalagginbydes}
          total={data.totalincome}
        />
      </div>
      <div class="collapse text-warning h-100 py-1 px-2" id="collapseExChart">
        <PieChart data={data.totalaggexbycat} title="Expenses by Category" />
      </div>
      <div class="collapse text-warning h-100 py-1 px-2" id="collapseInChart">
        <PieChart data={data.totalagginbycat} title="Income by Category" />
      </div>
      <div class="collapse text-warning h-100 py-1 px-2" id="collapseFlowChart">
        <LineChart
          data={data.summary}
          title="Cash Flow vs Time"
          filter={chartfilter}
        />
      </div>
      <div class="collapse text-warning h-100 py-1 px-2" id="collapseBarChart">
        <BarChart
          data={data.summary}
          title="Expenses vs Month"
          filter={chartfilter}
        />
      </div>
    </>
  );
}
MonthYearSummaryContent.propTypes = {
  /**Specifies title for table */
  tabletitle: PropTypes.string,
  /**Specifies data for moth or year filter */
  data: PropTypes.object,
  /**Specifies title for first column*/
  filter: PropTypes.string,
  /**Specifies chart's filter */
  chartfilter: PropTypes.string,
};
/**Contains collapse control Buttons*/
function MonthYearSummaryButtons({ filter }) {
  return (
    <>
      <button
        class="btn btn-warning fsinhe btn-sm "
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapseSummaryTable"
        aria-expanded="false"
        aria-controls="collapseSummaryTable"
      >
        Daily Table
      </button>

      <div class="btn-group">
        <button
          type="button"
          class="btn btn-primary dropdown-toggle fsinhe btn-sm ms-2"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          AGG Table
        </button>
        <ul class="dropdown-menu">
          <li>
            <a
              class="dropdown-item  "
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseAggregatedTableExpenses"
              aria-expanded="false"
              aria-controls="collapseAggregatedTableExpenses"
            >
              Expenses
            </a>
          </li>
          <li>
            <a
              class="dropdown-item  "
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseAggregatedTableIncome"
              aria-expanded="false"
              aria-controls="collapseAggregatedTableIncome"
            >
              Income
            </a>
          </li>
        </ul>
      </div>

      <div class="btn-group">
        <button
          type="button"
          class="btn btn-success dropdown-toggle fsinhe btn-sm ms-2"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Charts
        </button>
        <ul class="dropdown-menu fsinhe">
          <li>
            <a
              class="dropdown-item  "
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseExChart"
              aria-expanded="false"
              aria-controls="collapseExChart"
            >
              Expense by Category
            </a>
          </li>
          <li>
            <a
              class="dropdown-item  "
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseInChart"
              aria-expanded="false"
              aria-controls="collapseInChart"
            >
              Income by Category
            </a>
          </li>
          <li>
            <a
              class="dropdown-item  "
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseFlowChart"
              aria-expanded="false"
              aria-controls="collapseFlowChart"
            >
              Flow
            </a>
          </li>
          <li>
            <a
              class="dropdown-item  "
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseBarChart"
              aria-expanded="false"
              aria-controls="collapseBarChart"
            >
              {"Expenses and Icome by " + filter}
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
MonthYearSummaryButtons.propTypes = {
  /**Specifies filter */
  filter: PropTypes.string,
};
/**Summarized table by date or month */
function SummaryTable({ data, title, filter, totalincome, totalexpenses }) {
  if (data.length !== 0) {
    return (
      <div className="h-100">
        <div
          className="customheight border-2 border-bottom border-warning text-center"
          style={{ "--h": "12%" }}
        >
          {title}
        </div>
        <div
          className="customheight border-2 border-bottom border-warning container-fluid text-bg-success"
          style={{ "--h": "10%" }}
        >
          <div className="row align-content-center h-100">
            <div className="col-3 p-1 ps-4">{filter}</div>
            <div className="col-3 p-1">Income</div>
            <div className="col-3 p-1">Expenses</div>
            <div className="col-3 p-1">Delta</div>
          </div>
        </div>

        <div
          className="customheight ofx-hidden pt-1 container-fluid no-bar"
          style={{ "--h": "58%" }}
        >
          {data.map((item) => (
            <div className="row">
              <div className="col-3 p-1 ps-4">{item.date}</div>
              <div className="col-3 p-1">{formatter.format(item.totalin)}</div>
              <div className="col-3 p-1">{formatter.format(item.totalex)}</div>
              <div className="col-3 p-1">{formatter.format(item.delta)}</div>
            </div>
          ))}
        </div>

        <div
          className="customheight border-2 border-top border-bottom border-warning container-fluid text-bg-success"
          style={{ "--h": "10%" }}
        >
          <div className="row h-100 align-content-center">
            <div className="col-3 p-1 ps-4">Total</div>
            <div className="col-3 p-1">{formatter.format(totalincome)}</div>
            <div className="col-3 p-1">{formatter.format(totalexpenses)}</div>
            <div className="col-3 p-1">
              {formatter.format(totalincome - totalexpenses)}
            </div>
          </div>
        </div>
        <div
          className="customheight border-2 border-warning container-fluid text-bg-secondary"
          style={{ "--h": "10%" }}
        >
          <div className="row h-100 align-content-center">
            <div className="col-3 p-1 ps-4">AVG</div>
            <div className="col-3 p-1">
              {formatter.format(totalincome / data.length)}
            </div>
            <div className="col-3 p-1">
              {formatter.format(totalexpenses / data.length)}
            </div>
            <div className="col-3 p-1">
              {formatter.format((totalincome - totalexpenses) / data.length)}
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <NoResulstComponent />;
  }
}
SummaryTable.propTypes = {
  /**Scpecifies data for table */
  data: PropTypes.object,
  /**Specifies title */
  title: PropTypes.string,
  /**Specifies filter*/
  filter: PropTypes.string,
  /**Specifies total income */
  totalincome: PropTypes.number,
  /**Specifies total expenses */
  totalexpenses: PropTypes.number,
};
/**Line chart of accumulated values*/
function LineChart({ filter, data, title }) {
  const chartref = React.useRef();

  let xscales = {};

  // changes axes label conditionally
  if (filter === "range") {
    xscales = {
      type: "time",
      time: {
        displayFormats: {
          day: "dd-MM-yyyy",
        },
        minUnit: "day"
      },
      title: {
        display: true,
        text: "Date",
      },
    };
  } else if (filter === "month") {
    xscales = {
      title: {
        display: true,
        text: "Day of month",
      },
    };
  } else if (filter === "year") {
    xscales = {
      title: {
        display: true,
        text: "Month",
      },
    };
  }

  React.useEffect(() => {
    if (data.length !== 0) {
      const ctx = chartref.current.getContext("2d");
      const myChart = new Chart(ctx, {
        type: "line",
        plugins: [ChartDataLabels],
        data: {
          labels: data.map((item) => item.date),
          datasets: [
            {
              label: "",
              data: data.map((item) => item.accumulated),
              fill: false,
              borderColor: "rgb(75, 192, 192)",
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          tooltip: {
            enabled: false,
          },
          plugins: {
            datalabels: {
              display: false,
            },
            title: {
              display: true,
              text: title,
            },
            legend: {
              display: false,
            },
          },
          layout: {
            padding: {
              bottom: 10,
            },
          },
          scales: {
            x: xscales,
            y: {
              ticks: {
                callback: function (value, index, ticks) {
                  return formatter.format(value);
                },
              },
              title: {
                display: true,
                text: "Cash Flow",
              },
            },
          },
        },
      });
    }

    return () => {};
  }, []);

  if (data.length !== 0) {
    return (
      <div className="h-100 bg-white rounded-3 chart-lg-w75">
        <canvas ref={chartref}></canvas>
      </div>
    );
  } else {
    return "No Results";
  }
}
LineChart.propTypes = {
  /**Specifies filter */
  filter: PropTypes.string,
  /**Specifies data for chart */
  data: PropTypes.object,
  /**Specifies title for char */
  title: PropTypes.string,
};
/**@returns random dark hex color */
function generateDarkColorHex() {
  let color = "#";
  for (let i = 0; i < 3; i++)
    color += (
      "0" + Math.floor((Math.random() * Math.pow(16, 2)) / 2).toString(16)
    ).slice(-2);
  return color;
}
/**@returns random light hex color */
function generateLightColorHex() {
  let color = "#";
  for (let i = 0; i < 3; i++)
    color += (
      "0" + Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)
    ).slice(-2);
  return color;
}
/**Container for data filtered by specific year */
function YearSummary({ data, year }) {
  return (
    <Content
      initialaccumulated={data.transactions[0].accumulated_start}
      finalaccumulated={
        data.transactions[data.transactions.length - 1].accumulated_end
      }
      data={data}
      buttonschildren={
        <MonthYearSummaryButtons
          tablebuttontext={"Monthly Table"}
          filter="Month"
        />
      }
      contentchildren={
        <MonthYearSummaryContent
          chartfilter="year"
          filter="Month"
          data={data}
          tabletitle={"Yearly Table " + year}
        />
      }
    />
  );
}
YearSummary.propTypes = {
  /**Specifies data for selected year */
  data: PropTypes.object,
  /**Specifies selected year */
  year: PropTypes.number,
};

/**Main container for data display*/
function Content({
  initialaccumulated,
  buttonschildren,
  contentchildren,
  finalaccumulated,
}) {
  React.useEffect(() => {
    const myCollapsibles = document.querySelectorAll(".collapse");

    // hide any bootstrap collapse open when a different is shown
    myCollapsibles.forEach((item) => {
      item.addEventListener("show.bs.collapse", (event) => {
        myCollapsibles.forEach((element) => {
          if (event.target.id != element.id) {
            const bsCollapse = new bootstrap.Collapse(`#${element.id}`, {
              toggle: false,
            });
            bsCollapse.hide();
          }
        });
      });
    });
  }, []);
  return (
    <>
      <HeaderFooter text="Initial accumulated:" amount={initialaccumulated} />

      <div
        className="customheight p-1 border-1 border-bottom border-top border-white   ofx-hidden ofy-hidden"
        style={{ "--h": "80%" }}
      >
        {/**Buttons area */}
        <div className="p-2 customheight" style={{ "--h": "15%" }}>
          {/** Buttons children */ buttonschildren}
        </div>
        {/**Tables and charts area */}
        <div className="customheight pt-2" style={{ "--h": "85%" }}>
          {/** Content children */ contentchildren}
        </div>
      </div>
      <HeaderFooter text="Final accumulated" amount={finalaccumulated} />
    </>
  );
}
Content.propTypes = {
  /**Specifies initial accumulated for period */
  initialaccumulated: PropTypes.number,
  /**Specifies element containing buttons for selected filter */
  buttonschildren: PropTypes.element,
  /**Specifies element containing conent for selected filter */
  contentchildren: PropTypes.element,
  /**Specifies final accumulated for period */
  finalaccumulated: PropTypes.number,
};
/**Aggregated data table */
function AggregatedTable({ data, type, total }) {
  if (data.length !== 0) {
    return (
      <div className="h-100">
        <div
          className="customheight border-2 border-bottom border-warning text-center"
          style={{ "--h": "12%" }}
        >
          {"Aggregated Table " + type}
        </div>
        <div
          className="customheight border-2 border-bottom border-warning"
          style={{ "--h": "10%" }}
        >
          <div className="row align-content-center h-100">
            <div className="col-7 p-1 ps-4">Item</div>
            <div className="col-5 p-1">Amount</div>
          </div>
        </div>

        <div className="customheight ofx-hidden pt-2" style={{ "--h": "68%" }}>
          {data.map((item) => (
            <div className="row">
              <div className="col-7 p-1 ps-4">{item.description}</div>
              <div className="col-5 p-1">{formatter.format(item.amount)}</div>
            </div>
          ))}
        </div>

        <div
          className="customheight border-2 border-top border-warning"
          style={{ "--h": "10%" }}
        >
          <div className="row align-content-center h-100">
            <div className="col-7 p-1 ps-4">Total</div>
            <div className="col-5 p-1">{formatter.format(total)}</div>
          </div>
        </div>
      </div>
    );
  } else {
    return <NoResulstComponent />;
  }
}
AggregatedTable.propTypes = {
  /**Specifies table data */
  data: PropTypes.object,
  /**Specifies type (expenses or income) */
  type: PropTypes.string,
  /**Specifies  total amount*/
  total: PropTypes.number,
};
/**Contains collapse control Buttons*/
function RangeSummaryButtons() {
  return (
    <>
      <div class="btn-group">
        <button
          type="button"
          class="btn btn-primary dropdown-toggle fsinhe btn-sm"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Aggregate Table
        </button>
        <ul class="dropdown-menu">
          <li>
            <a
              class="dropdown-item  "
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseAggregatedTableExpenses"
              aria-expanded="false"
              aria-controls="collapseAggregatedTableExpenses"
            >
              Expenses
            </a>
          </li>
          <li>
            <a
              class="dropdown-item  "
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseAggregatedTableIncome"
              aria-expanded="false"
              aria-controls="collapseAggregatedTableIncome"
            >
              Income
            </a>
          </li>
        </ul>
      </div>

      <div class="btn-group">
        <button
          type="button"
          class="btn btn-success dropdown-toggle fsinhe btn-sm ms-2"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Charts
        </button>
        <ul class="dropdown-menu fsinhe">
          <li>
            <a
              class="dropdown-item  "
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseExChart"
              aria-expanded="false"
              aria-controls="collapseExChart"
            >
              Expense by Category
            </a>
          </li>
          <li>
            <a
              class="dropdown-item  "
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseInChart"
              aria-expanded="false"
              aria-controls="collapseInChart"
            >
              Income by Category
            </a>
          </li>
          <li>
            <a
              class="dropdown-item  "
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseFlowChart"
              aria-expanded="false"
              aria-controls="collapseFlowChart"
            >
              Flow
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}

/**Contains Collapse Tables and Charts*/
function RangeSummaryContent({ data }) {
  let dataflow = [];

  // maps data to array of objects date and accumulated
  data.summary.forEach(function (item) {
    let newdate = new Date(
      parseInt(item.date.year),
      parseInt(item.date.month) - 1,
      parseInt(item.date.day)
    );
    dataflow.push({
      date: newdate.toISOString(),
      accumulated: parseFloat(item.accumulated),
    });
  });

  return (
    <>
      <div
        class="collapse text-warning h-100 show"
        id="collapseAggregatedTableExpenses"
      >
        <AggregatedTable
          type="Expenses"
          data={data.totalaggexbydes}
          total={data.totalexpenses}
        />
      </div>
      <div
        class="collapse text-warning h-100"
        id="collapseAggregatedTableIncome"
      >
        <AggregatedTable
          type="Income"
          data={data.totalagginbydes}
          total={data.totalincome}
        />
      </div>
      <div class="collapse text-warning h-100 py-1 px-2" id="collapseExChart">
        <PieChart data={data.totalaggexbycat} title="Expenses by Category" />
      </div>
      <div class="collapse text-warning h-100 py-1 px-2" id="collapseInChart">
        <PieChart data={data.totalagginbycat} title="Income by Category" />
      </div>
      <div class="collapse text-warning h-100 py-1 px-2" id="collapseFlowChart">
        <LineChart data={dataflow} title="Flow" filter="range" />
      </div>
    </>
  );
}
RangeSummaryContent.propTypes = {
  /**Specifies data for range filter */
  data: PropTypes,
};
/**Container for data filtered by specific range of dates */
function RangeSummary({ data }) {
  return (
    <Content
      initialaccumulated={data.transactions[0].accumulated_start}
      finalaccumulated={
        data.transactions[data.transactions.length - 1].accumulated_end
      }
      data={data}
      buttonschildren={<RangeSummaryButtons />}
      contentchildren={<RangeSummaryContent data={data} />}
    />
  );
}
RangeSummaryContent.propTypes = {
  /**Specifies data for range filter */
  data: PropTypes,
};
/**Line chart of accumulated values*/
function BarChart({ data, filter }) {
  const chartref = React.useRef();

  const datachart = {
    labels: data.map((item) =>
      filter === "year" ? months[parseInt(item.date) - 1] : item.date
    ),
    datasets: [
      {
        label: "Expenses",
        data: data.map((item) => item.totalex),
        backgroundColor: generateLightColorHex(),
      },
      {
        label: "Income",
        data: data.map((item) => item.totalin),
        backgroundColor: generateLightColorHex(),
      },
    ],
  };

  React.useEffect(() => {
    if (data.length !== 0) {
      const ctx = chartref.current.getContext("2d");
      const stackedBar = new Chart(ctx, {
        type: "bar",
        data: datachart,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: filter === "year" ? "Month" : "Day",
              },
            },
            y: {
              ticks: {
                callback: function (value, index, ticks) {
                  return formatter.format(value);
                },
                beginAtZero: true,
              },
              title: {
                display: true,
                text: "Amount",
              },
            },
          },
        },
      });
    }

    return () => {};
  }, []);

  if (data.length !== 0) {
    return (
      <div className="h-100 bg-white rounded-3 chart-lg-w75">
        <canvas ref={chartref}></canvas>
      </div>
    );
  } else {
    return "No Results";
  }
}
BarChart.propTypes = {
  /**Specifies chart summarized data */
  data: PropTypes.object,
  /**Specifies type of filter */
  filter: PropTypes.string,
};
