﻿function compareUsersIn(usrA, usrB) //for sort with key input
{
    return usrB.bytes_in - usrA.bytes_in;
}

function compareUsersOut(usrA, usrB) //for sort with key output
{
    return usrB.bytes_out - usrA.bytes_out;
}

function compareSummary(usrA, usrB) //sort by summary in and out
{
    return usrB.bytes - usrA.bytes;
}
//------------------------------------------------------------------------------------------


function getStructure(dataStringIn) //parsing. Return value users structure
{
    var i, j, i1 = -1, j1 = 0, pos1 = 0, counter = 0;
    var dataString;
    var users = [];

    //check
    if (!dataStringIn) {
        return [];
    }

    //cutting header---
    var strP = dataStringIn.indexOf("\n", 0);
    dataString = dataStringIn.substring(strP + 1, dataStringIn.length);
    //-----------------

    var dataArr = dataString.split('\n');

    for (i = 0; i < dataArr.length - 1; i++) {
        var subArr = dataArr[i].split(',');
        if (subArr[0] != " ")
            counter++;
    }

    for (i = 0; i < counter; i++) {
        users.push({});
        users[i].user = [];
    }

    for (i = 0; i < dataArr.length - 1; i++) {
        var elemArr = dataArr[i].split(',');
        if (elemArr[0] != " ") {
            i1++;
            j1 = 0;
            users[i1].data = elemArr[0]; //document.write("!"+elemArr[0]+"!"); document.write("<br>");
            users[i1].time = elemArr[1];
        }
        users[i1].user.push({});
        users[i1].user[j1].UID = elemArr[4];
        users[i1].user[j1].bytes_in = elemArr[5];
        users[i1].user[j1].packets_in = elemArr[6];
        users[i1].user[j1].bytes_out = elemArr[7];
        users[i1].user[j1].packets_out = elemArr[8];
        j1++;
    }

    return users;
}

function getIdxEnd(endT, endD, usrList) {
    var endTime = endT.split(':');
    var endDate = endD.split(' ');

    var idxEnd = -1;

    for (var i = usrList.length - 1; i >= 0; i--) {
        var curTime = usrList[i].time.split(':');
        var curDate = usrList[i].data.split(' ');

        var d1 = new Date(parseInt(endDate[2], 10), (parseInt(endDate[1], 10)) - 1, parseInt(endDate[0], 10), parseInt(endTime[0], 10), parseInt(endTime[1], 10), parseInt(endTime[2], 10));
        var d2 = new Date(parseInt(curDate[2], 10), (parseInt(curDate[1], 10)) - 1, parseInt(curDate[0], 10), parseInt(curTime[0], 10), parseInt(curTime[1], 10), parseInt(curTime[2], 10));

        idxEnd = usrList.length - 1;

        if (d1 <= d2) {
            idxEnd = i;
            break;
        }
    }

    return idxEnd;
}

function getIdxStart(startT, startD, usrList) {
    var startTime = startT.split(':');
    var startDate = startD.split(' ');

    var idxStart = -1;

    for (var i = 0; i < usrList.length; i++) {
        var curTime = usrList[i].time.split(':');
        var curDate = usrList[i].data.split(' ');

        var d1 = new Date(parseInt(startDate[2], 10), (parseInt(startDate[1], 10)) - 1, parseInt(startDate[0], 10), parseInt(startTime[0], 10), parseInt(startTime[1], 10), parseInt(startTime[2], 10));
        var d2 = new Date(parseInt(curDate[2], 10), (parseInt(curDate[1], 10)) - 1, parseInt(curDate[0], 10), parseInt(curTime[0], 10), parseInt(curTime[1], 10), parseInt(curTime[2], 10));


        if (d1 <= d2) {//check it, please
            idxStart = i;
            break;
        }
    }

    return idxStart;
}

