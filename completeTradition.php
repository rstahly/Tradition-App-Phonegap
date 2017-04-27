<?php
    include "db.php";

    header("Content-type: image/jpeg");

    //This is the directory where images will be saved 
    //$target = "images/"; 
    //$target = $target . basename( $_FILES['photo']['name']);

    //$photo = ($_FILES["photo"]["name"]);
    //$photo = $_GET["photo"];

    //if ($_REQUEST["photo"]) {
        // convert the image data from base64
        $imgData = $_POST["photo"];
        $imgData = str_replace("data:image/jpeg;base64,", "", $imgData);
        $imgData = str_replace(" ", "+", $imgData);
        //$imgData = base64_decode($imgData);
    //}

    $userName = $_POST["userName"];
    $traditionNumber = $_POST["traditionNumber"];
    $message = "";

    //Create connection
    $conn = mysqli_connect($hostname,$username,$password,$database);
    // Check connection
    if (!$conn) {
        die("Connection failed: " . mysqli_connect_error());
    }

    $call = mysqli_prepare($conn, "Call trad_complete_proc(?,?,?,@message)");
    mysqli_stmt_bind_param($call, 'bsi', $imgData, $userName, $traditionNumber);
    mysqli_stmt_execute($call);

    $select = mysqli_query($conn, "SELECT @message");
    $result = mysqli_fetch_assoc($select);

    //move_uploaded_file($_FILES["photo"]["tmp_name"], $target);

    // If the tradition was successfully completed
    if ($result["@message"] == "Tradition Completed!") {
        $call = mysqli_prepare($conn, "Call check_level_proc(?,@message)");
        mysqli_stmt_bind_param($call, 's', $userName);
        mysqli_stmt_execute($call);

        $select = mysqli_query($conn, "SELECT @message");
        $result = mysqli_fetch_assoc($select);
        
        // If the message returned was not equal to blank
        if ($result["@message"] != "") {
            echo json_encode(array("Response" => $result["@message"]));
        } else {
            echo json_encode(array("Response" => "Tradition Completed!"));
        }
    // If the tradition was not completed or had already been completed or the user name is not valid
    } else {
        echo json_encode(array("Response" => $result["@message"]));
    }

    mysqli_close($conn);
?>