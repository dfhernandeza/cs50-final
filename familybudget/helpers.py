from .models import Schedule, DayWeek, DayYear
import calendar
import datetime
from django.db.models import Q


def getTransactions(user, filters, year=None, month=None, day=None, start=None, end=None):
    """
    returns object containing summarized data for provided filter
    """
    result = {}

    baseline = user.baseline  # baseline is amount of money at registration moment
    date_joined = user.date_joined.date()  # date of registration

    if filters == "month":
        # getting last day of month
        lastday = calendar.monthrange(year, month)[1]
        # getting end date object
        end = datetime.date(year, month, 1) - datetime.timedelta(days=1)
        # getting start date object
        start = date_joined
        # accumulated (from date joined to day before first day of requested month)
        accumulated = baseline + accumulatedFunction(start, end, user)
        # 
        if date_joined.year == year and date_joined.month == month:
            start = date_joined
        else: 
            start = datetime.date(year, month, 1)

        # get a dict with summarized data
        result = getTransactionsObject(start, datetime.date(year, month, lastday), user, accumulated)
        finalist = []
        # filter data for chart representation
        for transaction in result["transactions"]:
            accumulateditem = 0
            if len(finalist) == 0:
                accumulateditem = transaction["accumulated_start"]
            else:
                accumulateditem = transaction["accumulated_end"]
            finalist.append({
                "date": transaction["date"]["day"],
                "totalin": transaction["totalin"],
                "totalex": transaction["totalex"],
                "delta": transaction["dayresult"],
                "accumulated": accumulateditem})
        result["summary"] = finalist

    elif filters == "date":
        # getting end date object (one day before)
        end_flow = datetime.date(year, month, day) - datetime.timedelta(days=1)
        # getting start date object
        date = datetime.date(year, month, day)

        accumulated = baseline + \
            accumulatedFunction(date_joined, end_flow, user)
        result = getTransactionsObject(date, date, user, accumulated)

    elif filters == "range":
        # getting end date object (one day before)
        end_flow = start - datetime.timedelta(days=1)

        accumulated = baseline + \
            accumulatedFunction(date_joined, end_flow, user)

        result = getTransactionsObject(start, end, user, accumulated)
        summarylist = []
        for e in result["transactions"]:
            accumulateditem = 0
            if len(summarylist) == 0:
                accumulateditem = e["accumulated_start"]
            else:
                accumulateditem = e["accumulated_end"]
            summarylist.append({"date": e["date"], "accumulated": accumulateditem})
        result["summary"] = summarylist

    elif filters == "year":

        # if the year is same as joined date year then that is the date used as start date
        if date_joined.year == year:

            # end date as last day of year
            end_date = datetime.date(year=year, month=12, day=31)
            result = getTransactionsObject(
                date_joined, end_date, user, baseline)
        else:
            # first day of year date
            start_date = datetime.date(year=year, month=1, day=1)
            # last day of year date
            end_date = datetime.date(year=year, month=12, day=31)
            # one day before of the start date
            end_date_accumulated = start_date - datetime.timedelta(days=1)
            accumulated = baseline + accumulatedFunction(
                date_joined, end_date_accumulated, user)  # calculate accumulated between date joined and one day before the start of requested year

            result = getTransactionsObject(
                start_date, end_date, user, accumulated)

        # summarize data to aggregate income and expenses by month
        finallist = []
        for e in result["transactions"]:
            found = False
            for item in finallist:
                # if month is found in the finallist then sum the income and expenses to the actual sum
                if item["date"] == e["date"]["month"]:
                    item["totalin"] = item["totalin"] + e["totalin"]
                    item["totalex"] = item["totalex"] + e["totalex"]
                    item["delta"] = item["delta"] + e["totalin"] - e["totalex"]
                    found = True
            # if month is not found in the finallist then a new dict is appended
            if found == False:
                lastday = calendar.monthrange(year, e["date"]["month"])[
                    1]  # calculate last day of the month
                # filter transactions to find last day of the month transactions and retrive accumulated
                lastitem = list(filter(lambda x: (
                    x["date"]["month"] == e["date"]["month"] and x["date"]["day"] == lastday), result["transactions"]))
                finallist.append({
                    "date": e["date"]["month"],
                    "totalin": e["totalin"],
                    "totalex": e["totalex"],
                    "delta": e["totalin"] - e["totalex"],
                    "accumulated": lastitem[0]["accumulated_end"]
                })
        result["summary"] = finallist

    return result