function getTop(mode, startD, startT, endD, endT, usrList)  //just sort. If sort by input info, then insert 1 as "input". If sort by output - "input" = 0. StartD, endD - start and end data
    //startT, endT - start and end time. usrList - our structure.
    //IMPORTANT!!! start, end time must be exactly like in the measurements! 
    //TODO: make time choosing according to measurement's time. (Not random)
{
    if (startT === "" || startD === "" || endT === "" || endD === "" || usrList === [])
        return [];

    var i, j;
    var topUsers = [];
    i = usrList.length - 1;
    if (i === -1)
        return [];

    idxStart = getIdxStart(startT, startD, usrList);
    idxEnd = getIdxEnd(endT, endD, usrList);

    if (idxStart == -1 || idxEnd == -1)
        return [];

    for (j = 0; j < usrList[idxEnd].user.length; j++) {
        topUsers.push({});
    }

    for (j = 0; j < usrList[idxEnd].user.length; j++) {
        topUsers[j].UID = usrList[idxEnd].user[j].UID;
        topUsers[j].packets_in = 0;
        topUsers[j].packets_out = 0;
        topUsers[j].bytes_in = 0;
        topUsers[j].bytes_out = 0;
    }

    i = idxStart;
    while (i <= idxEnd) {
        for (j = 0; j < usrList[i].user.length; j++) {
            topUsers[j].packets_in = topUsers[j].packets_in * 1 + usrList[i].user[j].packets_in * 1;
            topUsers[j].packets_out = topUsers[j].packets_out * 1 + usrList[i].user[j].packets_out * 1;
            topUsers[j].bytes_in = topUsers[j].bytes_in * 1 + usrList[i].user[j].bytes_in * 1;
            topUsers[j].bytes_out = topUsers[j].bytes_out * 1 + usrList[i].user[j].bytes_out * 1;
        }
        i++;
    }

    if (mode === "input") {
        topUsers.sort(compareUsersIn)
    }
    else if (mode === "output") {
        topUsers.sort(compareUsersOut);
    }

    return topUsers;
}

function getTopSummary(startD, startT, endD, endT, usrList)  //Like previous, but sort by summary in and out
{
    if (startT === "" || startD === "" || endT === "" || endD === "" || usrList === [])
        return [];

    var i, j;
    var topUsers = [];
    i = usrList.length - 1;

    idxStart = getIdxStart(startT, startD, usrList);
    idxEnd = getIdxEnd(endT, endD, usrList);

    if (idxStart == -1 || idxEnd == -1)
        return [];

    for (j = 0; j < usrList[idxEnd].user.length; j++) {
        topUsers.push({});
    }

    for (j = 0; j < usrList[idxEnd].user.length; j++) {
        topUsers[j].UID = usrList[idxEnd].user[j].UID;
        topUsers[j].packets_in = 0;
        topUsers[j].packets_out = 0;
        topUsers[j].bytes_in = 0;
        topUsers[j].bytes_out = 0;
        topUsers[j].packets = 0;
        topUsers[j].bytes = 0;
    }

    i = idxStart;
    while (i <= idxEnd) {
        for (j = 0; j < usrList[i].user.length; j++) {
            topUsers[j].packets_in = topUsers[j].packets_in * 1 + usrList[i].user[j].packets_in * 1;
            topUsers[j].packets_out = topUsers[j].packets_out * 1 + usrList[i].user[j].packets_out * 1;
            topUsers[j].bytes_in = topUsers[j].bytes_in * 1 + usrList[i].user[j].bytes_in * 1;
            topUsers[j].bytes_out = topUsers[j].bytes_out * 1 + usrList[i].user[j].bytes_out * 1;
            topUsers[j].packets = topUsers[j].packets * 1 + usrList[i].user[j].packets_in * 1 + usrList[i].user[j].packets_out * 1;
            topUsers[j].bytes = topUsers[j].bytes * 1 + usrList[i].user[j].bytes_in * 1 + usrList[i].user[j].bytes_out * 1;
        }
        i++;
    }

    topUsers.sort(compareSummary);

    return topUsers;
}

