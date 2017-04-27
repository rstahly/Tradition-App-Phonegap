<?php
    include "db.php";

    $userName = $_GET["userName"];

    //Create connection
    $conn = mysqli_connect($hostname,$username,$password,$database);
    // Check connection
    if (!$conn) {
        die("Connection failed: " . mysqli_connect_error());
    }

    $sql = "SELECT TraditionNumber, TraditionName, CASE WHEN (SELECT TraditionID FROM CompletedTradition WHERE StudentID IN (SELECT StudentID FROM Student WHERE StudentEmail = ?) AND TraditionID = TraditionNumber) IS NOT NULL THEN 1 ELSE 0 END AS Completed FROM Tradition";

    $call = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($call, 's', $userName);
    mysqli_stmt_execute($call);

    // Bind variables to prepared statement
    mysqli_stmt_bind_result($call, $traditionNumber, $traditionName, $completed);

    $counter = 0;
    $listArr = "";

    // Fetch values
    while (mysqli_stmt_fetch($call)) {
        $arr = array("TraditionNumber" => $traditionNumber, "TraditionName" => $traditionName, "Completed" => $completed);
        
        $listArr[$counter] = $arr;
        $counter = $counter + 1;
    }

    $completeArr = array("TraditionList" => $listArr);
    echo json_encode($completeArr);

    mysqli_stmt_close($call);

    mysqli_close($conn);
?>