def transFunction(year, month, day, transactions, user):
    """
    populates transactions list with dictionary containing list of expenses and income, total amount of expenses and income, aggregate amounts by category, and the flow of cash at the end of the day
    """
    expensesbydate = []
    incomebydate = []
    # getting an instance of date
    date_object = datetime.datetime(year, month, day).date()

    dayweekindex = date_object.weekday()
    # get instance of dayweek object
    dayweek = DayWeek.objects.get(pk=dayweekindex)
    day = date_object.day
    month = date_object.month
    dayyear = DayYear.objects.filter(day=day, month=month).first()

    # Query database to get schedules for current user, for same day of the week, day of month, day of year, exact date and date in date range
    schedules = Schedule.objects.filter(Q(daysweek=dayweek) | Q(date=date_object) | (Q(dayofyear=dayyear) & Q(
        dayofyear__isnull=False)) | Q(dayofmonth=day) | (Q(rangef__lte=date_object) & Q(ranget__gte=date_object)), transaction__user=user)

    # Expenses
    # ===========================================================================================================================================
    schedulese = schedules.filter(
        transaction__category__type__description='EXPENSE').select_related('transaction')  # filter to get only expenses transactions

    # Weekly schedule expenses
    wse = schedulese.filter(type__type='DOW')
    # Weekly expenses
    we = filterFunction(wse, date_object)
    # Monthly schedules expenses
    mse = schedulese.filter(type__type='OM')
    # Monthly expenses
    me = filterFunction(mse, date_object)
    # Yearly schedules expenses
    yse = schedulese.filter(type__type='OY')
    # Yearly expenses
    ye = filterFunction(yse, date_object)
    # Unique schedules expenses
    use = schedulese.filter(type__type='U')
    # Unique expenses
    ue = filterFunction(use, date_object)
    # Range schedules expenses
    rse = schedulese.filter(type__type='R')
    # Range expenses
    re = filterFunction(rse, date_object)

    expensesbydate = we + me + ye + ue + re

    # sum the values with same keys
    exaggregatescat = aggrefateFunc(expensesbydate, "category")
    exaggregatesdes = aggrefateFunc(expensesbydate, "description")
    # Income
    # ===========================================================================================================================================
    schedulesi = schedules.filter(
        transaction__category__type__description='INCOME').select_related('transaction')
    # Weekly schedules income
    wsi = schedulesi.filter(type__type='DOW')
    # Weekly income
    wi = filterFunction(wsi, date_object)
    # Monthly schedules income
    msi = schedulesi.filter(type__type='OM')
    # Monthly income
    mi = filterFunction(msi, date_object)
    # Yearly schedules income
    ysi = schedulesi.filter(type__type='OY')
    # Yearly income
    yi = filterFunction(ysi, date_object)
    # Unique schedules income
    usi = schedulesi.filter(type__type='U')
    # Unique income
    ui = filterFunction(usi, date_object)
    # Range schedules income
    rsi = schedulesi.filter(type__type='R')
    # Range income
    ri = filterFunction(rsi, date_object)

    incomebydate = wi + mi + yi + ui + ri

    # sum the values with same keys
    # income aggregate by category
    inaggregatescat = aggrefateFunc(incomebydate, "category")
    # income aggregate by description
    inaggregatesdes = aggrefateFunc(incomebydate, "description")

    # total amount of expenses
    totaldayexpenses = sum(item['amount'] for item in expensesbydate)
    totaldayincome = sum(item['amount']
                         for item in incomebydate)  # total amount of income
    # calculate flow of cash for the range of requested dates
    dayflow = 0
    if len(transactions) == 0:
        dayflow = totaldayincome - totaldayexpenses
    else:
        dayflow = transactions[len(
            transactions) - 1]["dayflow"] + totaldayincome - totaldayexpenses
    transactions.append({
        "date": {"day": date_object.day, "month": date_object.month, "year": date_object.year},
        "expenses": expensesbydate,
        "income": incomebydate,
        "totalex": totaldayexpenses,
        "totalin": totaldayincome,
        "dayinaggregatecat": inaggregatescat,
        "dayinaggregatedes": inaggregatesdes,
        "dayexaggregatecat": exaggregatescat,
        "dayexaggregatedes": exaggregatesdes,
        "dayresult": totaldayincome - totaldayexpenses,
        "dayflow": dayflow
    })


