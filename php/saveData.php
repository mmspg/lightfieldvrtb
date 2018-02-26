<?php

if(!empty($_POST['filename'])){
   $file_name = $_POST['filename'];
   if(!empty($_POST['data'])){

     $data = $_POST['data'];
     $fname = $file_name; //generates random name

     $file = fopen("../sessions/".$fname, 'w'); //creates new file
     fwrite($file, $data);
     fclose($file);
   }
}

?>
