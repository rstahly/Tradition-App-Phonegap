// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;
var map, alumniLocation, tradID, traditions; 
var userLoginName = '';

localStorage['serviceURL'] = "http://localhost/";
var serviceURL = localStorage['serviceURL'];

// Initialize app
var myApp = new Framework7({
    swipePanel: 'left'
});

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function () {
    StatusBar.overlaysWebView(false);
    console.log("Device is ready!");
    console.log(navigator.camera);
    console.log(navigator.notification);
});

// Option 2. Using one 'pageInit' event handler for all pages:
$$(document).on('pageInit', function (e) {
    // Get page data from event data
    var page = e.detail.page;
    
    if ($$('body').hasClass('with-panel-left-reveal')) {
        myApp.closePanel();
    }

    if (page.name === 'welcome') {
    }

    if (page.name === 'register') {
        $$('form#registerForm').submit(function(e) {
            e.preventDefault();
            
            var firstName = document.getElementById('firstName').value;
            var lastName = document.getElementById('lastName').value;
            var registerEmail = document.getElementById('registerEmail').value;
            var gradMonth = document.getElementById('gradMonth').value;
            var gradYear = document.getElementById('gradYear').value;
            
            // If the fields are not all filled in
            if ((firstName==='') || (lastName==='') || (registerEmail==='') || (document.getElementById('gradMonth').selectedIndex === 0) || (gradYear==='')) {
                alert('All of the fields must be filled and a graduation month must be choosen to register.');
            // If the emails entered were not UNK email addresses
            } else if ((registerEmail.indexOf('@lopers.unk.edu') < 0) && (registerEmail.indexOf('@unk.edu') < 0)) {
                alert('You must have a valid UNK email address to register with this app.');
            } else {
                $$.ajax({
                    type: "POST",
                    url: "http://192.168.2.10/registerUser.php?firstName=" + firstName + "&lastName=" + lastName + "&email=" + registerEmail + "&gradMonth=" + gradMonth + "&gradYear=" + gradYear,
                    dataType: "json",
                    success: function(data) {
                        alert(data.Response);
                    },
                    error : function() {
                        alert('There was an error with the registration.');
                    }
                });
            }
        });
    }
    
    if (page.name === 'login') {
        $$('form#loginForm').submit(function(e) {
            e.preventDefault();
            
            var loginEmail = document.getElementById('loginEmail').value;
            
            // If the fields are not all filled in
            if (loginEmail==='') {
                alert('An email must be entered to log in!');
            } else {
                $$.ajax({
                    type: "POST",
                    url: "http://192.168.2.10/userLogin.php?email=" + loginEmail,
                    dataType: "json",
                    success: function(data) {
                        // Set the email as the username after the user successfully logged-in
                        setUserName(loginEmail);
                        
                        alert(data.Response);
                    },
                    error : function() {
                        alert('There was a login error.');
                    }
                });
            }
        });
    }
    
    if (page.name === 'traditionsList') {
        var tableList = '';
        var rowColor = 'odd';
        
        $$.ajax({
            type: "POST",
            url: "http://192.168.2.10/getTraditions.php?userName=" + userLoginName,
            dataType: "json",
            success: function(data) {
                //alert(data.Response);
                for (row = 0; row < data.TraditionList.length; row++) {
                    if (row % 2 === 0) {
                        rowColor = 'odd';
                    } else {
                        rowColor = 'even';
                    }

                    tableList += '<a id="' + row + '" ' 
                        + 'href="traditionsDetail.html" ' 
                        + 'onclick="return setDetail(this.id);">'
                        + '<li class="item-content ' + rowColor + '">'
                        + '<div class="item-media">'
                        + '<img src="' 
                        + 'http://192.168.2.10/getThumbnail.php?traditionNumber=' + data.TraditionList[row].TraditionNumber
                        + '" width="80px"></div>'
                        + '<div class="item-inner">'
                        + '<div class="item-text">' + data.TraditionList[row].TraditionName
                        + '</div>'
                        + '</div>'
                        + '</li></a>';
                }

                // Append the rows to the table
                $$('#tradListTable ul').append(tableList);
            },
            error : function() {
                alert('There was an error loading the traditions.');
            }
        });
    }
    
    if (page.name === 'traditionsDetail') {
        $$.ajax({
            type: "POST",
            url: "http://192.168.2.10/getTraditionDetail.php?traditionNumber=" + (parseInt(tradID) + 1),
            dataType: "json",
            success: function(data) {
                // Set the image source and alt text
                $$('#tradition-image').attr('src', 'http://192.168.2.10/getPhoto.php?traditionNumber=' + (parseInt(tradID)+1));
                $$('#tradition-image').attr(
                    'alt', 'Tradition ' 
                    + (parseInt(tradID)+1) + ' Image');

                // Set the tradition detail title
                $$('#tradition_title').text(
                    data.TraditionList[0].TraditionName);

                // Set the tradition detail summary
                $$('#tradition_summary').text(
                    data.TraditionList[0].TraditionDescription);

                // Set the tradition detail instructions
                $$('#tradition_instructions').text(
                    data.TraditionList[0].TraditionInstructions);
            },
            error : function() {
                alert('There was an error loading the tradition detail information.');
            }
        });
        
        $$('form#completeTradForm').submit(function(e) {
            e.preventDefault();
            var image = null;
            var formData = this;
            
            if (userLoginName === '') {
                 alert('To complete a tradition, please log in or register first!');
            } else {
                var message = 'Would you like to take a photo or choose a photo?';
                var title = 'Complete Tradition';
                var buttonLabels = 'Choose a photo, Take a photo';

                navigator.notification.confirm(message,
                                               confirmCallback, title, buttonLabels);

                function confirmCallback(buttonIndex) {
                    //alert("You clicked " + buttonIndex + " button!");
                    if (buttonIndex === 0) {
                        // Do nothing because no button was chosen
                    // Choose a photo that was already taken
                    } else if (buttonIndex === 1) {                       
                       navigator.camera.getPicture(onSuccess, 
                                                    onFail ,{
                            quality : 25,
                            destinationType : Camera.DestinationType.DATA_URL,
                            sourceType : Camera.PictureSourceType.SAVEDPHOTOALBUM,
                            encodingType: Camera.EncodingType.JPEG});
                    // Take a new photo
                    } else if (buttonIndex === 2) {
                        navigator.camera.getPicture(onSuccess, 
                                                    onFail ,{
                            quality : 25,
                            destinationType : Camera.DestinationType.DATA_URL,
                            sourceType : Camera.PictureSourceType.CAMERA,
                            encodingType: Camera.EncodingType.JPEG,
                            saveToPhotoAlbum: true});
                    }
                    
                    function onSuccess(imageData) {
                        image = document.getElementById('tradCompletePhoto');
                        image.src = 'data:image/jpeg;base64,' + imageData;
                        var imageData64 = 'data:image/jpeg;base64,' + imageData;
                        
                        $$.ajax({
                            method: "POST",
                            type: "POST",
                            url: "http://192.168.2.10/completeTradition.php",
                            data: {
                                photo: imageData64,
                                userName: userLoginName,
                                traditionNumber: (parseInt(tradID) + 1)
                            },
                            dataType: "json",
                            success: function(data) {
                                alert(data.Response);
                            },
                            error : function() {
                                alert('There was an error completing the tradition.');
                            }
                        });
                    }
                    
                    function onFail(message) {
                        alert('Failed because: ' + message);
                        alert('No picture was chosen! An picture must be chosen to complete the tradition.');
                    }
               }
            }
        });
    }
    
    if (page.name === 'contactUs') {    
        var lat=40.714260;
        var lang=-99.084259;

        //Google Maps
        var myLatlng = new google.maps.LatLng(lat,lang);
        var mapOptions = {
            zoom: 16,
            center: myLatlng
        };
        
        var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        
        var infowindow = new google.maps.InfoWindow({
            content: 'UNK Alumni Association'
                + '<br>214 West 39th St.'
                + '<br>Kearney, NE 68845'
        });
        
        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: 'Do something',
            snippet: 'Address'
        });
        
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, marker);
        });
    }
});

