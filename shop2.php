<!DOCTYPE html>
<!-- shopping.php

NEW UPDATE FIX POP-UP 05/19/2017
~~updated to fix bugs for ordering04/12/17 X

-->
<html>
<head><title>Order Process</title>
<!-- -->
<style>
body {
  background-image: url("theme2.jpg")
}
/* My CSS stuff from previous index*/
h1{
  color: #000;
  font-style: bold;
}
p{
  color: #000;
  background-color: #ffe0cc;
}
.content.ui{

color: black;
display: block;


}
table{
  font-family: arial, sans-serif;
    border-collapse: collapse;
    width: 50%;
    background-color:  #e6e6e6;


}
tr:nth-child(even) {
    background-color: #ffe0cc;
}
td{
    border: 1px solid #dddddd;

    text-align: left;
    padding: 8px;
}

td:hover{
  background-color:#ff6600;
}
th:hover{
  background-color:#ff6600;
}
th {
    background-color:#ff6600;
    color: white;
}
body{
  background-repeat /*no-repeat;  */
}
ul{
  color: black;
   display: block;
    list-style-type: disc;
    margin-top: 1em;
    margin-bottom: 1 em;
    margin-left: 0;
    margin-right: 0;
    padding-left: 40px;
}
hr{
  width: 60%;
}

/*
*
*
*

*/

/* Rest of the CSS stuff*/

ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: #ff6600;
}

li {
    float: left;
}

li a, .dropbtn {
    display: inline-block;
    color: white;
    text-align: center;
    padding: 14px 16px;
    text-decoration: none;
}

li a:hover, .dropdown:hover .dropbtn {
    background-color: #ffe0cc;
}

li.dropdown {
    display: inline-block;
}

.dropdown-content {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
}

.dropdown-content a {
    color: #ff6600;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
    text-align: left;
}

