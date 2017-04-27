<?php
    include "db.php";

    $numSelected = $_GET["traditionNumber"];

    //Create connection
    $conn = mysqli_connect($hostname,$username,$password,$database);
    // Check connection
    if (!$conn) {
        die("Connection failed: " . mysqli_connect_error());
    }

    $sql = "SELECT TraditionThumbnail FROM Tradition WHERE TraditionNumber = ?";

    $call = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($call, 'i', $numSelected);
    mysqli_stmt_execute($call);

    // Bind variables to prepared statement
    mysqli_stmt_bind_result($call, $traditionThumbnail);

    $counter = 0;
    $listArr = "";

    header("Content-type: image/jpeg");

    // Fetch values
    while (mysqli_stmt_fetch($call)) {
        echo $traditionThumbnail;
    }

    mysqli_stmt_close($call);

    mysqli_close($conn);
?>