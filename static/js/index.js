window.onload = function () {
    var teamTitle = ["团队日排行榜", "团队周排行榜", "团队月排行榜"];
    var personTitle = ["个人日排行榜", "个人周排行榜", "个人月排行榜"];
    var nodata = ["今日暂无，继续加油！", "本周暂无，继续加油！", "本月暂无，继续加油！"]
    var realdata;
    var now, days, daycounts, str;
    var mac = "a4:5e:60:d7:a0";
    window.testToken = "";
    // 使用 Mock
    var mockData;

    function getMock() {
        this.mockData = Mock.mock({
            'teamAccount|500000-50000000': 1,
            'perAccount|5000-50000': 1,
            'teamName|8': [{
                'name|1': [
                    '飞鸟队',
                    '新酒队',
                    '吉草队',
                    '花瓣队',
                    '和平队',
                    '甘地队'
                ]
            }],
            'dateTime|8': [{
                'hour|0-23': 1,
                'minute|0-59': 1
            }],
            'personName|8': [{
                'name|1': [
                    '唐可可',
                    '夏琳儿',
                    '林晓晓',
                    '贾聪聪',
                    '汪一一',
                    '徐笑笑',
                    '谭花花'
                ]
            }],
            'orderStatus|1': [
                0,
                1,
                0,
                0
            ]
        })
    }

    function createXHR() {
        if (typeof XMLHttpRequest != "undefined") {
            return new XMLHttpRequest();
        } else if (typeof ActiveXObject != "undefined") {
            if (typeof arguments.callee.actionXString != "string") {
                var versions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp"],
                    i, len;
                for (i = 0, i = versions.length; i < len; i++) {
                    try {
                        new ActiveXObject(versions[i]);
                        arguments.callee.actionXString = versions[i];
                        break;
                    } catch (ex) {}
                }
            }
            return new ActiveXObject(arguments.callee.actionXString);
        } else {
            throw new Error("No XHR object available.");
        }
    }
    // 排名XHR对象、新订单XHR对象、语音XHR对象
    var newxhr = createXHR();
    var tokenxhr = createXHR();
    var newurl = "https://crm.fudaojun.com/api/television/real-time"; // 新订单接口
    var getTokenUrl = "http://crm.fudaojun.com/api/television/token"; // 获取语音token

    getMock();
    addTeamInfo();
    addPersonInfo();
    addOrder()
    // 定时(30秒)刷新数据
    setInterval(function () {
        getMock();
        addTeamInfo();
        addPersonInfo();
        addOrder()
    }, 30000);

    newxhr.onreadystatechange = function () {
        if (newxhr.readyState == 4) {
            if ((newxhr.status >= 200 && newxhr.status < 300) || newxhr.status == 304) {
                realdata = JSON.parse(newxhr.responseText);
                newOrder(realdata);
            } else {
                console.log("Request was unsuccessful: " + newxhr.status);
            }
        }
    };
    newxhr.open("get", newurl, true);
    newxhr.setRequestHeader("platform", "whiteboard-pc");
    newxhr.send(null);
    // 定时刷新祝贺开单
    setInterval(function () {
        newxhr.open("get", newurl, true);
        newxhr.setRequestHeader("platform", "whiteboard-pc");
        newxhr.send(null);
    }, 10000);

    // 获取语音token
    tokenxhr.onreadystatechange = function () {
        if (tokenxhr.readyState == 4) {
            if ((tokenxhr.status >= 200 && tokenxhr.status < 300) || tokenxhr.status == 304) {
                window.testToken = tokenxhr.getResponseHeader("token");
            } else {
                console.log("Request was unsuccessful: " + tokenxhr.status);
            }
        }
    };
    tokenxhr.open("HEAD", getTokenUrl, true);
    tokenxhr.send();

    /**
     * 团队实时战况
     * 
     */
    function addTeamInfo() {
        var items = document.getElementById("items");
        var blocks = items.getElementsByClassName("box-item");
        // 每次刷新团队战况前，判断数据页面是否有数据然后删除原来数据
        if (blocks[0]) {
            items.removeChild(blocks[2]);
            items.removeChild(blocks[1]);
            items.removeChild(blocks[0]);
        }
        for (var n = 0; n < 3; n++) {
            var item = document.createElement('div');
            item.className = "box-item";
            var itemtitle = document.createElement('div');
            itemtitle.className = "title";
            itemtitle.appendChild(document.createTextNode(teamTitle[n]));
            item.appendChild(itemtitle);
            var itemimg = document.createElement('img');
            itemimg.src = "static/images/line2.png";
            item.appendChild(itemimg);
            var itemblock = document.createElement('div');
            itemblock.className = "item-block";
            var itemul = document.createElement('ul');

            for (var t = 0; t < 3; t++) {
                var itemli = document.createElement('li');
                var lispan1 = document.createElement('span');
                var lispan2 = document.createElement('span');
                lispan1.className = "name2 wid-44";
                lispan2.className = "amount2 wid-" + (46 - t * 6) + " MLP-" + (t * 6);
                lispan1.innerHTML = (t + 1) + " " + this.mockData.teamName[t].name;
                lispan2.innerHTML = parseInt((this.mockData.teamAccount) / (Math.pow(10, t))).toLocaleString('en-US');
                itemli.appendChild(lispan1);
                itemli.appendChild(lispan2);
                itemul.appendChild(itemli);
            }
            itemblock.appendChild(itemul);
            item.appendChild(itemblock);
            items.appendChild(item);
        }
    }
    /**
     * 个人实时战况
     *  
     */
    function addPersonInfo() {
        var personals = document.getElementById("personals");
        // 每次刷新个人战况前，判断数据页面是否有数据然后删除原来数据
        var blocks = personals.getElementsByClassName("box-item");
        if (blocks[0]) {
            personals.removeChild(blocks[2]);
            personals.removeChild(blocks[1]);
            personals.removeChild(blocks[0]);
        }
        for (var n = 0; n < 3; n++) {
            var item = document.createElement('div');
            item.className = "box-item";
            var itemtitle = document.createElement('div');
            itemtitle.className = "title";
            itemtitle.appendChild(document.createTextNode(personTitle[n]));
            item.appendChild(itemtitle);
            var itemimg = document.createElement('img');
            itemimg.src = "static/images/line2.png";
            item.appendChild(itemimg);
            var personblock = document.createElement('div');
            personblock.className = "personal-block";
            var itemul = document.createElement('ul');

            for (var m = 0; m < 3; m++) {
                var itemli = document.createElement('li');
                var lidiv = document.createElement('div');
                lidiv.className = "floatL head-div";
                var img1 = document.createElement('img');
                img1.className = "ranking-img";
                img1.src = "static/images/rank_" + (m + 1) + ".png";
                lidiv.appendChild(img1);
                var img2 = document.createElement('img');
                img2.className = "head-img";
                img2.src = "static/images/head.jpg";
                lidiv.appendChild(img2);
                var lidiv2 = document.createElement('div');
                lidiv2.className = "floatL info-div";
                var namespan = document.createElement('span');
                namespan.className = "floatL wid-100 text-center";
                namespan.innerHTML = this.mockData.personName[m].name;
                var amountspan = document.createElement('span');
                amountspan.className = "floatL amount3 text-center";
                amountspan.innerHTML = (this.mockData.perAccount - 1000 * m).toLocaleString('en-US');
                lidiv2.appendChild(namespan);
                lidiv2.appendChild(amountspan);
                if (m == 0) {
                    var img3 = document.createElement('img');
                    img3.className = "king-img";
                    img3.src = "static/images/king.png";
                    lidiv.appendChild(img3);
                    lidiv2.className = "floatL info-div king-info";
                }
                itemli.appendChild(lidiv);
                itemli.appendChild(lidiv2);
                itemul.appendChild(itemli);
            }
            personblock.appendChild(itemul);
            item.appendChild(personblock);
            personals.appendChild(item);
        }
    }
    /**
     * 最新订单
     * @param {object} data 
     */
    function newOrder(data) {
        if (JSON.stringify(data) !== "{}") {
            // 有新订单生成、调用congratulation函数
            congratulation(data);
        }
    }

    /**
     * 订单列表
     *  
     */
    function addOrder() {
        var newuser = document.getElementById("newoederuser");
        var neworg = document.getElementById("newoederorg");
        var newamount = document.getElementById("newoederamount");
        var newoedertime = document.getElementById("newoedertime");
        newuser.innerHTML = this.mockData.personName[0].name;
        neworg.innerHTML = this.mockData.teamName[0].name;
        newamount.innerHTML = this.mockData.perAccount.toLocaleString('en-US');
        newoedertime.innerHTML = this.mockData.dateTime[0].hour + ":" + this.mockData.dateTime[0].minute;
        var orderUl = document.getElementById("order");
        // 每次刷新开单战况前，判断数据页面是否有数据然后删除原来数据
        var blocks = orderUl.getElementsByClassName("order-normal");
        if (blocks[0]) {
            for (var i = 6; i >= 0; i--) {
                orderUl.removeChild(blocks[i]);
            }
        }
        for (var k = 1; k < 8; k++) {
            var orderLi = document.createElement('li');
            orderLi.className = "order-normal";
            var firstdiv = document.createElement('div');
            firstdiv.className = "order_div";
            var spanfirst = document.createElement('div');
            var spansecond = document.createElement('div');
            spanfirst.className = "text-left";
            spansecond.className = "text-right";
            spanfirst.appendChild(document.createTextNode(this.mockData.personName[k].name));
            spansecond.innerHTML = this.mockData.teamName[k].name;
            firstdiv.appendChild(spanfirst);
            firstdiv.appendChild(spansecond);
            var seconddiv = document.createElement('div');
            var timediv = document.createElement('div');
            seconddiv.className = "amount";
            seconddiv.innerHTML = (this.mockData.perAccount + 1000 * k).toLocaleString('en-US');
            timediv.className = "createtime";
            timediv.innerHTML = this.mockData.dateTime[k].hour + ":" + this.mockData.dateTime[k].minute;
            orderLi.appendChild(firstdiv);
            orderLi.appendChild(seconddiv);
            orderLi.appendChild(timediv);
            orderUl.appendChild(orderLi);
        }
    }
    /**
     * 提示祝贺开单
     * @param {object} data 
     */
    function congratulation(data) {
        var con = document.getElementsByClassName("congratulation")[0];
        con.style.display = "block";
        var div = document.getElementById("con_num");
        var userspan = document.getElementById("con_user");
        var orgspan = document.getElementById("con_org");
        var amount = data.total_price;
        userspan.innerHTML = data.user;
        orgspan.innerHTML = data.user_org;
        var html = '';
        var arr = String(amount).split('');
        for (var i = 0; i < arr.length; i++) {
            html += '<div id="num_' + i + '" class="num" data-id="' + i + '">';
            html += returnnum(10);
            html += '</div>';
        }
        document.querySelector("#con_num").innerHTML = html;
        var num = document.querySelectorAll(".num");
        var spanHeight = num[0].querySelector('span').offsetHeight;
        var numlen = num.length;
        for (var j = 0; j < numlen; j++) {
            var newi = document.createElement('b');
            newi.innerHTML = arr[num[j].getAttribute("data-id")];
            num[j].querySelector("span").appendChild(newi);
            num[j].querySelector("span").style.webkitTransition = 'all ' + (.9 + j * .1) + 's ease-in .1s'
            num[j].querySelector("span").style.webkitTransform = 'translate3d(0,-' + spanHeight + 'px,0)'
        }
        var str = "祝贺" + data.user + "开单,金额" + data.total_price + "元,加油!";
        broadcast(str, mac, window.testToken);
        // 定时6秒关闭祝贺页面
        setTimeout(function () {
            con.style.display = "none";
        }, 6000);
    }
    /**
     * 生成滚动数字
     * @param {var} num 
     */
    function returnnum(num) {
        var html = ''
        html += "<span>"
        for (var i = 0; i < num; i++) {
            for (var j = 0; j < 10; j++) {
                html += '<b>' + j + '</b>'
            }
        }
        html += "</span>"
        return html;
    }
    // 实时播报
    function broadcast(str, mac, token) {
        tokenxhr.open("HEAD", getTokenUrl, true);
        tokenxhr.send();
        console.log(window.testToken);
        var url = "http://tsn.baidu.com/text2audio?lan=zh&ctp=1&tex=" + str + "&cuid=" + mac + "&tok=" + token;
        window.open(url, "yyframe");
    }
    var now;
    // 加载当前时间
    function nowdate() {
        now = new Date();
        document.getElementById("nowdate").innerHTML = now.getFullYear() + "-" + checkTime(now.getMonth() + 1) +
            "-" + checkTime(now.getDate()) + " " + checkTime(now.getHours()) + ":" + checkTime(now.getMinutes()) +
            ":" + checkTime(now.getSeconds());
        // 获取本月的总天数
        days = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        daycounts = days.getDate();
        week = now.getDay();
        if (document.getElementsByClassName("item-block").length > 0) {
            // 每日播报
            daybroadcast();
            // 每周最后三天上午播报
            if (week == 5 || week == 6 || week == 7) {
                weekbroadcast();
            }
        }
    }
    // 日播报
    function daybroadcast() {
        var teamday = document.getElementsByClassName("item-block")[0];
        var perday = document.getElementsByClassName("personal-block")[0];
        var teamdayul = teamday.children[0].children;
        var perdayul = perday.children[0].children;
        if (now.getHours() == 19 && now.getMinutes() == 00 && now.getSeconds() == 00) {
            str = '';
            if (teamdayul.length > 0) {
                var name = teamdayul[0].children[0].innerHTML.substr(2);
                var amount = teamdayul[0].children[1].innerHTML;
                str += "截止目前，团队今日排行第一的是：" + name + "，销售额为：" + amount + "元,";
            } else {
                str += "截止目前，团队今日暂无订单,";
            }
            if (perdayul.length > 0) {
                var name = perdayul[0].children[1].children[0].innerHTML;
                var amount = perdayul[0].children[1].children[1].innerHTML;
                str += "个人今日排行第一的是：" + name + "，销售额为：" + amount + "元,";
            } else {
                str += "个人今日暂无订单";
            }
            broadcast(str, mac, window.testToken);
        }
    }
    // 周播报
    function weekbroadcast() {
        var teamweek = document.getElementsByClassName("item-block")[1];
        var perweek = document.getElementsByClassName("personal-block")[1];
        var teamweekul = teamweek.children[0].children;
        var perweekul = perweek.children[0].children;
        if (now.getHours() == 10 && now.getMinutes() == 00 && now.getSeconds() == 00) {
            str = '';
            if (teamweekul.length > 0) {
                var name = teamweekul[0].children[0].innerHTML.substr(2);
                var amount = teamweekul[0].children[1].innerHTML;
                str += "截止目前，团队本周排行第一的是：" + name + "，销售额为：" + amount + "元,";
            } else {
                str += "截止目前，团队本周暂无订单,";
            }
            if (perweekul.length > 0) {
                var name = perweekul[0].children[1].children[0].innerHTML;
                var amount = perweekul[0].children[1].children[1].innerHTML;
                str += "个人本周排行第一的是：" + name + "，销售额为：" + amount + "元,";
            } else {
                str += "个人本周暂无订单";
            }
            // 每月最后五天月播报
            if (now.getDate() > (daycounts - 5) && now.getDate() <= daycounts) {
                monthbroadcast();
            }
            broadcast(str, mac, window.testToken);
        }
    }
    // 月播报
    function monthbroadcast() {
        var teammonth = document.getElementsByClassName("item-block")[2];
        var permonth = document.getElementsByClassName("personal-block")[2];
        var teammonthul = teammonth.children[0].children;
        var permonthul = permonth.children[0].children;
        if (teammonthul.length > 0) {
            var name = teammonthul[0].children[0].innerHTML.substr(2);
            var amount = teammonthul[0].children[1].innerHTML;
            str += "截止目前，团队本月排行第一的是：" + name + "，销售额为：" + amount + "元,";
        } else {
            str += "截止目前，团队本月暂无订单,";
        }
        if (permonthul.length > 0) {
            var name = permonthul[0].children[1].children[0].innerHTML;
            var amount = permonthul[0].children[1].children[1].innerHTML;
            str += "个人本月排行第一的是：" + name + "，销售额为：" + amount + "元,";
        } else {
            str += "个人本月暂无订单";
        }
    }
    setInterval(function () {
        nowdate();
    }, 1000); //指定1秒刷新一次
};