function getTime(startD, startT, endD, endT, usrList) {
    if (startT === "" || startD === "" || endT === "" || endD === "" || usrList === [])
        return [];

    var i, j;
    var times = [];
    if (usrList.length == 0)
        return [];

    idxStart = getIdxStart(startT, startD, usrList);
    idxEnd = getIdxEnd(endT, endD, usrList);

    i = idxStart;
    j = 0;
    while (i <= idxEnd) {
        times[j] = usrList[i].data + " " + usrList[i].time;
        j++;
        i++;
    }

    return times;
}

function getTicks(times) {
    var ticks = [];
    ticks[0] = 0;
    for (var i = 1; i < times.length; i++)
        ticks[i] = ticks[i - 1] * 1 + 1;
    return ticks;
}

function getGraphic(mode, startD, startT, endD, endT, usrList) {
    if (startT === "" || startD === "" || endT === "" || endD === "" || usrList === [])
        return [];

    var graphUsers = [];
    var i, j;

    if (usrList.length == 0)
        return [];

    idxStart = getIdxStart(startT, startD, usrList);
    idxEnd = getIdxEnd(endT, endD, usrList);

    if (idxStart == -1 || idxEnd == -1)
        return [];

    i = idxStart;
    j = 0;
    while (i <= idxEnd) {
        graphUsers[j] = 0;
        i++;
        j++;
    }

    i = idxStart;
    var k = 0;
    var sum = 0;

    while (i <= idxEnd) {
        for (j = 0; j < usrList[i].user.length; j++) {
            if (mode === "input")
                sum = sum * 1 + usrList[i].user[j].bytes_in * 1;
            if (mode === "output")
                sum = sum * 1 + usrList[i].user[j].bytes_out * 1;
            if (mode === "both")
                sum = sum * 1 + usrList[i].user[j].bytes_in * 1 + usrList[i].user[j].bytes_out * 1;
        }
        sum = sum / 1024;
        sum = sum / 1024;
        graphUsers[k] = sum;
        sum = 0;
        i++;
        k++;
    }
    return graphUsers;
}
function getTopGraphic(n, startD, startT, endD, endT, usrList, ids) {
    if (startT === "" || startD === "" || endT === "" || endD === "" || usrList === [] || ids.length == 0)
        return [];

    var i, j;
    var usr = [];

    if (usrList.length == 0)
        return [];

    for (i = 0; i < n; i++) {
        usr.push({});
        usr[i].bytes = [];
    }

    if (n > ids.length)
        n = ids.length;

    for (i = 0; i < n; i++)
        usr[i].UID = ids[i];

    idxStart = getIdxStart(startT, startD, usrList);
    idxEnd = getIdxEnd(endT, endD, usrList);

    if (idxStart == -1 || idxEnd == -1)
        return [];

    i = idxStart;
    var k = 0;
    var sum = 0;

    while (i <= idxEnd) {
        for (j = 0; j < n; j++) {
            for (var f = 0; f < usrList[i].user.length; f++) {
                if (usrList[i].user[f].UID == usr[j].UID) {
                    sum = usrList[i].user[f].bytes_in * 1 + usrList[i].user[f].bytes_out * 1;
                    sum = sum / 1024;
                    sum = sum / 1024;
                    usr[j].bytes[k] = sum;
                }
            }
        }
        i++;
        k++;
    }
    return usr;
}

function topCut(n, topUsers) {
    if (n === "" || topUsers === [])
        return [];

    var cutTop = [];

    if (n > topUsers.length)
        return topUsers;

    for (var i = 0; i < n; i++)
        cutTop.push({});

    for (var i = 0; i < n; i++) {
        cutTop[i].UID = topUsers[i].UID;
        cutTop[i].packets_in = topUsers[i].packets_in;
        cutTop[i].packets_out = topUsers[i].packets_out;
        cutTop[i].bytes_in = topUsers[i].bytes_in;
        cutTop[i].bytes_out = topUsers[i].bytes_out;
    }
    return cutTop;
}

function timeCut(n, times) {
    var cutT = [];
    for (var i = 0; i < n; i++)
        cutT[i] = times[i];
    return cutT;
}

