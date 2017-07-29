<!-- pj92singh
-php code to allow Admin to login
-by reading password.txt file and
aquiring the username and password
by using the php chop and explode
functions.

-chop is used to break the password.txt
file by line.
-then each line is "exploded" using the
explode function with the paramter of ","
a comma to distinguish between the first
and second words (username , password)
-->
<!DOCTYPE html>

<head><title>PHP example</title></head>
<body>
<?php

	$USERNAME = $_POST["USERNAME"];
	$PASSWORD = $_POST["PASSWORD"];

	if(!$USERNAME || !$PASSWORD){
		fieldsBlank();
		die();
	}

	if(!($file=fopen("password.txt","r"))){
		printf("<head><title>Error</title></head><strong>Cannot open password file"+ "</strong>");
		die();
	}

			$userVerified = 0;
			while (!feof($file) && !$userVerified){

					$line = fgets($file,255);
					$line = chop($line);
					$field = explode(",", $line);
					//$field = fgetcsv($file);
					if($USERNAME == $field[0]){
						$userVerified = 1;
						if(checkPassword($PASSWORD, $field) == true){
							accessGranted($USERNAME);
						}
						else{
							wrongPassword();
						}
					}
			}
//close the file after finding out login info
	fclose($file);
		 if(!$userVerified){
			accessDenied();
		}

//------------------------
//------------------------
// functions
//checking passwords
	function checkPassword($pwd, $filedata){
		if($pwd == $filedata[1]){
			return true;
		}
		else{
			return false;
		}
	}
//accesss granted function
	function accessGranted($name){
		print("Premission granted to user: $name <br> />");
		print("<a href=\"maintain_inv.html\">Update Inventory</a><br><br><br>");
		print("OR you can,<a href=\"signin.html\">SignOut!</a>\n");
		//header('Location: ./maintain_inv.html');
	}
//wrong password func
	function wrongPassword(){
		print("<strong>Password is wrong!<br> /></strong>");
	}
//access denied
	function accessDenied(){
		print("<head><title>Access Denied</title></head>"+
		"<strong>You are not authorized to update inventory<br /></strong>");
		print("<a href=\"signin.html\">Retry!</a>");
	}
//if no input is given
	function fieldsBlank() {
	print("<title>Blank Fields</title></head><strong>Access denined!</strong>");
	}
?>

</body></html>
