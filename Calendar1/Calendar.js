import { getDayIndex, addDays } from "./helper.js";

export class Calendar {

    constructor() {
        this.weekStart = null;
        this.weekEnd = null;
        this.weekOffset=0;
    }
    // Cài đặt ban đầu
    setup() {
        this.setupTimes();
        this.setupDays();
        this.calculateCurrentWeek();
        this.showWeek();
        this.setControls();
    }
    // Thiết lập các khoảng thời gian trên giao diện
    setupTimes() {
        const header = $("<div></div>").addClass("columnHeader");
        const slots = $("<div></div>").addClass("slots");
        for (let hour = 0; hour < 24; hour++) {
            $("<div></div>").attr("data-hour", hour)
                .addClass("time")
                .text(`${hour}:00 - ${hour + 1}:00`)
                .appendTo(slots);
        }
        $(".dayTime").append(header).append(slots);
    }
    // Thiết lập các các ô thời gian ứng với mỗi một ngày
    setupDays() {
        const cal = this;
        $(".day").each(function () {
            const dayIndex = parseInt($(this).attr("data-dayIndex"));
            const name = $(this).attr("data-name");
            const header = $("<div></div>").addClass("columnHeader").text(name);
            $("<div></div>").addClass("dayDisplay").appendTo(header);
            const slots = $("<div></div>").addClass("slots");
            for (let hour = 0; hour < 24; hour++) {
                $("<div></div>").attr("data-hour", hour)
                    .addClass("slot")
                    .appendTo(slots).click(() => cal.clickSlot(hour, dayIndex))
                    .hover(
                        () => cal.hoverOver(hour),
                        () => cal.hoverOut()
                    );
            }
            $(this).append(header).append(slots);
        });
    }
    // Khi click vào một ô cell
    clickSlot(hour, dayIndex) {
        console.log("Click!");
    }
    hoverOver(hour) {
       $(`.time[data-hour=${hour}]`).addClass("currentTime");

    }
    hoverOut() {
        $(`.time`).removeClass("currentTime");
    }
    // Tính toán thời gian tuần hiện tại
    calculateCurrentWeek() {
        const now = new Date();
        this.weekStart = addDays(now, -getDayIndex(now));
        this.weekEnd = addDays(this.weekStart, 6);
    }
    // Thiết lập ngày tháng của tuần hiện tại và hiện lên trên bảng
    showWeek() {
        const options={
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        }
        $("#weekStartDisplay").text(
            this.weekStart.toLocaleDateString(undefined, options)
        );
        $("#weekEndDisplay").text(this.weekEnd.toLocaleDateString(undefined, options));
        for(let dayIndex =0 ; dayIndex <7; dayIndex ++){
            const date = addDays(this.weekStart, dayIndex);
            const display= date.toLocaleDateString(undefined,{
                month: "2-digit",
                day: "2-digit",
            });
            $(`.day[data-dayIndex=${dayIndex}] .dayDisplay`).text(display);
            if (this.weekOffset==0){
                this.showCurrentDay();
            }else{
                this.hideCurrentDay();
            }
        }
    }
    // Thiết lập khi nhấn nút tuần tiếp hay tuần trước
    setControls(){
        $("#nextWeekBtn").click(()=> this.changeWeek(1));
        $("#prevWeekBtn").click(()=> this.changeWeek(-1));
    }
    changeWeek(number){
        this.weekOffset +=number;
        this.weekStart = addDays(this.weekStart, 7*number);
        this.weekEnd = addDays(this.weekEnd, 7*number);
        this.showWeek();
    }
    showCurrentDay(){
        const now = new Date();
        const dayIndex= getDayIndex(now);
        $(`.day[data-dayIndex=${dayIndex}]`).addClass("currentDay");
    }
    hideCurrentDay(){
        $(".day").removeClass("currentDay");
    }

}