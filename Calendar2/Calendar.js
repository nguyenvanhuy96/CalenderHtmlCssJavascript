import { getDayIndex, addDays, dateString } from "./helper.js";
import {Event} from "./Event.js";
const MODE = {
    VIEW: 1,
    UPDATE: 2,
    CREATE: 3
}
export class Calendar {


    constructor() {
        this.weekStart = null;
        this.weekEnd = null;
        this.weekOffset = 0;
        this.mode = MODE.VIEW;
        this.events={};
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
        if (this.mode != MODE.VIEW) {
            return;
        }
        this.mode = MODE.CREATE;
        const start = hour.toString().padStart(2, "0") + ":00";
        const end = hour < 23 ? (hour + 1).toString().padStart(2, "0") + ":00" : "23:59";
        const date = dateString(addDays(this.weekStart, dayIndex));
        const event = new Event({
            start, end, date, title: "", description: "",
            color: "red"
        });
        this.openModal(event);
    }
    openModal(event) {
        console.log("openModal",event );
        $("#modalTitle").text(
            this.mode == MODE.CREATE ? "Create a new event" : "Update your event"
        );
        $("#eventTitle").text(event.title);
        // $("#eventDate").text(event.date);
        // $("#eventStart").text(event.start);
        // $("#eventEnd").text(event.end);
        $("#eventDate").attr("value",event.date);
        $("#eventStart").attr("value",event.start);
        $("#eventEnd").attr("value",event.end);
        $("#eventDescription").text(event.description);
        $(".color").removeClass("active");
        $(`.color[data-color=${event.color}]`).addClass("active");
        if(this.mode== MODE.UPDATE){
            $("#submitButton").val("Update");
            $("#deleteButton").show().off("click").click(()=> {
                console.log("delete event", event);
            });
            $("#copyButton").show().off("click").click(()=> {
                console.log("copy event",event);
            });
        }else if(this.mode== MODE.CREATE){
            $("#submitButton").val("create");
            $("#deleteButton,#copyButton").hide();
        }
        $("#eventModal").fadeIn(200);
        $("#eventTitle").focus();
        $("#calendar").addClass("opaque");
        $("#eventModal").off("submit").submit((e)=>{
            e.preventDefault();
            // todo
            this.submitModal(event);
        });
    }
    submitModal(event){
        if(event.isValidIn(this)){
            event.updateIn(this);
            this.closeModal();
        }
    }
    closeModal(){
        $("#eventModal").fadeOut(200);
        $("#errors").text("");
        $("#calendar").removeClass("opaque");
        this.mode= MODE.VIEW;
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
        const options = {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        }
        $("#weekStartDisplay").text(
            this.weekStart.toLocaleDateString(undefined, options)
        );
        $("#weekEndDisplay").text(this.weekEnd.toLocaleDateString(undefined, options));
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const date = addDays(this.weekStart, dayIndex);
            const display = date.toLocaleDateString(undefined, {
                month: "2-digit",
                day: "2-digit",
            });
            $(`.day[data-dayIndex=${dayIndex}] .dayDisplay`).text(display);
            if (this.weekOffset == 0) {
                this.showCurrentDay();
            } else {
                this.hideCurrentDay();
            }
        }
    }
    // Thiết lập khi nhấn nút tuần tiếp hay tuần trước
    setControls() {
        $("#nextWeekBtn").click(() => this.changeWeek(1));
        $("#prevWeekBtn").click(() => this.changeWeek(-1));
        $("#cancelButton").click(() => this.closeModal());
        $(".color").click(this.changeColor);
    }
    changeColor(){
        $(".color").removeClass("active");
        $(this).addClass("active");
    }
    changeWeek(number) {
        this.weekOffset += number;
        this.weekStart = addDays(this.weekStart, 7 * number);
        this.weekEnd = addDays(this.weekEnd, 7 * number);
        this.showWeek();
    }
    showCurrentDay() {
        const now = new Date();
        const dayIndex = getDayIndex(now);
        $(`.day[data-dayIndex=${dayIndex}]`).addClass("currentDay");
    }
    hideCurrentDay() {
        $(".day").removeClass("currentDay");
    }

}