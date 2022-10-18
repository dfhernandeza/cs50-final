from urllib import request
from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse
from django.http import JsonResponse
import json
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import Transaction, TransactionType, TransactionCategory, Schedule, ScheduleType, DayWeek, ScheduleType, User, DayYear
from datetime import datetime
from .helpers import getTransactions
import calendar


@ensure_csrf_cookie
def index(request):
    return render(request, "familybudget/index.html")


def isauthenticated(request):
    """Returns boolean after verify if user is authenticated"""
    result = {"result": request.user.is_authenticated}
    return JsonResponse(result, safe=False)


def logoutuser(request):
    """Logs user out"""
    logout(request)
    return HttpResponse(status=204)


def loginuser(request):
    """Logs user in"""
    data = json.loads(request.body)
    username = data["username"]
    password = data["password"]

    user = authenticate(request, username=username, password=password)
    # Check if authentication successful
    if user is not None:
        login(request, user)
        return HttpResponse(status=204)
    else:
        return HttpResponse(status=401, content="Invalid username and/or password.")


def passwordchange(request):
    """Updates password of logged user"""
    data = json.loads(request.body)
    username = data["username"]
    password = data["password"]
    newpassword = data["newpassword"]
    newpasswordconfirm = data["newpasswordconfirm"]

    # Ensure password matches confirmation
    if newpassword != newpasswordconfirm:
        return HttpResponse(status=401, content="Passwords must match.")

    user = authenticate(request, username=username, password=password)
    # Check if authentication successful
    if user is not None:
        user.set_password(newpassword)
        user.save()
        return HttpResponse(status=204)
    else:
        return HttpResponse(status=401, content="Invalid username and/or password.")


def register(request):
    """Creates new user by inserting it to db"""
    data = json.loads(request.body)
    first_name = data["first_name"]
    last_name = data["last_name"]
    email = data["email"]
    username = data["username"]
    baseline = data["baseline"]
    password = data["password"]
    confirmation = data["passwordconfirm"]

    # Ensure password matches confirmation
    if password != confirmation:
        return HttpResponse(status=401, content="Passwords must match.")

    # Attempt to create new user
    try:
        user = User.objects.create_user(
            username=username, email=email, password=password, first_name=first_name, last_name=last_name, baseline=baseline)
        user.save()
    except IntegrityError:
        return HttpResponse(status=401, content="Username already taken.")

    return HttpResponse(status=204)


@login_required(login_url='login')
def userinfo(request):
    """Returns json response with user's personal information"""
    user = request.user
    userinfo = {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "baseline": user.baseline,
        "date_joined": user.date_joined.date().strftime('%Y-%m-%d')
    }
    return JsonResponse(userinfo, safe=False)


def updateuserinfo(request):
    """Updates user's personal info"""
    data = json.loads(request.body)
    first_name = data["first_name"]
    last_name = data["last_name"]
    baseline = data["baseline"]
    date_joined = data["date_joined"]

    user = request.user # get instance of user object

    # update properties
    user.first_name = first_name
    user.last_name = last_name
    user.baseline = baseline
    user.date_joined = date_joined

    #save object
    user.save()
    return HttpResponse(status=204)