function getIds(users) {
    var ids = [];
    if (users.length == 0)
        return [];
    for (var i = 0; i < users.length; i++)
        ids[i] = users[i].UID;
    return ids;
}

function getDates(startD, endD) {
    var i = 0, today;
    var dates = [];
    var m, d, monthIn, dayIn;

    var first = startD.split(' ');
    var last = endD.split(' ');
    if (last[1].substring(0, 1) == "0")
        last[1] = last[1].substring(1, 2);
    today = new Date(first[2], first[1] - 1, first[0]);
    while (today.getDate() != last[0] || today.getMonth() != last[1] - 1 || today.getFullYear() != last[2]) {
        m = today.getMonth() * 1 + 1;
        d = today.getDate();

        if (m >= 1 && m <= 9)
            monthIn = "0" + m;
        else
            monthIn = m;

        if (d >= 1 && d <= 9)
            dayIn = "0" + d;
        else
            dayIn = d;
        dates[i] = dayIn + " " + monthIn + " " + today.getFullYear();
        today.setDate(today.getDate() + 1);
        i++;
    }
    m = today.getMonth()*1 + 1;
    d = today.getDate();

    if (m >= 1 && m <= 9)
        monthIn = "0" + m;
    else
        monthIn = m;

    if (d >= 1 && d <= 9)
        dayIn = "0" + d;
    else
        dayIn = d;

    dates[i] = dayIn + " " + monthIn + " " + today.getFullYear();
    return dates;
}

function getFilenames(dates) {
    var outFile = "", i;
    var files = [];
    if (dates.length == 0)
        return [];

    for (i = 0; i < dates.length; i++) {
        var file = dates[i].split(' ');
        outFile = "trafficFile-" + file[2] + "-" + file[1] + "-" + file[0] + ".csv";
        files[i] = outFile;
    }
    return files;
}

function usersInit(target) {
    var _value = ko.observableArray();  //private observable

    var loaded = true;

    var result = ko.computed({
        read: function () {
            if (loaded) {
                loaded = false;
                var fileNames = target.fileNames();
                _value([]);
                if (!fileNames.length) {
                    loaded = true;
                } else {
                    for (var i = 0; i < fileNames.length; ++i) {
                        jQuery.ajaxQueue({
                            url: fileNames[i],
                            dataType: "text"
                        }).done(function (data) {
                            _value(_value().concat(getStructure(data)));
                            if (_value.length == i) {
                                loaded = true;
                            }
                        }).fail(function (jqXHR, textStatus, error) {
                            alert("There's no such file:" + jqXHR.url);
                        });
                    }
                }
            }
            return _value();
        },
        deferEvaluation: true
    });

    return result;
};

