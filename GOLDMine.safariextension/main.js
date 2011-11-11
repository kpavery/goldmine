// Initialization.

// class_names is the unparsed text pulled in from GOLD about each class (including its dept., num., and name).
var class_names = new Array();
// meeting_times is the unparsed text about all meeting times.
var meeting_times = new Array();
// class_times is the parsed values for the meeting times of the all the classes. It is an array of arrays, with a top-level element for each class.
var class_times = new Array();
// instructors is an array for the professors of each class.
var instructors = new Array();
// Counter.
var count = 0;

// Get all the tags of class "clcellprimaryalt". Class names seem to always be of this class.
var classes = document.getElementsByClassName("clcellprimaryalt");

// Loop through all those tags.
for (var i = 0; i < classes.length; i++) {
	// We only want divs, those are the class name tags. Ignore everything else.
	if (classes[i].tagName.toLowerCase() == "div") {
		// Get the meeting times for each class. They seem to be in an element with id "ctl00_pageContent_CourseList_ctl0X_MeetingTimesList"
		//    where X is the index of the course in GOLD table, indexed from 1 (i.e. 1, 2, 3, 4, etc).
		var meeting_time = document.getElementById("ctl00_pageContent_CourseList_ctl0" + (count + 1) + "_MeetingTimesList");
		// Add that to the meeting_times array, and add the class name to the class_names array.
		meeting_times[count] = meeting_time;
		
		// Get the instructor from the page.
		var instructor = document.getElementById("ctl00_pageContent_CourseList_ctl0" + (count + 1) + "_InstructorList");
		
		// Check f we found instructors.		
		if (instructor) {
			// If we did, get all the instructors from the table. The elements they're in may be clcellprimary or clcellprimaryalt, so handle both.
			var currentinstructors = instructor.getElementsByClassName("clcellprimary");
			var currentinstructorsstr = new Array();
			if (currentinstructors.length == 0){
				currentinstructors = instructor.getElementsByClassName("clcellprimaryalt");
			}
			
			// Go through all the instructors, and get their string representation, trimmed.
			for (var j = 0; j < currentinstructors.length; j++) {
						currentinstructorsstr[j] = currentinstructors[j].textContent.trimLeft().trimRight();
			}
			
			// Add the instructor array for this course, trimmed, to the main instructors array.
			instructors[count] = currentinstructorsstr;
		}
				
		class_names[count++] = classes[i].textContent;
	}
}

// We're only interested in continuing if we found classes in the page. Otherwise don't waste the browser's time.
if (class_names.length > 0) {
	
	// Loop through the array of meeting times. Each element of it is a tag that contains all the meeting times for a class
	//    somewhere in it's child tree. This can be thought of as looping through the classes.
	for (var i=0; i < meeting_times.length; i++) {
		// The times are either of class "clcellprimary" or "clcellprimaryalt", depending on which row in the table the course is. GOLD
		//    alternates colours for the table rows, and that's why it could be either. First check if it's primary, and if not, then get
		//    primaryalt.
		var cells = meeting_times[i].getElementsByClassName("clcellprimary");
		if (cells.length == 0){
			cells = meeting_times[i].getElementsByClassName("clcellprimaryalt");
		}
		
		// Make a new array element in class_times. This array contains all the meeting times for one class.
		class_times[i] = new Array()
		
		// Loop through all the cells that were found in the current meeting_times tag hierarchy. 
		for (var j=0; j < cells.length; j++) {
			// Check for a link (<a> tag) in the cell. If there is one, just get the content of that link. This is for the meeting locations, which
			//    are linked to a popup. Otherwise just get the content of the tag (for everything but the meeting locations). Add them to the new
			//    element in class_times.
			if (cells[j].getElementsByTagName("A").length != 0) {
				class_times[i][j] = cells[j].getElementsByTagName("A")[0].textContent;
			} else {
				class_times[i][j] = cells[j].textContent;
			}
		}
	}
	
	// Initialize the message data, that will be passed to the popover.
	var pass_data = new Array();
	
	
	// Loop through all the classes.
	for (var i = 0; i < class_names.length; i++) {
		// Split on 3 spaces. This should split the the class name into two elements, department and number/name. The class name usually looks
		//    something like "CMPSCCS   1L - PROGRAMMING LAB".
		var split0 = class_names[i].substr(0,8);
		var split1 = class_names[i].substr(8);
		// Split the second part by hyphen, which should give the number and name separately.
		var split2 = split1.split("-");

		var split3 = split2[1];
		// Another hyphen was in the title so extra splitting occurred
		if (split2.length > 2) {
			for(var j = 2; j < split2.length; j++) {
				// Append the parts that shouldn't have been split off
				split3 += "-"+split2[j];
			}
		}
		
		// Create a new array with the department, number, name, an array of meeting times, and the instructors. Add that as a new element of the passed data.
		var final_split = new Array(split0,split2[0],split3,class_times[i],instructors[i]);
		pass_data[i] = final_split;
	}
	
	// If classes were found, then pass them to the popover as a message with name "classData".
	if (pass_data.length > 0) {
		safari.self.tab.dispatchMessage("classData",pass_data);
	}
}