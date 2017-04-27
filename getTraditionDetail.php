<?php
    include "db.php";

    $numSelected = $_GET["traditionNumber"];

    //Create connection
    $conn = mysqli_connect($hostname,$username,$password,$database);
    // Check connection
    if (!$conn) {
        die("Connection failed: " . mysqli_connect_error());
    }

    $sql = "SELECT TraditionNumber, TraditionName, TraditionDescription, TraditionInstructions FROM Tradition WHERE TraditionNumber = ?";

    $call = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($call, 'i', $numSelected);
    mysqli_stmt_execute($call);

    // Bind variables to prepared statement
    mysqli_stmt_bind_result($call, $traditionNumber, $traditionName, $traditionDescription, $traditionInstructions);

    $counter = 0;
    $listArr = "";

    // Fetch values
    while (mysqli_stmt_fetch($call)) {
        $arr = array("TraditionNumber" => $traditionNumber, "TraditionName" => $traditionName, "TraditionDescription" => $traditionDescription, "TraditionInstructions" => $traditionInstructions);
        
        $listArr[$counter] = $arr;
        $counter = $counter + 1;
    }

    $completeArr = array("TraditionList" => $listArr);
    echo json_encode($completeArr);

    mysqli_stmt_close($call);

    mysqli_close($conn);
?>