<?php
class ReportModule {
	private $_conf;
	private $_input;

	public function __construct($input, $conf) {
		$this->_conf = $conf;
		$this->_input = $input;
	}

	public function getConn() {
		$conn = mysql_connect($this->_conf['host'], $this->_conf['user'], $this->_conf['pass']);
		if (false === $conn)
			return false;
		if (false === mysql_select_db($this->_conf['db'], $conn))
			return false;
		mysql_query("set names 'GBK'", $conn);
		return $conn;
	}

	public function getData($conn) {
		$date = $this->checkFilter($this->_input, 'date', ' and `date` = ');
		$query = $this->checkFilter($this->_input, 'query', ' and `interest_name` = ');
		$page = empty($this->_input['page']) ? 1 : mysql_real_escape_string($this->_input['page']);
		$page_size = empty($this->_input['page_size']) ? 20 : mysql_real_escape_string($this->_input['page_size']);

		$item_from = ($page - 1) * $page_size;

		$sql = <<<SQL
select date, interest_id, interest_name, user_count
from user_interest_stat
where 1 {$date} {$query}
order by user_count desc
limit {$item_from}, {$page_size}
SQL;
        //file_put_contents("/data/wwwroot/htdocs/user_interest_stat/test.log",$sql);
		$data = $this->executeSql($conn, $sql);

		foreach ($data as &$row) {
			$row['interest_name'] = htmlspecialchars($row['interest_name']);
		}

		return $data;
	}

	protected function checkFilter($arr, $key, $preceding) {
		return (isset($arr[$key]) && !empty($arr[$key])) ? $preceding." '".mysql_real_escape_string(iconv('utf-8', 'gbk//translit', $arr[$key]))."'" : '';
	}

	public function executeSql($conn, $sql) {
		//return $sql;
		$res = mysql_query($sql, $conn);
		$arr = array();
		while ($res != false && ($row = mysql_fetch_array($res, MYSQL_ASSOC))) {
			$new_row = array();
			foreach ($row as $key => $val) {
				if (is_numeric($val))
					$new_row[$key] = floatval($val);
				else
					$new_row[$key] = iconv('gbk', 'utf-8//translit', $val);
			}
			$arr[] = $new_row;
		}
		return $arr;
	}
};