def aggrefateFunc(trans, key):
    """
    Returns a list of dicts containing the aggregate result by provided key
    """
    td = dict()

    for e in trans:
        cat = e[key]
        td[cat] = td.get(cat, 0) + e["amount"] # looks for key in td, if it does not exists then its value will be zero + amount, otherwise it will be actual value + amount
    aggregateslist = [{key: k, 'amount': v} for k, v in td.items()] # converts dict in a list of dicts
    return aggregateslist


def filterFunction(list, date_object):
    """
    Filters schedules to consider only active schedules on requested date and generates a list of dicts with clean data 
    """
    listf = []
    for item in list:
        # schedules not longer actives
        if item.end is not None and item.start is not None:
            # check if date is inside active dates range
            if (date_object >= item.start and date_object <= item.end):
                listf.append({
                    "amount": item.transaction.amount,
                    "description": item.transaction.description,
                    "category": item.transaction.category.description

                })
        # if schedule is active (null end date)
        if item.end is None and item.start is not None:
            # requested date must be equal or greater than schedule start date
            if date_object >= item.start:
                listf.append({
                    "amount": item.transaction.amount,
                    "description": item.transaction.description,
                    "category": item.transaction.category.description

                })
        # exact date and range of dates not need filter
        if item.end is None and item.start is None:
            listf.append({
                "amount": item.transaction.amount,
                "description": item.transaction.description,
                "category": item.transaction.category.description

            })
    return listf


def getdatesBetween(start, end):
    """
    Returns every date object between start and end date provided
    """
    dates = []
    delta = end - start
    for i in range(delta.days + 1):
        day = start + datetime.timedelta(days=i)
        dates.append(day)
    return dates


def accumulatedFunction(start, end, user):
    """Returns flow of cash between provided dates"""
    accumulatedTrans = []
    dates_between = getdatesBetween(start, end)
    flow = 0
    for date in dates_between:
        # populate accumulatedTrans list
        transFunction(date.year, date.month, date.day, accumulatedTrans, user)
        # aggregates flow 
        flow = flow + accumulatedTrans[len(accumulatedTrans) - 1]["dayresult"]
    return flow


def getTransactionsObject(start, end, user, flow):
    """Returns dict containing summarized data. Iterates between start and end dates and stores transactions, aggregated values and flow of cash"""
    result = {}
    transactions = []
    # income aggregated list by category
    inaggregateslistcat = []
    # expenses aggregated list by category
    exaggregateslistcat = []
    # income aggregated list by description
    inaggregateslistdes = []
    # expenses aggregated list by description
    exaggregateslistdes = []
    dates_between = getdatesBetween(start, end)
    for date in dates_between:
        # for each date it will insert new dict to transactions list
        transFunction(date.year, date.month, date.day, transactions, user)
        # aggregate values
        inaggregateslistcat = inaggregateslistcat + \
            transactions[len(transactions) - 1]["dayinaggregatecat"]
        inaggregateslistdes = inaggregateslistdes + \
            transactions[len(transactions) - 1]["dayinaggregatedes"]
        exaggregateslistcat = exaggregateslistcat + \
            transactions[len(transactions) - 1]["dayexaggregatecat"]
        exaggregateslistdes = exaggregateslistdes + \
            transactions[len(transactions) - 1]["dayexaggregatedes"]
        # first record takes flow from accumulated flow (accumulated cash flow before date requested), then flow is aggregated and updated
        transactions[len(transactions) - 1]["accumulated_start"] = flow
        # cash flow is updated from day result (income - expenses)
        flow = flow + transactions[len(transactions) - 1]["dayresult"]
        # finally set accumulated cash flow for current date
        transactions[len(transactions) - 1]["accumulated_end"] = flow

    # cash flow at the end of requested range of dates
    result["flow"] = flow
    result["transactions"] = transactions
    totalexpenses = sum(item['totalex'] for item in transactions)
    totalincome = sum(item['totalin'] for item in transactions)
    result["totalexpenses"] = totalexpenses
    result["totalincome"] = totalincome

    # aggregate income by category
    result["totalagginbycat"] = aggrefateFunc(inaggregateslistcat, "category")
     # aggregate expenses by category
    result["totalaggexbycat"] = aggrefateFunc(exaggregateslistcat, "category")
     # aggregate expenses by description
    result["totalaggexbydes"] = aggrefateFunc(
        exaggregateslistdes, "description")
     # aggregate income by category
    result["totalagginbydes"] = aggrefateFunc(
        inaggregateslistdes, "description")
    return result
