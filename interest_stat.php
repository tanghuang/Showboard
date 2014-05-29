<?php

error_reporting(0);

require_once('config.php');
require_once('interest_stat_module.php');

if (isset($_GET['download'])) {
	$module = new ReportModule($_GET, $conf);
	$conn = $module->getConn();
	$data = array();
	$data = $module->getData($conn);
	date_default_timezone_set('Asia/Shanghai');
	header('Content-type: text/csv');
	header('Content-Disposition: attachment; filename=download-'.date('Ymd').'.csv');
	$header_written = false;
	foreach($data as $row) {
		if (!$header_written) {
			$head = array();
			foreach ($row as $k => $v)
				$head[] = $k;
			echo(implode(',', $head)."\r\n");
			$header_written = true;
		}
		echo(implode(',', $row)."\r\n");
	}
} else {
	$module = new ReportModule($_POST, $conf);
	$conn = $module->getConn();
	$data = array();
	$data = $module->getData($conn);
	mysql_close($conn);
	echo json_encode($data);
}