function AppViewModel() {
    var _this = this;

    var todayDay = new Date();
    var month = todayDay.getMonth() * 1 + 1;
    var toDay = todayDay.getDate() + " 0" + month + " " + todayDay.getFullYear();

    var lastD = new Date();
    for (var i = 0; i < 7; i++)
        lastD.setDate(lastD.getDate() - 1);
    month = lastD.getMonth() * 1 + 1;
    var lastDay = lastD.getDate() + " 0" + month + " " + lastD.getFullYear();

    this.startDate = ko.observable(lastDay);
    this.startTime = ko.observable("08:00:00");
    this.endDate = ko.observable(toDay);
    this.endTime = ko.observable("08:00:00");

    this.dates = ko.computed(function () {
        if (_this.startDate() === "" || _this.endDate() === "")
            return [];
        return getDates(_this.startDate(), _this.endDate())
    });

    this.fileNames = ko.computed(function () {
        if (this.dates() === [])
            return [];
        return getFilenames(this.dates());
    }, this);

    this.topN = ko.observable("10");
    this.isBoth = ko.pureComputed(function () {
        if (_this.mode() === "both")
            return true;
        return false;
    })
    this.mode = ko.observable("input");
    this.modeGraph = ko.observable("all");

    this.users = ko.observableArray();

    ko.computed(function () {
        var fileNames = _this.fileNames();
        var _value = [];
        var requests = [];
        for (var i = 0; i < fileNames.length; ++i) {
            requests.push(jQuery.ajaxQueue({
                url: fileNames[i],
                dataType: "text",
                async: true
            }).done(function (data) {
                _value = _value.concat(getStructure(data));
            }).fail(function (jqXHR, textStatus, error) {
                alert("There's no such file:" + jqXHR.url);
            }));
        }
        $.when.apply($, requests).done(function () {
            _this.users(_value);
        });
    });

    this.times = ko.computed(function () {
        return getTime(this.startDate(), this.startTime(), this.endDate(), this.endTime(), this.users())
    }, this);
    this.ticks = ko.computed(function () {
        return getTicks(this.times())
    }, this)

    this.selectedUsersAll = ko.pureComputed(function () {
        if (this.mode() === "both")
            return getTopSummary(this.startDate(), this.startTime(), this.endDate(), this.endTime(), this.users());
        return getTop(this.mode(), this.startDate(), this.startTime(), this.endDate(), this.endTime(), this.users());
    }, this);

    this.selectedUsers = ko.pureComputed(function () {
        return topCut(this.topN(), this.selectedUsersAll());
    }, this);

    this.selectedUsersSum = ko.pureComputed(function () {
        return getTopSummary(this.startDate(), this.startTime(), this.endDate(), this.endTime(), this.users());
    }, this);

    this.ids = ko.computed(function () {
        if (this.selectedUsersAll() === [])
            return [];
        return getIds(this.selectedUsersSum());
    }, this);

    this.top5 = ko.computed(function () {
        return getTopGraphic(5, this.startDate(), this.startTime(), this.endDate(), this.endTime(), this.users(), this.ids());
    }, this);

    this.top10 = ko.computed(function () {
        return getTopGraphic(10, this.startDate(), this.startTime(), this.endDate(), this.endTime(), this.users(), this.ids());
    }, this);

    this.inUsers = ko.computed(function () {
        return getGraphic("input", this.startDate(), this.startTime(), this.endDate(), this.endTime(), this.users());
    }, this);

    this.outUsers = ko.computed(function () {
        return getGraphic("output", this.startDate(), this.startTime(), this.endDate(), this.endTime(), this.users());
    }, this);

    this.bothUsers = ko.computed(function () {
        return getGraphic("both", this.startDate(), this.startTime(), this.endDate(), this.endTime(), this.users());
    }, this);

    var tpb = $("#timepicker_begin").timepicker({
        timeFormat: "HH:mm:ss",
        startTime: "00:00:00",
        interval: 15
    });

    var tpe = $("#timepicker_end").timepicker({
        timeFormat: "HH:mm:ss",
        startTime: "00:00:00",
        interval: 15
    });

    ko.computed(function () {
        if (_this.users()[0]) {
            var lastDate = _this.users()[_this.users().length - 1].time.split(':');
            var lastMin = lastDate[1] * 1;
            var lastSec = lastDate[2] * 1;
            lastMin = lastMin % 15;

            if (_this.startDate() == _this.endDate()) {
                tpb.timepicker().option('startTime', _this.users()[0].time);
                tpe.timepicker().option('startTime', _this.startTime() != "" ? _this.startTime() : _this.users()[0].time);
            }
            else {
                tpb.timepicker().option('startTime', _this.users()[0].time);
                var newDate = new Date(0, 0, 0, 0, lastMin, lastSec);
                tpe.timepicker().option('startTime', newDate);
            }
        }
    });

    var plot = InteractiveDataDisplay.asPlot("idd");
    var polylines1 = [];
    var polylines2 = [];
    var polylines3 = [];
    var strokes = ['blue', 'green', 'red', 'black', 'plum', 'fuchsia', 'orange', 'lightskyblue', 'saddlebrown', 'lawngreen']

    this.graphic = ko.computed(function () {

        if (this.modeGraph() === "all") {

            if (polylines2.length != 0)
                for (var k = 0; k < polylines2.length; k++)
                    polylines2[k].remove();
            if (polylines3.length != 0)
                for (var k = 0; k < polylines3.length; k++)
                    polylines3[k].remove();

            polylines1[0] = plot.polyline("Input Mb",
            {
                x: false,
                y: this.inUsers(),
                thickness: 1.5,
                stroke: 'blue'
            });

            polylines1[1] = plot.polyline("Output Mb",
             {
                 x: false,
                 y: this.outUsers(),
                 thickness: 1.5,
                 stroke: 'red'
             });

            polylines1[2] = plot.polyline("Summary Mb",
             {
                 x: false,
                 y: this.bothUsers(),
                 thickness: 1.5,
                 stroke: 'green'
             });
        }
        if (this.modeGraph() === "top5") {
            if (this.top5().length != 0) {

                if (polylines1.length != 0)
                    for (var k = 0; k < polylines1.length; k++)
                        polylines1[k].remove();
                if (polylines3.length != 0)
                    for (var k = 0; k < polylines3.length; k++)
                        polylines3[k].remove();

                for (var k = 4; k >= 0; k--) {
                    polylines2[k] = plot.polyline(this.top5()[k].UID,
                    {
                        x: false,
                        y: this.top5()[k].bytes,
                        thickness: 1.5,
                        stroke: strokes[k]
                    });
                }
            }
        }

        if (this.modeGraph() === "top10") {
            if (this.top5().length != 0) {

                if (polylines1.length != 0)
                    for (var k = 0; k < polylines1.length; k++)
                        polylines1[k].remove();
                if (polylines2.length != 0)
                    for (var k = 0; k < polylines2.length; k++)
                        polylines2[k].remove();

                for (var k = 9; k >= 0; k--) {
                    polylines3[k] = plot.polyline(this.top10()[k].UID,
                    {
                        x: false,
                        y: this.top10()[k].bytes,
                        thickness: 1.5,
                        stroke: strokes[k]
                    });
                }
            }
        }

        var numAxis = plot.getAxes("bottom");
        numAxis[0].remove();
        if (this.times().length != 0 || this.ticks().length != 0)
            plot.addAxis("bottom", "labels", {
                labels: this.times(),
                ticks: this.ticks()
            });
      /*  var gridLines = $('#chart > div[data-idd-plot="grid"]');
        var grid = plot.get(gridLines[0]);
        grid.xAxis = timeAxis.axis;*/
    }, this);
}