def newtransaction(request):
    """Inserts new transaction and its schedule to db"""
    # get submited data
    data = json.loads(request.body)
    description = data["description"].upper()
    amount = data["amount"]
    categoryId = data["categoryId"]
    option = data["option"]

    # get instance of user
    user = request.user

    # get category
    category = TransactionCategory.objects.get(pk=categoryId)

    # new transaction
    transaction = Transaction.objects.create(
        description=description, amount=amount, user=user, category=category)
    transaction.save()
    # new schedule
    schedule = Schedule()

    # monthly schedule
    if option == 'OM':
        dayofmonth = data["dayofmonth"]
        scheduletype = ScheduleType.objects.get(type='OM')
        schedule.type = scheduletype
        schedule.dayofmonth = dayofmonth
        schedule.start = datetime.today()
        schedule.transaction = transaction
        schedule.save()
    # weekly schedule    
    elif option == 'DOW':
        daysofweek = data["weekly"]
        scheduletype = ScheduleType.objects.get(type='DOW')
        schedule.type = scheduletype
        schedule.start = datetime.today()
        schedule.transaction = transaction
        schedule.save()
        for day in daysofweek:
            if day["checked"]:
                day = DayWeek.objects.get(pk=day["id"])
                schedule.daysweek.add(day)
    # yearly schedule            
    elif option == 'OY':
        date = datetime.strptime(data["dayofyear"], '%Y-%m-%d')
        dayofyear = DayYear(day=date.day, month=date.month)
        dayofyear.save()
        scheduletype = ScheduleType.objects.get(type="OY")
        schedule.type = scheduletype
        schedule.dayofyear = dayofyear
        schedule.start = datetime.today()
        schedule.transaction = transaction
        schedule.save()
    # exact date
    elif option == 'U':
        duedate = data["duedate"]
        scheduletype = ScheduleType.objects.get(type="U")
        schedule.type = scheduletype
        schedule.date = duedate
        schedule.transaction = transaction
        schedule.save()
    # range of dates   
    else:
        rangefrom = data["rangefrom"]
        rangeto = data["rangeto"]
        scheduletype = ScheduleType.objects.get(type="R")
        schedule.type = scheduletype
        schedule.rangef = rangefrom
        schedule.ranget = rangeto
        schedule.transaction = transaction
        schedule.save()

    return HttpResponse(status=204)


def updatetransaction(request):
    """updates transaction"""
    # get submited data
    data = json.loads(request.body)
    description = data["description"].upper()
    amount = data["amount"]
    categoryId = data["categoryId"]
    id = data["id"]
    # get instance of transaction class with given id
    transaction = Transaction.objects.get(pk=id)
    # update properties
    transaction.description = description
    transaction.amount = amount
    transaction.categoryId = categoryId
    # save data to db
    transaction.save()

    return HttpResponse(status=204)


def deletetransaction(request):
    """Deltes a transaction"""
    data = json.loads(request.body)
    id = int(data["id"])

    transaction = Transaction.objects.get(pk=id)
    if transaction.user.id != request.user.id:
        return HttpResponse(status=401, content="Forbidden")
    else:
        if transaction.schedule.first().type.description == "YEARLY":
            idyearly = transaction.schedule.first().dayofyear.id
            yearly = DayYear.objects.get(pk=idyearly)
            transaction.delete()
            yearly.delete()
        else:
            transaction.delete()
        return HttpResponse(status=204)


def getcategories(request, idType):
    """Returns JSON containing id and text to generate html select options"""
    type = TransactionType.objects.get(pk=idType)
    list = TransactionCategory.objects.filter(type=type)

    categories = []

    categories.append({
        "id": "",
        "text": "-CATEGORY-"
    })
    for category in list:
        categories.append({
            "id": category.id,
            "text": category.description
        })

    return JsonResponse(categories, safe=False)


def getscheduletypes(request):
    """Returns JSON with schedule types"""
    list = ScheduleType.objects.all()

    schedulestypes = []
    for item in list:
        schedulestypes.append({
            "option": item.type,
            "text": item.description
        })

    return JsonResponse(schedulestypes, safe=False)


def getdaysweek(request):
    """Returns JSON containing days of the week with checked property default to false"""
    days = list(DayWeek.objects.values())
    for day in days:
        day["checked"] = False
    return JsonResponse(days, safe=False)


