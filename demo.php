<?php
	include 'dt.php';
	$dt=new dt;
	$dt->db("SELECT * FROM city WHERE ID<82");// Bir SQL sorgusu olmalıdır. İlk sütun priamery_key dir. Sütunların sıralanışı aynı zamanda index sırasıdır. 
?>