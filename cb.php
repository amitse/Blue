<!DOCTYPE html>

<html>
  <head>
    <title>Blue</title>
		<link href="style.css" rel="stylesheet" type="text/css" />
		<script type="application/dart" src="cb.dart"></script>
		<script src="cb.dart.js"></script>  
		
		<script type="text/javascript">
			function fun()
			{
			     document.getElementById("ta").scrollTop =    document.getElementById("ta").scrollHeight;
			}
		</script>
  </head>
 
  
  <body>
   <div id="maincontent">
	   <div id="header"></div>
		<div class="name">
			<input type="text" placeholder="Enter your name here(optional)"id="na">
		</div>
		
		  <textarea  id="ta" disabled></textarea>	      
    <input type="text" id="inp" placeholder="Type here" onkeypress="fun()" onkeyup="fun()">
	</div>   
  </body>
</html>