@login_required(login_url='login')
def gettransactions(request, idtype):
    """Returns JSON containing expenses or income grouped by schedule type"""
    # get user
    user = request.user
    # OM Monthly
    omtransactrions = Transaction.objects.filter(
        user=user, schedule__type__type="OM", category__type__id=idtype).all()
    omexpenses = []
    for item in omtransactrions:
        end = ""
        if item.schedule.first().end is not None:
            end = item.schedule.first().end.strftime('%d-%m-%Y')
        omexpenses.append({
            "id": item.id,
            "description": item.description,
            "category": item.category.description,
            "categoryId": item.category.id,
            "amount": item.amount,
            "active": item.active,
            "schedule": {
                "id": item.schedule.first().id,
                "type": item.schedule.first().type.type,
                "dayofmonth": item.schedule.first().dayofmonth,
                "start": item.schedule.first().start.strftime('%d-%m-%Y'),
                "end": end
            }
        })

    # DOW Weekly

    dowtransactrions = Transaction.objects.filter(
        user=user, schedule__type__type="DOW", category__type__id=idtype).all()
    dowexpenses = []
    for item in dowtransactrions:
        end = ""
        if item.schedule.first().end is not None:
            end = item.schedule.first().end.strftime('%d-%m-%Y')
        dowexpenses.append({
            "id": item.id,
            "description": item.description,
            "category": item.category.description,
            "categoryId": item.category.id,
            "amount": item.amount,
            "active": item.active,
            "schedule": {
                "id": item.schedule.first().id,
                "type": item.schedule.first().type.type,
                "daysofweek": list(item.schedule.first().daysweek.values()),
                "start": item.schedule.first().start.strftime('%d-%m-%Y'),
                "end": end
            }
        })

    # OY Yearly

    oytransactrions = Transaction.objects.filter(
        user=user, schedule__type__type="OY", category__type__id=idtype).all()
    oyexpenses = []
    for item in oytransactrions:
        end = ""
        if item.schedule.first().end is not None:
            end = item.schedule.first().end.strftime('%d-%m-%Y')
        oyexpenses.append({
            "id": item.id,
            "description": item.description,
            "category": item.category.description,
            "categoryId": item.category.id,
            "amount": item.amount,
            "active": item.active,
            "schedule": {
                "id": item.schedule.first().id,
                "type": item.schedule.first().type.type,
                "start": item.schedule.first().start.strftime('%d-%m-%Y'),
                "end": end,
                "dayofyear": {
                    "day": item.schedule.first().dayofyear.day,
                    "month": item.schedule.first().dayofyear.month,

                }
            }
        })

    # U UNIQUE DATE

    utransactrions = Transaction.objects.filter(
        user=user, schedule__type__type="U", category__type__id=idtype).all()
    uexpenses = []
    for item in utransactrions:
        uexpenses.append({
            "id": item.id,
            "description": item.description,
            "category": item.category.description,
            "categoryId": item.category.id,
            "amount": item.amount,
            "active": item.active,
            "schedule": {
                "id": item.schedule.first().id,
                "type": item.schedule.first().type.type,
                "datefa": item.schedule.first().date.strftime('%Y-%m-%d'),
                "datefb": item.schedule.first().date.strftime('%d-%m-%Y'),
            }
        })

    # R RANGE

    rtransactrions = Transaction.objects.filter(
        user=user, schedule__type__type="R", category__type__id=idtype).all()
    rexpenses = []
    for item in rtransactrions:
        rexpenses.append({
            "id": item.id,
            "description": item.description,
            "category": item.category.description,
            "categoryId": item.category.id,
            "amount": item.amount,
            "active": item.active,
            "schedule": {
                "id": item.schedule.first().id,
                "type": item.schedule.first().type.type,
                "datefromfa": item.schedule.first().rangef.strftime('%Y-%m-%d'),
                "datefromfb": item.schedule.first().rangef.strftime('%d-%m-%Y'),
                "datetofa": item.schedule.first().ranget.strftime('%Y-%m-%d'),
                "datetofb": item.schedule.first().ranget.strftime('%d-%m-%Y'),
            }
        })

    response = {
        "OM": omexpenses,
        "DOW": dowexpenses,
        "OY": oyexpenses,
        "U": uexpenses,
        "R": rexpenses
    }
    return JsonResponse(response, safe=False)


@login_required(login_url='login')
def closetransaction(request):
    """Unsuscribes a expense or icome schedule"""
    # load data
    data = json.loads(request.body)
    id = data["id"]
    enddate = data["enddate"]

    # get transaction and schedule
    transaction = Transaction.objects.get(pk=id)
    schedule = transaction.schedule.first()

    try:
        # Update end date
        schedule.end = enddate
        schedule.save()
        # Update status
        transaction.active = False
        transaction.save()

    except:
        return HttpResponse(status=401)

    return HttpResponse(status=204)


