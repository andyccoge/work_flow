{
    Vue.use(Toasted);
    // Vue.toasted.show(文字內容,{
    //   duration:1500, 停留時間 1000=1秒
    //   className:['toasted-primary','bg-danger'], 自訂class
    // });

    var ori_x = 0; // 紀錄原始位置
    var rightEnd = 0; // 工作日曆區最右位置
    var leftEnd = 0; // 工作日曆區最左位置
    var timeOut = null; // 用以儲存timeOute物件
    var hasMove = false; // 紀錄滑鼠是否有拖移
    var move_time_bar_area_scroll = function (number, absolute=false) {
        // 控制轉軸位置方法
        if(absolute){
            document.getElementById("time_bar_area").scrollLeft = number; /*更改轉軸位置*/
        }else{
            document.getElementById("time_bar_area").scrollLeft += number; /*更改轉軸位置()*/
        }
    };
    function record_time_bar_area_position() {
        // 紀錄工作日曆區最左右位置
        rightEnd = window.innerWidth - 15; // 紀錄工作最右位置
        leftEnd = $(".work_info_area").width() + 15; // 紀錄工作最左位置
    }
    function date_to_format_time(dateObj) {
        // 把date物件轉換成格式日期文字
        year = dateObj.getFullYear();
        month = dateObj.getMonth() + 1;
        date = dateObj.getDate();
        hours = dateObj.getHours();
        minutes = dateObj.getMinutes();
        format_time = year + "-" + month.toString().padStart(2, "0") + "-" + date.toString().padStart(2, "0") + " " + hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0");
        return format_time;
    }

    workFlowData = {
        editable: true, /*是否允許編輯*/

        unit_width: 200, /*一單位長度(px)*/
        unit_time: 86400, /*一單位時長(預設一天)*/
        work_sort: "create_asc", /*工作流程排序方式*/
        week_day_list: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
        hour_option: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"],
        minute_option: ["00", "30"],
        calendar_days: [{ name: "", weekday: "", holiday: false, holiday_name: "", description: "" }],

        search: {eve_id:""}, /*搜尋參數*/

        edit_panel_index : "",                                                                                              /*時間編輯面板編輯對象*/
        edit_panel : { eve_id: "0", step_order: "0", step_id: "0", name: "", u_name:"", sdate: "", edate: "", state: "" },  /*時間編輯面板*/

        /*今日日期區間*/
        current_day: { sdate: "0000-01-01 00:00", edate: "0000-01-01 00:00" },

        /*api需提供以下資料*/
        calendar: { sdate: "2021-06-01 00:00", edate: "2021-06-30 00:00" } /*所有工作最早開始&最晚結束日期*/,
        works: [
            /*各個工作的資料*/ { eve_id: "1", step_order: "1", step_id: "1", name: "甲甲公司-AAA事件：工作1-1XXXXX", u_name:"員工壹", sdate: "2021-06-06 09:00", edate: "2021-06-06 12:00", state: "" },
            { eve_id: "1", step_order: "2", step_id: "2", name: "甲甲公司-AAA事件：工作1-2XXXXX", u_name:"員工貳", sdate: "2021-06-07 09:30", edate: "2021-06-07 18:30", state: "hurry" },
            { eve_id: "1", step_order: "3", step_id: "3", name: "甲甲公司-AAA事件：工作1-3XXXXX", u_name:"員工壹", sdate: "2021-06-06 00:00", edate: "2021-06-07 00:00", state: "" },
            { eve_id: "2", step_order: "1", step_id: "4", name: "乙乙公司-BBB事件：工作1-1XXXXX", u_name:"員工叁", sdate: "2021-06-06 00:00", edate: "2021-06-08 00:00", state: "" },
            { eve_id: "3", step_order: "1", step_id: "5", name: "丙丙公司-CCC事件：工作1-1XXXXX", u_name:"員工叁", sdate: "2021-06-28 00:00", edate: "2021-06-28 00:00", state: "" },
        ],
    };
    /*初始化今日時間區間*/
    {
        var dateObj = new Date();
        current_s = dateObj.getFullYear() + "-" + (dateObj.getMonth() + 1) + "-" + dateObj.getDate();
        var current_obj = new Date(current_s);
        workFlowData.current_day.sdate = date_to_format_time(current_obj);
        current_obj.setDate(current_obj.getDate() + 1); /*再加1天作為結束時間*/
        workFlowData.current_day.edate = date_to_format_time(current_obj);
    }
    function init_vue() {
        var workFlowVM = new Vue({
            el: "#workFlow",
            data: workFlowData,
            computed: {},
            created: function () {
                this.$nextTick(function () {
                    $("#slider").slider({
                        /*初始化滑桿*/ value: 200,
                        min: 50,
                        max: 400,
                        slide: function (event, ui) {
                            this.unit_width = ui.value;
                        },
                    });
                });
            },
            updated: function () {
                this.$nextTick(function () {
                    // Code that will run only after the entire view has been re-rendered
                    $(".week_day, .eve_title, .work_time").tooltip(); /*初始化tooltip*/
                    $(".thead").css("height", $(".week_day").height() + "px"); /*設定左右兩區塊表頭同高*/
                });
            },
            methods: {
                to_time_stamp: function (format_date) {
                    d = new Date(format_date);
                    return d.getTime() / 1000;
                },
                date_obj_to_format_time(dateObj) {
                    format_time = date_to_format_time(dateObj);
                    return format_time;
                },
                date_to_input_value_date: function (format_date) {
                    return format_date.slice(0, 10);
                },
                date_to_input_value_hour: function (format_date) {
                    return format_date.slice(11, 13);
                },
                date_to_input_value_minute: function (format_date) {
                    return format_date.slice(14, 16);
                },
                input_change_time: function (event, index, time_type, work) {
                    parent = $(event.target).parent();
                    date = parent.find("input[name='date']").val();
                    hour = parent.find("select[name='hour']").val();
                    minute = parent.find("select[name='minute']").val();
                    newdate = date + " " + hour + ":" + minute;
                    // console.log(newdate);
                    /*檢查與更新某工作開/始結束時間*/

                    result = this.check_and_update_work_time(newdate, index, time_type, work);
                    if (result) {
                        Vue.toasted.show("修改時間成功", { duration: 1500, className: ["toasted-primary", "bg-success"] });
                    }
                },
                get_work_width: function (work) {
                    return ((this.to_time_stamp(work.edate) - this.to_time_stamp(work.sdate)) / this.unit_time) * this.unit_width;
                },
                get_work_position: function (work) {
                    return ((this.to_time_stamp(work.sdate) - this.to_time_stamp(this.calendar.sdate)) / this.unit_time) * this.unit_width;
                },
                get_calendar: function (scroll_to_end = false, to_current_day=false) {
                    if (this.current_day.sdate > this.calendar.edate) this.calendar.edate = this.current_day.edate;
                    if (this.current_day.edate < this.calendar.sdate) this.calendar.sdate = this.current_day.sdate;

                    cols = (this.to_time_stamp(this.calendar.edate) - this.to_time_stamp(this.calendar.sdate)) / this.unit_time;
                    cObj = [];
                    for (var i = 0; i < Array(cols).length; i++) {
                        /*製作日曆單日資料*/
                        d = new Date(this.calendar.sdate);
                        d.setSeconds(d.getSeconds() + i * this.unit_time);
                        day = {
                            name: d.getMonth() + 1 + "/" + d.getDate(),
                            weekday: this.week_day_list[d.getDay()],
                            holiday: false,
                            holiday_name: "",
                            holiday_category: "",
                            description: "",
                        };

                        /*比對假日*/
                        format_date = this.date_obj_to_format_time(d).slice(0, 10);
                        sindex = holiday_data.indexOf(format_date);
                        if (sindex != -1) {
                            day["holiday"] = true;
                            eindex = sindex + holiday_data.substring(sindex).indexOf('"}');
                            holiday = holiday_data.slice(sindex - 9, eindex + 2);
                            holiday = JSON.parse(holiday);
                            // console.log(holiday)
                            day["holiday_name"] = holiday["name"];
                            day["description"] = holiday["description"] ? holiday["holidayCategory"] + ":" + holiday["description"] : holiday["holidayCategory"];
                        }
                        cObj.push(day);
                        delete d;
                    }
                    this.calendar_days = cObj;
                    // console.log(this.calendar_days)

                    if (scroll_to_end) {
                        /*是否需要移動轉軸至末端*/
                        setTimeout(function () {
                            move_time_bar_area_scroll($(".day_row").width());
                        }, 100);
                    }

                    if(to_current_day){
                        /*轉移轉軸至今日*/;
                        setTimeout(function () {
                            move_time_bar_area_scroll($('.current_day_mark').css('left').slice(0,-2), absolute=true) 
                        }, 100);
                    }
                },
                get_diff_minutes_by_move: function (new_x) {
                    if (new_x >= rightEnd) {
                        /*如果移動超過工作日曆區最右側*/
                        diff_minutes = this.unit_time / 60; /*回傳單位時間的分鐘數*/
                        move_time_bar_area_scroll(this.unit_width); /*轉軸向右移動單位寬度*/
                    } else if (new_x <= leftEnd) {
                        /*如果移動超過工作日曆區最左側*/
                        diff_minutes = (this.unit_time / 60) * -1; /*回傳單位時間的分鐘數*/
                        move_time_bar_area_scroll(this.unit_width * -1); /*轉軸向左移動單位寬度*/
                    } else {
                        /*否則按移動比例計算*/
                        diff = new_x - ori_x;
                        diff_seconds = (diff / this.unit_width) * this.unit_time;
                        diff_minutes = Math.round(diff_seconds / 60 / 30) * 30; /*限制每次調整以30分鐘為單位*/
                    }

                    return diff_minutes;
                },
                change_width: function (index, work, time_type) {
                    if(!this.editable){ return; }

                    Vue.toasted.show("調整時間開始", { duration: 1500 });
                    /*滑鼠放掉時清空html對滑鼠移動的事件*/
                    $("html").one("mouseup", function (e) {
                        Vue.toasted.show("調整時間完成", { duration: 1500, className: ["toasted-primary", "bg-success"] });
                        $("html").off("mousemove");
                        ori_x = 0;
                    });

                    record_time_bar_area_position(); // 紀錄工作日曆區最左右位置

                    /*定義滑鼠在html上移動的事件*/
                    $("html").on("mousemove", function (e) {
                        if (ori_x != 0) {
                            diff_minutes = workFlowVM.get_diff_minutes_by_move(e.clientX);

                            if (diff_minutes) {
                                /*如果有調整到時間*/
                                var newdate = new Date(work[time_type]);
                                newdate.setMinutes(newdate.getMinutes() + diff_minutes);
                                new_format_time = workFlowVM.date_obj_to_format_time(newdate);
                                // console.log(new_format_time);
                                /*檢查與更新某工作開/始結束時間*/
                                workFlowVM.check_and_update_work_time(new_format_time, index, time_type, work);
                                ori_x = e.clientX; /*更新紀錄起始點位置*/
                            }
                        } else {
                            ori_x = e.clientX; /*更新紀錄起始點位置*/
                        }
                    });
                },
                move_work: function (index, work) {
                    if(!this.editable){ return; }

                    /*滑鼠放掉時清空html對滑鼠移動的事件*/
                    $("html").one("mouseup", function (e) {
                        if (hasMove) {
                            Vue.toasted.show("拖移工作完成", { duration: 1500, className: ["toasted-primary", "bg-success"] });
                        }
                        $("html").off("mousemove");
                        ori_x = 0;
                    });

                    record_time_bar_area_position(); // 紀錄工作日曆區最左右位置

                    /*定義滑鼠在html上移動的事件*/
                    $("html").on("mousemove", function (e) {
                        if (!hasMove) Vue.toasted.show("拖移工作開始", { duration: 1500 });
                        hasMove = true; /*有拖移*/
                        if (ori_x != 0) {
                            diff_minutes = workFlowVM.get_diff_minutes_by_move(e.clientX);

                            if (diff_minutes) {
                                /*如果有調整到時間*/
                                /*更新結束時間*/
                                var newdate = new Date(work["edate"]);
                                newdate.setMinutes(newdate.getMinutes() + diff_minutes);
                                new_format_time = workFlowVM.date_obj_to_format_time(newdate);
                                /*檢查與更新某工作開/始結束時間*/
                                workFlowVM.check_and_update_work_time(new_format_time, index, "edate", work);

                                /*更新開始時間*/
                                var newdate = new Date(work["sdate"]);
                                newdate.setMinutes(newdate.getMinutes() + diff_minutes);
                                new_format_time = workFlowVM.date_obj_to_format_time(newdate);
                                /*檢查與更新某工作開/始結束時間*/
                                workFlowVM.check_and_update_work_time(new_format_time, index, "sdate", work);

                                ori_x = e.clientX; /*更新紀錄起始點位置*/
                            }
                        } else {
                            ori_x = e.clientX; /*更新紀錄起始點位置*/
                        }
                    });
                },
                check_and_update_work_time: function (new_format_time, index, time_type, work) {
                    result = true;
                    if (time_type == "sdate") {
                        /*修改的是開始時間*/
                        if (new_format_time > work["edate"]) {
                            /*不允許比結束時間更晚*/
                            new_format_time = work["edate"];
                            Vue.toasted.show("開始時間不可超過結束時間", { duration: 1500, className: ["toasted-primary", "bg-danger"] });
                            result = false;
                        }
                    } else if (time_type == "edate") {
                        /*修改的是結束時間*/
                        if (new_format_time < work["sdate"]) {
                            /*不允許比開始時間更早*/
                            new_format_time = work["sdate"];
                            Vue.toasted.show("結束時間不可早於開始時間", { duration: 1500, className: ["toasted-primary", "bg-danger"] });
                            result = false;
                        }
                    }
                    this.works[index][time_type] = new_format_time; /*更改此工作的時間*/

                    this.get_area_s_e_date(); /*更新日期區的開始結束時間*/
                    return result;
                },
                click_one_time: function (index, work) {
                    if(!this.editable){ return; }

                    if (!hasMove) {
                        clearTimeout(timeOut); /*清除計時器，停止其他單擊的執行*/
                        timeOut = setTimeout(() => {
                            /*延後執行，以便確認是單擊還是雙擊*/
                            // this.chage_work_state(index, work); /*更新事件狀態*/
                            this.open_change_panel(index, work);/*開啟控制編輯面板*/
                        }, 300); // 大概時間300ms
                    } else {
                        hasMove = false; /*設定為位移動*/
                    }
                },
                chage_work_state: function (index, work) {
                    if (work["state"] == "hurry") {
                        new_state = "";
                        Vue.toasted.show("修改成一般工作", { duration: 1500, className: ["toasted-primary", "bg-success"] });
                    } else {
                        new_state = "hurry";
                        Vue.toasted.show("修改成緊急工作", { duration: 1500, className: ["toasted-primary", "bg-success"] });
                    }
                    this.works[index]["state"] = new_state;
                },
                open_change_panel: function(index, work){ 
                    if(!this.editable){ return; }

                    $('#edit_panel_btn').click();
                    this.edit_panel_index = index;
                    this.edit_panel = Object.assign({}, work);
                },
                do_edit_panel: function(){
                    if(!this.editable){ return; }

                    if(this.edit_panel_index !== ""){
                        edit_panel = $('#edit_panel');
                        s_panel = edit_panel.find('.start_time');
                        sdate = s_panel.find("input[name='date']").val();
                        shour = s_panel.find("select[name='hour']").val();
                        sminute = s_panel.find("select[name='minute']").val();
                        new_sdate = sdate + " " + shour + ":" + sminute;

                        e_panel = edit_panel.find('.end_time');
                        edate = e_panel.find("input[name='date']").val();
                        ehour = e_panel.find("select[name='hour']").val();
                        eminute = e_panel.find("select[name='minute']").val();
                        new_edate = edate + " " + ehour + ":" + eminute;

                        if(new_sdate > new_edate){
                            Vue.toasted.show("結束時間不可小於開始時間", { duration: 1500, className: ["toasted-primary", "bg-success"] });
                            return;
                        }else{
                            this.works[this.edit_panel_index].sdate = new_sdate;
                            this.works[this.edit_panel_index].edate = new_edate;
                            this.edit_panel_index = "";
                            // this.save_date();
                        }
                    }else{
                        Vue.toasted.show("未選擇編輯對象", { duration: 1500, className: ["toasted-primary", "bg-success"] });
                    }
                    this.get_area_s_e_date(); /*更新日期區的開始結束時間*/
                    $('#edit_panel').modal('hide');
                },
                set_work_notime: function (index) {
                    if(!this.editable){ return; }

                    clearTimeout(timeOut); /*清除計時器，停止單擊的執行*/
                    if (confirm("確定取消排程？")) {
                        this.works[index]["sdate"] = "";
                        this.works[index]["edate"] = "";
                        Vue.toasted.show("取消排程成功", { duration: 1500, className: ["toasted-primary", "bg-success"] });
                    }
                },
                get_area_s_e_date: function () {
                    temp_s = "9999/12/31 23:59";
                    temp_e = "0000/00/00 00:00";
                    for (var i = 0; i < this.works.length; i++) {
                        /*檢查開始時間*/
                        temp_t = this.works[i]["sdate"];
                        if (temp_s > temp_t && temp_t != "") temp_s = temp_t; /*紀錄較小的開始時間*/

                        /*檢查結束時間*/
                        temp_t = this.works[i]["edate"];
                        if (temp_e < temp_t && temp_t != "") temp_e = temp_t; /*紀錄較大的結束時間*/
                    }

                    if (this.calendar.sdate > temp_s || this.calendar.edate < temp_e) {
                        /*當日歷開始結束有大小改變時才處理更新*/
                        ori_edate = this.calendar.edate;

                        var sdateObj = new Date(temp_s);
                        sdateObj.setDate(sdateObj.getDate() - 1); /*設定日歷比最早工作小一天*/
                        sdateObj.setHours(0);
                        sdateObj.setMinutes(0);
                        this.calendar.sdate = this.date_obj_to_format_time(sdateObj); /*更新日歷開始日*/

                        var edateObj = new Date(temp_e);
                        edateObj.setDate(edateObj.getDate() + 1); /*設定日歷比最晚工作大一天*/
                        edateObj.setHours(0);
                        edateObj.setMinutes(0);
                        this.calendar.edate = this.date_obj_to_format_time(edateObj); /*更新日歷結束日*/

                        this.get_calendar((scroll_to_end = ori_edate < temp_e)); /*更新日歷*/
                    }
                },
                renew_work_sort: function () {
                    var new_works = [];
                    if (this.works) {
                        new_works.push(this.works[0]);
                    }

                    switch (this.work_sort) {
                        case "create_asc" /*依建立順序，由舊至新*/:
                            for (var i = 1; i < this.works.length; i++) {
                                check_work = this.works[i];
                                for (var l = 0; l < new_works.length; l++) {
                                    work = new_works[l];
                                    if (check_work.eve_id < work.eve_id) {
                                        /*要插入的物件eve_id比較小*/
                                        new_works.splice(l, 0, check_work); /*插入當前index*/
                                        break;
                                    } else if (check_work.eve_id == work.eve_id) {
                                        /*要插入的物件eve_id一樣大*/
                                        if (check_work.step_order < work.step_order) {
                                            /*要插入的物件step_order比較小*/
                                            new_works.splice(l, 0, check_work); /*插入當前index*/
                                            break;
                                        } else {
                                            /*要插入的物件step_order比較大*/
                                            if (l + 1 >= new_works.length) {
                                                /*沒下一個了*/
                                                new_works.push(check_work); /*接在最後面*/
                                                break;
                                            }
                                        }
                                    } else {
                                        /*要插入的物件eve_id比較大*/
                                        if (l + 1 >= new_works.length) {
                                            /*沒下一個了*/
                                            new_works.push(check_work); /*接在最後面*/
                                            break;
                                        }
                                    }
                                }
                            }
                            break;

                        case "create_desc" /*依建立順序，由新至舊*/:
                            for (var i = 1; i < this.works.length; i++) {
                                check_work = this.works[i];
                                for (var l = 0; l < new_works.length; l++) {
                                    work = new_works[l];
                                    if (check_work.eve_id > work.eve_id) {
                                        /*要插入的物件eve_id比較大*/
                                        new_works.splice(l, 0, check_work); /*插入當前index*/
                                        break;
                                    } else if (check_work.eve_id == work.eve_id) {
                                        /*要插入的物件eve_id一樣大*/
                                        if (check_work.step_order < work.step_order) {
                                            /*要插入的物件step_order比較小*/
                                            new_works.splice(l, 0, check_work); /*插入當前index*/
                                            break;
                                        } else {
                                            /*要插入的物件step_order比較大*/
                                            if (l + 1 >= new_works.length) {
                                                /*沒下一個了*/
                                                new_works.push(check_work); /*接在最後面*/
                                                break;
                                            }
                                        }
                                    } else {
                                        /*要插入的物件eve_id比較小*/
                                        if (l + 1 >= new_works.length) {
                                            /*沒下一個了*/
                                            new_works.push(check_work); /*接在最後面*/
                                            break;
                                        }
                                    }
                                }
                            }
                            break;

                        case "worktime_asc" /*依排程順序，由近至遠*/:
                            for (var i = 1; i < this.works.length; i++) {
                                check_work = this.works[i];
                                for (var l = 0; l < new_works.length; l++) {
                                    work = new_works[l];
                                    if (check_work.sdate == "") {
                                        /*要插入的物建無設定sdate*/
                                        new_works.push(check_work); /*接在最後面*/
                                        break;
                                    } else if (work.sdate == "") {
                                        /*比對的物建無設定sdate*/
                                        new_works.splice(l, 0, check_work); /*插入當前index*/
                                        break;
                                    } else if (check_work.sdate < work.sdate) {
                                        /*要插入的物件sdate比較小*/
                                        new_works.splice(l, 0, check_work); /*插入當前index*/
                                        break;
                                    } else if (check_work.sdate == work.sdate) {
                                        /*要插入的物件eve_id一樣大*/
                                        if (check_work.step_order < work.step_order) {
                                            /*要插入的物件step_order比較小*/
                                            new_works.splice(l, 0, check_work); /*插入當前index*/
                                            break;
                                        } else {
                                            /*要插入的物件step_order比較大*/
                                            if (l + 1 >= new_works.length) {
                                                /*沒下一個了*/
                                                new_works.push(check_work); /*接在最後面*/
                                                break;
                                            }
                                        }
                                    } else {
                                        /*要插入的物件eve_id比較大*/
                                        if (l + 1 >= new_works.length) {
                                            /*沒下一個了*/
                                            new_works.push(check_work); /*接在最後面*/
                                            break;
                                        }
                                    }
                                }
                            }
                            break;

                        default:
                            Vue.toasted.show("無此排序方式", { duration: 1500, className: ["toasted-primary", "bg-danger"] });
                    }
                    this.works = new_works;
                },
                save_date: function () {
                    $.ajax({
                        url: "/index.php/Fig/update_working_steps",
                        type: "POST",
                        datatype: "json",
                        data: { steps: workFlowVM.works },
                        success: function (response) {
                            bg_class = response.status == 1 ? "bg-success" : "bg-danger";
                            Vue.toasted.show(response.info, { duration: 1500, className: ["toasted-primary", bg_class] });
                        },
                    });
                },
                get_work_data: function(to_current_day=false){
                    $.ajax({
                        url: "/index.php/Fig/aj_get_working_steps",
                        type: "GET",
                        datatype: "json",
                        data: this.search,
                        success: function (res) {
                            console.log(res);
                            workFlowVM.calendar.sdate = res.sdate;
                            workFlowVM.calendar.edate = res.edate;
                            workFlowVM.works = res.steps_data;

                            workFlowVM.get_calendar(scroll_to_end=false, to_current_day);
                        },
                    });
                }
            },
        });
        // workFlowVM.get_work_data(to_current_day=true); /*取得工作排程*/
        workFlowVM.get_calendar(scroll_to_end=false, to_current_day=true); /*初始化日歷*/

        return workFlowVM;
    }
}
