<?php
if ($_GET['data']) {
	header('Content-Type: application/octet-stream');
	header('Content-Disposition: attachment; filename="goldmine-courses.ics"');
	$data = $_GET['data'];
	print urldecode($data);
}
?>