@login_required(login_url='login')
def dayweekaddremove(request):
    """Adds or removes a day from a weekly schedule"""
    data = json.loads(request.body)

    # store data in variables
    idschedule = data["idschedule"]
    iddaysweek = data["idscheduledaysweek"]

    # get day of week and schedule instances
    day = DayWeek.objects.get(pk=iddaysweek)
    schedule = Schedule.objects.get(pk=idschedule)

    # checking if provided day is already been added
    rlshpexists = schedule.daysweek.filter(pk=iddaysweek).exists()
    try:
        if rlshpexists:
            # if exists then the day is removed
            schedule.daysweek.remove(day)
        else:
            # otherwise the day is added
            schedule.daysweek.add(day)
    except:
        return HttpResponse(status=401, content="")

    return HttpResponse(status=204)


@login_required(login_url="login")
def updatedayofmonth(request):
    """Updates day of month of monthly schedule"""
    data = json.loads(request.body)

    # store data in variables
    idschedule = data["idschedule"]
    day = data["day"]

    # get instance of schedule object
    schedule = Schedule.objects.get(pk=idschedule)
    # update day of month property
    schedule.dayofmonth = day
    # save object
    schedule.save()

    return HttpResponse(status=204)


@login_required(login_url="login")
def updatedayofyear(request):
    """Updates day of year of yearly schedule"""
    data = json.loads(request.body)

    # store data in variables
    idschedule = data["idschedule"]

    date = datetime.strptime(data["dayofyear"], '%Y-%m-%d')
    # get instance of schedule object
    schedule = Schedule.objects.get(pk=idschedule)
    dayofyear = schedule.dayofyear
    # update day of year property
    dayofyear.day = date.day
    dayofyear.month = date.month
    # save object
    dayofyear.save()

    return HttpResponse(status=204)


@login_required(login_url="login")
def updateuniquedate(request):
    """Updates date of income or expense"""
    data = json.loads(request.body)

    # store data in variables
    idschedule = data["idschedule"]
    date = data["date"]

    # get instance of schedule object
    schedule = Schedule.objects.get(pk=idschedule)

    # update date property
    schedule.date = date

    # save object
    schedule.save()

    return HttpResponse(status=204)


@login_required(login_url="login")
def updaterangedates(request):
    """Updates start and end dates of a range"""
    data = json.loads(request.body)

    # store data in variables
    idschedule = data["idschedule"]
    datefrom = data["rangefrom"]
    dateto = data["rangeto"]

    # get instance of schedule object
    schedule = Schedule.objects.get(pk=idschedule)

    # update dates properties
    schedule.rangef = datefrom
    schedule.ranget = dateto

    # save object
    schedule.save()

    return HttpResponse(status=204)


@login_required(login_url="login")
def getfilteredtrans(request):
    """Returns JSON containing filtered lists of income and expenses"""
    getdata = request.GET
    filter = getdata.get('f')
    transactions = None
    # get user
    user = request.user

    if filter == "month":
        # ensure month is integer (1-12)
        month = int(getdata.get('month'))
        # ensure year is integer 
        year = int(getdata.get('year'))
        # get date object
        transactions = getTransactions(
            user=user, filters="month", month=month, year=year)
    elif filter == "date":
        # ensure month is integer (1-12)
        month = int(getdata.get('month'))
        # ensure year is integer 
        year = int(getdata.get('year'))
        # ensure day is integer 
        day = int(getdata.get('day'))
        transactions = getTransactions(
            user=user, filters="date", month=month, year=year, day=day)
    elif filter == "range":
        start_string = getdata.get('start')
        end_string = getdata.get('end')
        # convert string date to date class
        start = datetime.strptime(start_string, '%Y-%m-%d').date()
        end = datetime.strptime(end_string, '%Y-%m-%d').date()
        transactions = getTransactions(
            user=user, filters="range", start=start, end=end)
    elif filter == "year":
        # ensure year is integer 
        year = int(getdata.get('year'))
        transactions = getTransactions(
            user=user, filters="year", year=year)
    # insert date joined property to perform restrictions
    transactions["date_joined"] = {"day": user.date_joined.date(
    ).day, "month": user.date_joined.date().month, "year": user.date_joined.date().year}
    return JsonResponse(transactions, safe=False)


@login_required(login_url="login")
def getdatejoined(request):
    """Returns JSON containing joined date"""
    return JsonResponse({"day": request.user.date_joined.date().day, "month": request.user.date_joined.date().month, "year": request.user.date_joined.date().year})