.dropdown-content a:hover {background-color: #f1f1f1}

.dropdown:hover .dropdown-content {
    display: block;
}
</style>
</head>
<body>

<ul>
  <li><a class="active" href="dropdown.html">Home</a></li>
  <li><a href="shop2.php">Shop</a></li>
  <li style="float:right"><a href="signin.html">SignIn</a></li>
  <li style="float:right"><a href="about.html">About</a></li>  <li class="dropdown">
    <a href="#" class="dropbtn">Products</a>
    <div class="dropdown-content">
      <a href="dropdown1.html">Viron Smartphone</a>
      <a href="dropdown2.html">VironTab</a>
      <a href="dropdown3.html">VironBook</a>
    </div>
  </li>
</ul>

<!--- --> <!--

<body bgcolor ="orange"> -->
<?php
	$q1 = $_POST["quan1"];
	$q2 = $_POST["quan2"];
	$dvd1 = "Viron";
	$dvd2 = "VironXL";

	$q3 = $_POST["quan3"];
	$q4 = $_POST["quan4"];
	$dvd3 = "VironTab";
	$dvd4 = "VironBook";

	$file =fopen("inv.txt", "r");
	//if file does not open
	if($file == false){
		echo "Error opening inventory file!";
		exit();
	}

	$i= 0;
	$total = 0.00;


	/*create an array to hold the contents read off the file;
			 therefore we can manupulate them for processing.

			 So we keep reading the file as long as it is not the end,
			 which fgetscsv will know when there are no elements left*/
					$data = array();
					$i = 0;
					while( feof($file) == false){

					$data[$i] = fgetcsv($file);
					$i = $i + 1;
			}



			 /* Now we must close the file after we have obtained all the information
			 and then use such information and display it for the user in a table format
			 Also let the user know that you must reload the page by entering the
			 address again to show the updated stocks */
				fclose($file);
				echo '<br>';
				echo '<h1>Current Inventory</h1>';
				echo '<br>';
				echo '<h3>Reload the page or enter the webaddress to see the stock update!</h3>';
        echo "<h2>Tax is at 13%</h2>";
				echo '<table>';
								echo '<tr><th>Item Number</th>
								<th>Item Name</th>
								<th>Price</th>
								<th>Stock</th></tr>';

								$k = 1;

								foreach($data as $side) {

										  		echo('<tr>');

										  		echo("<td>$k</td>");

										  		echo('<td>');

										  		echo(implode('</td><td>', $side));

										  		echo('</td>');

										  		echo('</tr>');
										  		$k = $k + 1;
							  	}

			  	echo '</table>';

  	/* showing the values and taking out the "$" sign that was in the
  	txt file.
  	Then bulid a form for the user to enter in the values they want for
  	each item

  	at this juncture we build 3 arrays for  each aspect of an item*/
					  	$costsofitem = array();

					  	$stockofitem = array();

					  	$nameofitem = array();

					  	$k = 0;


					  	foreach ($data as $values){
		  				$nameofitem[$k] = $values[0];
				  		$costsofitem[$k] = str_replace("$", "", $values[1]);

				  		$stockofitem[$k] = $values[2];



				  		$k = $k + 1;
				  	}
 /* Submit table */
  	echo '<h3>Enter the amount you would like for each item</h3>';

  	echo '<form method=post>';
					  		for ($k=0; $k < count($data)-1; $k++) {

					  		echo "Item# ".($k+1).":  <input type=\"text\" name=\"input[$k]\">" . '<br>';
					  	}
  	echo '<input type="submit">';
  	echo '</form><br>';


/* Reciept and reply if ordering fails */
			  	if($_SERVER['REQUEST_METHOD']=='POST'){
			  		$k = 0;
			  		$quantity = $_POST["input"];
			  		$finalcost = array();

			  		/* as the user goes thorugh their desired amount of prodcut
			  		we msut also check if the amount they have entered is suffiecent
			  		for ordering!
			  		if It is not then we must check and let them know they have entered
			  		the wrong amount.*/
			  		foreach ($quantity as $amount){
						  			if($amount > $stockofitem[$k]){
						  				/* we check and let the user know they have enetered an insufficent amount of product and they must try again! */

						  				echo "Sorry for the inconveince, but your order cannot be filled!, We only have:".$stockofitem[$k]."<br>
						  				".$nameofitem[$k]." in stock"."<br>";

						  				echo "The amount you ordered was: ".$amount." out of ".$nameofitem[$k];
						  				exit();

						  			} else if (ctype_digit($amount) == false && $amount != null) {

						  				echo "ERROR!!!! Invalid order was placed!";
						  				exit();

						  			} else {

						  				$finalcost[$k] = $amount * $costsofitem[$k];
						  				$data[$k][2] -= $amount;
                      //alert("{$finalcost[$k]}");
                      /*echo "<script type='text/javascript'>alert('Total for $$finalcost[$k]');</script>";
                      */
						  			}

			  			$k = $k + 1;

			  		}


  		/*using  the arrays $quantity, $finalcost, $nameofitem, $costsofitem,
  		values to to build the table  	*/
  		echo '<h3>Reciept</h3>';

  		echo '<table>';

  		echo '<tr><th>Item:</th>
  		<th>Price:</th>
  		<th>Quantity</th>
  		<th>Amount</th></tr>';

  							//as you go thorugh print each's name, price, quantity and the total
					  		for ($k=0; $k < count($quantity); $k++) {

					  			echo '<tr>';

					  			echo '<td>'.$nameofitem[$k].'</td>';

					  			echo '<td>$'.$costsofitem[$k].'</td>';

					  			echo '<td>'.$quantity[$k].'</td>';

					  			echo '<td>$'.$finalcost[$k].'</td>';

					  			echo '</tr>';

					  		}
                //printing variable for the popup
                  $x_2nd = array_sum($finalcost);
                  //update with tax
                  $x_2nd *= 1.13;

						  		echo '<tr><td></td><td>Sub-Total</td>';
						  		echo '<td>'.array_sum($quantity).'</td>';
						  		echo '<td>$'.array_sum($finalcost).'</td>';
                  echo '</tr>';
                  echo '<tr><td></td><td>Tax</td>';
                  echo '<td></td><td>13%</td>';
                  echo '<tr><td></td><td>Total (with Tax)</td>';
                  echo '<td></td><td>$'.$x_2nd.'</td>';
                  //pop-up alret the user
                  echo "<script type='text/javascript'>alert('Your Order Total is: $$x_2nd. Reciept will be shown below!');
                  </script>";

						  		/*add it up and show the costs of the items
						  		 and then update the file with the new stocks
						  		 that will be taken out
  								*/
                  //alert('array_sum($finalcost)');



						  		$name_file = "inv.txt";
								$file = fopen($name_file, "w");


								for ($h=0; $h <count($data) ; $h++) {

									$str = trim($nameofitem[$h]).", ".'$'.trim($costsofitem[$h]).", ".trim($data[$h][2]);
									fwrite($file, $str);

													if ($h != count($data)-1 ){
														fwrite($file, "\n");
													}

								}
								fclose($file);
								//close the file after it is update
						  	}


/* ALRET
  -this will popup and tell the user the total

alert = $finalcost;

function alert($msg) {
    echo "<script type='text/javascript'>alert('Total $:$msg');</script>";

*/
?>
</body></html>
