<?php
class dt
{		
    function db($query,$servername = "localhost",$username = "root",$password = "",$dbname = "world")
	{	
		// Bağlantı yapılsın.
		$mysqli = new mysqli($servername, $username, $password,$dbname);

		// Bağlatı kontrolü
		if ($mysqli->connect_error) {
		    echo "Bağlantı hatası: " . $mysqli->connect_error;
		}
		else{
			
			$mysqli->query("SET NAMES 'utf8'");

			// Veri dizisi. İki boyutlu bir dizidir.((1,a),(2,b))
			$dataArray=array();

		    // Veritabanı sorgusu
		  	if ($result = $mysqli->query($query)) {
			    // Veri Dizisi oluştur
			    while ($row = $result->fetch_row()) {
			       array_push($dataArray, $row);
			    }

			    $result->close();
			    // Ajax tarafından çağrılacak veri basılmaktadır.
				echo json_encode($dataArray);
			}

			$mysqli->close();
		}
	}
}
?>