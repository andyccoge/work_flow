<?php
	function get_send_request($request_url){
		$curl = curl_init();  
		curl_setopt($curl, CURLOPT_URL, $request_url);  
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
		if (! empty($data)) {  
		    curl_setopt($curl, CURLOPT_POST, 1);  
		    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);  
		}  
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);  
		$output = curl_exec($curl);  
		curl_close($curl);
		return $output;
	}

	$holiday_data = [];
	$page = 1;
	$loop = true;
	while($loop){
		$request_url = "https://data.ntpc.gov.tw/api/datasets/308DCD75-6434-45BC-A95F-584DA4FED251/json?page=".$page."&size=500";
		$data = get_send_request($request_url);
		// echo $data;
		if($data!="[]" && $data!=""){
			/*處理資料*/
			$data = str_replace("/", "-", $data);  		// 修改年月日間隔符號
			$data = str_replace("-1-", "-01-", $data);  // 修改月，填滿兩碼
			$data = str_replace("-2-", "-02-", $data);
			$data = str_replace("-3-", "-03-", $data);
			$data = str_replace("-4-", "-04-", $data);
			$data = str_replace("-5-", "-05-", $data);
			$data = str_replace("-6-", "-06-", $data);
			$data = str_replace("-7-", "-07-", $data);
			$data = str_replace("-8-", "-08-", $data);
			$data = str_replace("-9-", "-09-", $data);
			$data = str_replace('-1"', '-01"', $data);  // 修改日，填滿兩碼
			$data = str_replace('-2"', '-02"', $data);
			$data = str_replace('-3"', '-03"', $data);
			$data = str_replace('-5"', '-05"', $data);
			$data = str_replace('-4"', '-04"', $data);
			$data = str_replace('-6"', '-06"', $data);
			$data = str_replace('-7"', '-07"', $data);
			$data = str_replace('-8"', '-08"', $data);
			$data = str_replace('-9"', '-09"', $data);

			$data = json_decode($data);
			$holiday_data = array_merge($holiday_data, $data);
			$page += 1;
		}else{
			$loop = false;
		}
	}
	
	echo json_encode($holiday_data, JSON_UNESCAPED_UNICODE);