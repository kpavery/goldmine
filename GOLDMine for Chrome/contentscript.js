var content = document.getElementById("content");

var meeting_times = new Array();

var classes = document.getElementsByClassName("clcellprimaryalt");

var class_names = new Array();
var count = 0;

for (var i = 0; i < classes.length; i++) {
	if (classes[i].tagName.toLowerCase() == "div") {
		var meeting_time = document.getElementById("ctl00_pageContent_CourseList_ctl0" + (count + 1) + "_MeetingTimesList");
		meeting_times[count] = meeting_time;
		class_names[count++] = classes[i].textContent;
	}
}

//var str = "";

var class_times = new Array();

for (var i=0; i < meeting_times.length; i++) {
	var cells = meeting_times[i].getElementsByClassName("clcellprimary");
	if (cells.length == 0){
		cells = meeting_times[i].getElementsByClassName("clcellprimaryalt");
	}
	class_times[i] = new Array();
	for (var j=0; j < cells.length; j++) {
		if (cells[j].getElementsByTagName("A").length != 0) {
			//alert(cells[j].getElementsByTagName("A")[0].textContent);
			class_times[i][j] = cells[j].getElementsByTagName("A")[0].textContent;
			//str += "Class: " + i + ", cell: " + j + ", cont: " + cells[j].getElementsByTagName("A")[0].textContent + "\n";
		} else {
			class_times[i][j] = cells[j].textContent;
			//str += "Class: " + i + ", cell: " + j + ", cont: " + cells[j].textContent + "\n";
		}
	}
}

//alert(str);

//alert(class_times);

var pass_data = new Array();
count = 0;

for (var i = 0; i < class_names.length; i++) {
	var split = class_names[i].split("  ");
	var split2 = split[1].split("-");
	var final_split = new Array(split[0],split2[0],split2[1],class_times[i]);
	pass_data[count++] = final_split;
}

if (pass_data.length > 0) {
	//safari.self.tab.dispatchMessage("classData",pass_data);
	chrome.extension.sendRequest(pass_data);
}
