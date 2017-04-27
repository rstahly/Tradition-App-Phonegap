<?php
    include "db.php";

    $firstName = $_GET["firstName"];
    $lastName = $_GET["lastName"];
    $email = $_GET["email"];
    $gradMonth = $_GET["gradMonth"];
    $gradYear = $_GET["gradYear"];
    $message = "";

    //Create connection
    $conn = mysqli_connect($hostname,$username,$password,$database);
    // Check connection
    if (!$conn) {
        die("Connection failed: " . mysqli_connect_error());
    }

    $call = mysqli_prepare($conn, "Call trad_student_add(?,?,?,?,?,@message)");
    mysqli_stmt_bind_param($call, 'sssii', $firstName, $lastName, $email, $gradMonth, $gradYear);
    mysqli_stmt_execute($call);

    $select = mysqli_query($conn, "SELECT @message");
    $result = mysqli_fetch_assoc($select);

    echo json_encode(array("Response" => $result["@message"]));

    mysqli_close($conn);
?>