$(document).ready(function () {

    $("#datepicker1").datepicker({
        minDate: new Date(2016, 03, 18),
        dateFormat: "dd mm yy",
        onClose: function (selectedDate) {
            $("#datepicker2").datepicker("option", "minDate", selectedDate);
        }
    });
    $("#datepicker2").datepicker({
        minDate: new Date(2016, 03, 18),
        dateFormat: "dd mm yy",
        onClose: function (selectedDate) {
            $("#datepicker1").datepicker("option", "maxDate", selectedDate);
        }
    });

    ko.bindingHandlers.timepicker = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            //initialize timepicker with some optional options
            var options = allBindingsAccessor().timepickerOptions || {},
                input = $(element).timepicker(options);

            //handle the field changing
            ko.utils.registerEventHandler(element, "time-change", function (event, time) {
                var observable = valueAccessor(),
                    current = ko.utils.unwrapObservable(observable);

                if (current !== element.value) {
                    observable(element.value);
                }
            });

            //handle disposal (if KO removes by the template binding)
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).timepicker("destroy");
            });
        },

        update: function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor()),
                // calling timepicker() on an element already initialized will
                // return a TimePicker object
                instance = $(element).timepicker();

            if (value - instance.getTime() !== 0) {
                instance.setTime(value);
            }
        }
    };

    $.ajaxSetup({
        beforeSend: function (jqXHR, settings) {
            jqXHR.url = settings.url;
        }
    });

    // Activates knockout.js
    ko.applyBindings(new AppViewModel());
});