function mapOpen() {
    // Change the location address based on device
    if (device.platform === 'iOS') {
        alumniLocation = 'http://maps.apple.com/?address=214+W+39th+St+Kearney%2C+NE+68845';
    } else if (device.platform === 'Android') {
        alumniLocation = 'geo:0,0?q=214+W+39th+St+Kearney%2C+NE+68845';
    } else {
        alumniLocation = 'geo:0,0?q=214+W+39th+St+Kearney%2C+NE+68845';
    }

    cordova.InAppBrowser.open(alumniLocation, '_system');
    
    return false;
}

function setDetail(id) {
    tradID = id;
    
    return false;
}

function setUserName(userName) {
    userLoginName = userName;
    
    return false;
}

$$('#helpMenu').on('click', function () {
    myApp.closePanel();
    
    var modal = myApp.modal({
        title: 'Help',
        text: '<div id="helpTable" '
            + 'class="list-block tablet-inset contacts-block">'
            + '<ul>'
            + '<li class="item-content">'
            + '<div class="item-media">'
            + '<i class="fa fa-list fa-fw"></i></div>'
            + '<div class="item-inner">'
            + '<div class="item-text">'
            + 'View a list of traditions</div>'
            + '</div>'
            + '</li>'
            + '<li class="item-content">'
            + '<div class="item-media">'
            + '<i class="fa fa-check-circle fa-fw"></i></div>'
            + '<div class="item-inner">'
            + '<div class="item-text">'
            + 'Complete traditions</div>'
            + '</div>'
            + '</li>'
            + '<li class="item-content">'
            + '<div class="item-media">'
            + '<i class="fa fa-pencil fa-fw"></i></div>'
            + '<div class="item-inner">'
            + '<div class="item-text">'
            + 'Keep record of completed traditions</div>'
            + '</div>'
            + '</li>'
            + '<li class="item-content">'
            + '<div class="item-media">'
            + '<i class="fa fa-star fa-fw"></i></div>'
            + '<div class="item-inner">'
            + '<div class="item-text">'
            + 'Earn rewards</div>'
            + '</div>'
            + '</li>'
            + '<li class="item-content">'
            + '<div class="item-media">'
            + '<i class="fa fa-info-circle fa-fw"></i></div>'
            + '<div class="item-inner">'
            + '<div class="item-text">'
            + 'Learn about the history of traditions</div>'
            + '</div>'
            + '</li>'
            + '<li class="item-content">'
            + '<div class="item-media">'
            + '<i class="fa fa-heart fa-fw"></i></div>'
            + '<div class="item-inner">'
            + '<div class="item-text">'
            + 'Have fun!</div>'
            + '</div>'
            + '</li>'
            + '</ul>'
            + '</div>',
        buttons: [{
            text: 'Done'
        }]
    });
});