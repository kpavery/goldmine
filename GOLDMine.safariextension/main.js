// Initialization.

// class_names is the unparsed text pulled in from GOLD about each class (including its dept., num., and name).
var class_names = [];
// meeting_times is the unparsed text about all meeting times.
var meeting_times = [];
// class_times is the parsed values for the meeting times of the all the classes. It is an array of arrays, with a top-level element for each class.
var class_times = [];
// instructors is an array for the professors of each class.
var instructors = [];
// finals is an array for the final exam times of each class.
var finals = [];
// Counter.
var count = 0;

// Get all the tags of class "clcellprimaryalt". Class names seem to always be of this class.
var classes = document.getElementsByClassName("clcellprimaryalt");

// Loop through all those tags.
for (var i = 0; i < classes.length; i++) {
	// We only want divs, those are the class name tags. Ignore everything else.
	if (classes[i].tagName.toLowerCase() === "div") {
		// Get the meeting times for each class. They seem to be in an element with id "pageContent_CourseList_MeetingTimesList_X"
		//	where X is the index of the course in GOLD table, indexed from 0 (i.e. 0, 1, 2, 3, 4, etc).
		var meeting_time = document.getElementById("pageContent_CourseList_MeetingTimesList_" + count);

		// Add that to the meeting_times array, and add the class name to the class_names array.
		meeting_times[count] = meeting_time;
		
		// Get the instructor from the page.
		var instructor = document.getElementById("pageContent_CourseList_InstructorList_" + count);
		
		// Check f we found instructors.		
		if (instructor) {
			// If we did, get all the instructors from the table. The elements they're in may be clcellprimary or clcellprimaryalt, so handle both.
			var currentinstructors = instructor.getElementsByClassName("clcellprimary");
			var currentinstructorsstr = [];
			if (currentinstructors.length < 1){
				currentinstructors = instructor.getElementsByClassName("clcellprimaryalt");
			}
			
			// Go through all the instructors, and get their string representation, trimmed.
			for (var j = 0; j < currentinstructors.length; j++) {
						currentinstructorsstr[j] = currentinstructors[j].textContent.trim();
			}
			
			// Add the instructor array for this course, trimmed, to the main instructors array.
			instructors[count] = currentinstructorsstr;
		}
				
		class_names[count++] = classes[i].textContent;
	}
}

var finalTable = document.getElementById("pageContent_FinalsGrid");
if (finalTable) {
	var numFinals = 0;
	var rows = finalTable.getElementsByTagName("table");
	for (var i=0; i < rows.length; i++) {
		var cells = rows[i].getElementsByClassName("clcellprimary");
		if (cells.length > 1) {
			finals[numFinals++] = cells[1].textContent;
		}
	}
}

// We're only interested in continuing if we found classes in the page. Otherwise don't waste the browser's time.
if (class_names.length > 0) {
	
	// Loop through the array of meeting times. Each element of it is a tag that contains all the meeting times for a class
	//	somewhere in it's child tree. This can be thought of as looping through the classes.
	for (var i=0; i < meeting_times.length; i++) {
		// The times are either of class "clcellprimary" or "clcellprimaryalt", depending on which row in the table the course is. GOLD
		//	alternates colours for the table rows, and that's why it could be either. First check if it's primary, and if not, then get
		//	primaryalt.
		var cells = meeting_times[i].getElementsByClassName("clcellprimary");
		if (cells.length < 1){
			cells = meeting_times[i].getElementsByClassName("clcellprimaryalt");
		}
		
		// Make a new array element in class_times. This array contains all the meeting times for one class.
		class_times[i] = [];
		
		// Loop through all the cells that were found in the current meeting_times tag hierarchy, divided by three (since there are three elements for each time). 
		for (var j=0; j < cells.length / 3; j++) {
			// Create object with day, time, and room information for the meeting time, and set it in the meeting times list.
			class_times[i][j] = {'day': cells[j*3].textContent.trim(), 'meetingTime': cells[j*3+1].textContent.trim(), 'room': cells[j*3+2].getElementsByTagName("A")[0].textContent.trim()};
		}
	}
	
	// Initialize the message data, that will be passed to the popover.
	var pass_data = [];
	
	// Set the first element of the pass data to the name of the quarter we're analyzing. It's the text of the selected option of the page's select tag.
	pass_data[0] = document.getElementsByTagName("SELECT")[0].options[document.getElementsByTagName("SELECT")[0].selectedIndex].textContent.trimLeft().trimRight();
	
	// Loop through all the classes.
	for (var i = 0; i < class_names.length; i++) {
		// Split based on the first number, which is part of the course number.
		var num = /\d/;
		var firstNum = class_names[i].search(num);
		var department = class_names[i].substr(0,firstNum);
		var split1 = class_names[i].substr(firstNum);
		// Split the second part by hyphen surrounded by spaces, which should give the number and name separately.
		var split2 = split1.split(" - ");
		var number = split2[0];

		// Get the class name.
		var className = split2[1];
		// Another hyphen with spaces was in the title so extra splitting occurred
		if (split2.length > 2) {
			for(var j = 2; j < split2.length; j++) {
				// Append the parts that shouldn't have been split off
				className += " - "+split2[j];
			}
		}
		
		// Get final for this class, and if there is one, trim it.
		var finalT = finals[i];
		if (finalT) {
			finalT = finalT.trim();
		}
		
		// Create a new array with the department, number, name, an array of meeting times, and the instructors. Add that as a new element of the passed data.
		var final_split = {'department': department.trim(),'number': number.trim(),'courseName': className.trim(),'meetingTimes': class_times[i],'instructor': instructors[i],'finalT': finalT};
		// Offset the index at one, because the first element is the quarter.
		pass_data[i+1] = final_split;
	}
	
	// If classes were found, then pass them to the popover as a message with name "classData".
	if (pass_data.length > 0) {
		safari.self.tab.dispatchMessage("classData",pass_data);
	}
}

