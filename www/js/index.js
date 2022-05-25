var ERROR = 'ERROR';

// Create or Open Database.
var db = window.openDatabase('FGW', '1.0', 'FGW', 20000);

// To detect whether users use mobile phones horizontally or vertically.
$(window).on('orientationchange', onOrientationChange);

// Display messages in the console.
function log(message, type = 'INFO') {
    console.log(`${new Date()} [${type}] ${message}`);
}

function onOrientationChange(e) {
    if (e.orientation == 'portrait') {
        log('Portrait.');
    }
    else {
        log('Landscape.');
    }
}

// To detect whether users open applications on mobile phones or browsers.
if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    $(document).on('deviceready', onDeviceReady);
}
else {
    $(document).on('ready', onDeviceReady);
}

// Display errors when executing SQL queries.
function transactionError(tx, error) {
    log(`SQL Error ${error.code}. Message: ${error.message}.`, ERROR);
}

// Run this function after starting the application.
function onDeviceReady() {
    log(`Device is ready.`);

    //DATABASE
    addressDatabase(db);
    otherDatabase(db);
}

/*<---------------------SHOW ADDRESS OPTION------------------------>*/
$(document).on('pagebeforeshow', '#page-create', function () {
    cityOption('#page-create #frm-register');
    districtOption('#page-create #frm-register');
    wardOption('#page-create #frm-register');

    typeOption('#page-create #frm-register');
    furnitureOption('#page-create #frm-register');
});

$(document).on('change', '#page-create #frm-register #city', function () {
    districtOption('#page-create #frm-register');
    wardOption('#page-create #frm-register');
});

$(document).on('change', '#page-create #frm-register #district', function () {
    wardOption('#page-create #frm-register');
});


function cityOption(form, selectedId = -1) {
    db.transaction(function (tx) {
        var query = `SELECT * FROM City ORDER BY Name`;
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of city successfully.`);

            var optionList = `<option value="-1">
                                    Select City
                                </option>`;

            for (let item of result.rows) {
                optionList += `<option value="${item.Id}" ${selectedId == item.Id ? 'selected' : ''}>
                                    ${item.Name}
                                </option>`;
            }

            $(`${form} #city`).html(optionList);
            $(`${form} #city`).selectmenu('refresh', true);
        }
    });
}

function districtOption(form, selectedId = -1) {
    var id = $(`${form} #city`).val();

    db.transaction(function (tx) {
        var query = `SELECT * FROM District WHERE CityId = ? ORDER BY Name`;
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of district successfully.`);

            var optionList = `<option value="-1">
                                    Select District
                                </option>`;

            for (let item of result.rows) {
                optionList += `<option value="${item.Id}" ${selectedId == item.Id ? 'selected' : ''}>
                                    ${item.Name}
                                </option>`;
            }

            $(`${form} #district`).html(optionList);
            $(`${form} #district`).selectmenu('refresh', true);
        }
    });
}

function wardOption(form, selectedId = -1) {
    var id = $(`${form} #district`).val();

    db.transaction(function (tx) {
        var query = `SELECT * FROM Ward WHERE DistrictId = ? ORDER BY Name`;
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of ward successfully.`);

            var optionList = `<option value="-1">
                                    Select Ward
                                </option>`;

            for (let item of result.rows) {
                optionList += `<option value="${item.Id}" ${selectedId == item.Id ? 'selected' : ''}>
                                    ${item.Name}
                                </option>`;
            }

            $(`${form} #ward`).html(optionList);
            $(`${form} #ward`).selectmenu('refresh', true);
        }
    });
}

/*<---------------------SHOW TYPE & FURNITURE OPTION------------------------>*/
const Type = {
    "Apartment": 0,
    "Penthouse": 1,
    "House": 2,
    "Villa": 3
};

const Furniture = {
    "Unfurnished": 0,
    "Part Furnished": 1,
    "Furnished": 2
};

function typeOption(form, selectedId = -1) {

    

    var optionList = `<option value="-1">
                            Select Type
                        </option>`;

    for (var key in Type) {
        optionList += `<option value="${Type[key]}" ${Type[key] == selectedId ? 'selected' : ''}>
                            ${key}
                        </option>`;
    }

    $(`${form} #type`).html(optionList);
    $(`${form} #type`).selectmenu('refresh', true);
}



function furnitureOption(form, selectedId = -1) {  
    var optionList = `<option value="-1">
                            Select Furniture
                        </option>`;

    for (var key in Furniture) {
        optionList += `<option value="${Furniture[key]}" ${Furniture[key] == selectedId ? 'selected' : ''}>
                            ${key}
                        </option>`;
    }

    $(`${form} #furniture`).html(optionList);
    $(`${form} #furniture`).selectmenu('refresh', true);
}


/*<---------------------PROPERTY REGISTER------------------------>*/
// Submit a form to register a new property.
$(document).on('submit', '#page-create #frm-register', confirmProperty);
$(document).on('submit', '#page-create #frm-confirm', registerProperty);

//Function datepicker
$( document ).bind( "mobileinit", function(){
    $.mobile.page.prototype.options.degradeInputs.date = true;
});

//Validation
function isValid(form ) {
    var isValid = true;
    var error = $(`${form} #error`);

    error.empty();

    if ($(`${form} #city`).val() == -1) {
        isValid = false;
        error.append('<p>* City is required.</p>');
    }

    if ($(`${form} #district`).val() == -1) {
        isValid = false;
        error.append('<p>* District is required.</p>');
    }

    if ($(`${form} #ward`).val() == -1) {
        isValid = false;
        error.append('<p>* Ward is required.</p>');
    }

    if ($(`${form} #type`).val() == -1) {
        isValid = false;
        error.append('<p>* Type is required.</p>');
    }

    return isValid;
}

function confirmProperty(e) {
    e.preventDefault();
    
    if (isValid('#page-create #frm-register')) {
        //Get info by name
        var name = $(`#page-create #frm-register #name`).val();
        var address = $(`#page-create #frm-register #address`).val();
        var city = $(`#page-create #frm-register #city option:selected`).text();
        var district = $(`#page-create #frm-register #district option:selected`).text();
        var ward = $(`#page-create #frm-register #ward option:selected`).text();
        var type = $(`#page-create #frm-register #type option:selected`).text();
        var furniture = $(`#page-create #frm-register #furniture option:selected`).text();
        var dateadd = $(`#page-create #frm-register #date`).val();
        var timeadd = $(`#page-create #frm-register #time`).val();
        var bedroom = $(`#page-create #frm-register #bedroom`).val();
        var price = $(`#page-create #frm-register #price`).val();
        var reporter = $(`#page-create #frm-register #reporter`).val();
        var isNote = true;
        var note = (isNote) ? $(`#page-create #frm-register #note`).val() : ''; 

        db.transaction(function (tx) {
            var query = 'SELECT * FROM Property WHERE Name = ?';
            tx.executeSql(query, [name], transactionSuccess, transactionError);

            function transactionSuccess(tx, result) {
                if (result.rows[0] == null) {
                    log('Open the confirmation popup.');

                    $('#page-create #error').empty();

                    //Set HTML info
                    $(`#page-create #frm-confirm #name`).text(name);
                    $(`#page-create #frm-confirm #address`).text(address);
                    $(`#page-create #frm-confirm #city`).text(city);
                    $(`#page-create #frm-confirm #district`).text(district);
                    $(`#page-create #frm-confirm #ward`).text(ward);
                    $(`#page-create #frm-confirm #type`).text(type);
                    $(`#page-create #frm-confirm #furniture`).text(furniture);
                    $(`#page-create #frm-confirm #date`).text(dateadd);
                    $(`#page-create #frm-confirm #time`).text(timeadd);
                    $(`#page-create #frm-confirm #bedroom`).text(bedroom);
                    $(`#page-create #frm-confirm #price`).text(`${price.toLocaleString('en-US')} USD / month`); 
                    $(`#page-create #frm-confirm #reporter`).text(reporter);

                    if (isNote) {$(`#page-create #frm-confirm #note`).text(note);}                   

                    $('#page-create #frm-confirm').popup('open');
                }
                else {
                    var error = 'Name exists.';
                    $('#page-create #error').empty().append(error);
                    log(error, ERROR);
                }
            }
        });
    }
}

function registerProperty(e) {
    e.preventDefault();
    
    //Get Info By Value
    var isNote = true;
    var name = $(`#page-create #frm-register #name`).val();
    var address = $(`#page-create #frm-register #address`).val();
    var city = $(`#page-create #frm-register #city`).val();
    var district = $(`#page-create #frm-register #district`).val();
    var ward = $(`#page-create #frm-register #ward`).val();
    var type = $(`#page-create #frm-register #type`).val();
    var furniture = $(`#page-create #frm-register #furniture`).val();
    var bedroom = $(`#page-create #frm-register #bedroom`).val();
    var price = $(`#page-create #frm-register #price`).val();
    var reporter = $(`#page-create #frm-register #reporter`).val();
    var note = isNote  ? $(`#page-create #frm-register #note`).val() : '';
    var dateadd = $(`#page-create #frm-register #date`).val();
    var timeadd = $(`#page-create #frm-register #time`).val();

    var datetime = new Date();

    db.transaction(function (tx) {
        var query = `INSERT INTO Property (Name, Address, City, District, Ward, Type, Furniture, Bedroom, Price, Reporter, Dateadd, Timeadd) VALUES
                                            (?,    ?,      ?,     ?,       ?,    ?,      ?,        ?,      ?,      ?,       ?,       ?)`;
                tx.executeSql(query, [name, address, city, district, ward, type, furniture, bedroom, price, reporter, dateadd, timeadd], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Create a property '${name}' successfully.`);

            $('#page-create #frm-register').trigger('reset');
            $('#page-create #error').empty();
            $('#page-create #frm-register #name').focus();

            $('#page-create #frm-confirm').popup('close');

            if (note != '') {
                db.transaction(function (tx) {
                    var query = `INSERT INTO Note (Comment, PropertyId, Datetime) VALUES (?, ?, ?)`;
                    tx.executeSql(query, [note, result.insertId, datetime], transactionSuccess, transactionError);

                    function transactionSuccess(tx, result) {
                        log(`Add new note to property '${name}' successfully.`);
                    }
                });
            }
        }
    });
}

//<---------------------DISPLAY PROPERTY LIST------------------------>
$(document).on('pagebeforeshow', '#page-list', showList);

function showList() {
    db.transaction(function (tx) {
        var query = `SELECT Property.Id AS Id, Property.Name AS Name, Price, Bedroom, Type, City.Name AS City 
                    FROM Property 
                    LEFT JOIN City ON Property.City = City.Id`;
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of properties successfully.`);

            // Prepare the list of properties.
            var listProperty = `<ul id='list-property' data-role='listview' class='ui-nodisc-icon ui-alt-icon'>`;

            for (let property of result.rows) {
                listProperty += `<li><a  data-details='{"Id" : ${property.Id}}'>
                                    <h3 style='margin-bottom: 0px;'>${property.Name}</h3>
                                    <p style='margin-top: 2px; margin-bottom: 10px;'><small>${property.City}</small></p>
                                    
                                    <div>
                                        <img src='img/bedroom.png' height='20px' style='margin-bottom: -3px;'>
                                        <strong style='font-size: 13px;'>${property.Bedroom}<strong>
                                        
                                        &nbsp;&nbsp;
                                        <img src='img/apartments.png' height='20px' style='margin-bottom: -3px;'>
                                        <strong style='font-size: 13px;'>${Object.keys(Type)[property.Type]}<strong>
                                        
                                        &nbsp;&nbsp;
                                        <img src='img/dollar.png' height='20px' style='margin-bottom: -3px;'>
                                        <strong style='font-size: 13px;'>${property.Price.toLocaleString('en-US')} USD / month<strong>
                                    </div>
                                </a></li>`;
            }
            listProperty += `</ul>`;

            // Add list to UI.
            $('#list-property').empty().append(listProperty).listview('refresh').trigger('create');

            log(`Show list of accounts successfully.`);
        }
    });
}

//<---------------------SHOW DETAIL------------------------>
//Get currentPropertyId
$(document).on('vclick', '#list-property li a', function (e) {
    e.preventDefault();

    var id = $(this).data('details').Id;
    localStorage.setItem('currentPropertyId', id);

    $.mobile.navigate('#page-detail', { transition: 'none' });
});

$(document).on('pagebeforeshow', '#page-detail', showDetail);

function showDetail() {
    var id = localStorage.getItem('currentPropertyId');

    db.transaction(function (tx) {
        var query = `SELECT Property.*, City.Name AS CityName, District.Name AS DistrictName , Ward.Name AS WardName
                        FROM Property
                        LEFT JOIN City ON City.Id = Property.City
                        LEFT JOIN District ON District.Id = Property.District
                        LEFT JOIN Ward ON Ward.Id = Property.Ward
                        WHERE Property.Id = ?`;

        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var name = result.rows[0].Name;
            var address = result.rows[0].Address;
            var city = result.rows[0].CityName;
            var district = result.rows[0].DistrictName;
            var ward = result.rows[0].WardName;
            var type = Object.keys(Type)[result.rows[0].Type];
            var furniture = Object.keys(Furniture)[result.rows[0].Furniture];
            var bedroom = result.rows[0].Bedroom;
            var price = result.rows[0].Price;
            var reporter = result.rows[0].Reporter;
            var dateadd = result.rows[0].Dateadd;
            var timeadd = result.rows[0].Timeadd;
            var note = result.rows[0].Note;

            if (result.rows[0] != null) {
                log(`Get details of property '${result.rows[0].Name}' successfully.`);

                var isNote = false;
                var isDate = true;
                var isTime = true;

                
                $(`#page-detail #detail #name`).text(name);
                $(`#page-detail #detail #address`).text(address);
                $(`#page-detail #detail #city`).text(city);
                $(`#page-detail #detail #district`).text(district);
                $(`#page-detail #detail #ward`).text(ward);
                $(`#page-detail #detail #type`).text(type);
                $(`#page-detail #detail #furniture`).text(furniture);
                $(`#page-detail #detail #bedroom`).text(bedroom);
                $(`#page-detail #detail #price`).text(`${price.toLocaleString('en-US')} USD / month`);
                $(`#page-detail #detail #reporter`).text(reporter);

                if (isNote)
                    $(`#page-detail #detail #note`).text(note);

                if (isDate)
                    $(`#page-detail #detail #date`).text(dateadd);

                if (isTime)
                    $(`#page-detail #detail #time`).text(timeadd);

                showNote();
            }
            else {
                var errorMessage = 'Property not found.';

                log(errorMessage, ERROR);

                $('#page-detail #detail #name').text(errorMessage); 
                //$('#page-detail #btn-delete-confirm').addClass('ui-state-disabled');  
            }
        }
    });
}

//<---------------------ADD NOTE------------------------>
$(document).on('submit', '#page-detail #frm-note', addNote);

function addNote(e) {
    e.preventDefault();

    var propertyId = localStorage.getItem('currentPropertyId');
    var comment = $('#page-detail #frm-note #txt-note').val();
    var datetime = new Date();

    db.transaction(function (tx) {
        var query = 'INSERT INTO Note (PropertyId, Comment, Datetime) VALUES (?, ?, ?)';
        tx.executeSql(query, [propertyId, comment, datetime], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Add new note to account '${propertyId}' successfully.`);

            $('#page-detail #frm-note').trigger('reset');

            showNote();
        }
    });
}

//<---------------------SHOW NOTE------------------------>
function showNote() {
    var propertyId = localStorage.getItem('currentPropertyId');

    db.transaction(function (tx) {
        var query = 'SELECT * FROM Note WHERE PropertyId = ?';
        tx.executeSql(query, [propertyId], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of notes successfully.`);

            // Prepare the list of comments.
            var listNote = '';
            for (let note of result.rows) {
                listNote += `<div class = 'list'>
                                    <small>${note.Datetime}</small>
                                    <h3>${note.Comment}</h3>
                                </div>`;
            }
            
            // Add list to UI.
            $('#note-list').empty().append(listNote);

            log(`Show list of notes successfully.`);
        }
    });
}

//<---------------------PROPERTY DELETE------------------------>
$(document).on('submit', '#page-detail #frm-delete', deleteProperty);
$(document).on('keyup', '#page-detail #frm-delete #txt-delete', confirmDeleteProperty);

function confirmDeleteProperty() {
    var text = $('#page-detail #frm-delete #txt-delete').val();

    if (text == 'confirm delete') {
        $('#page-detail #frm-delete #btn-delete').removeClass('ui-state-disabled');
    }
    else {
        $('#page-detail #frm-delete #btn-delete').addClass('ui-state-disabled');
    }
}

function deleteProperty(e) {
    e.preventDefault();

    var id = localStorage.getItem('currentPropertyId');

    db.transaction(function (tx) {
        var query = 'DELETE FROM Property WHERE Id = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError); 

        function transactionSuccess(tx, result) {
            log(`Delete property '${id}' successfully.`);

            $('#page-detail #frm-delete').trigger('reset');

            $.mobile.navigate('#page-list', { transition: 'none' });
        }

        var query = 'DELETE FROM Note WHERE PropertyId = ?';
        tx.executeSql(query, [id], function (tx, result) {
            log(`Delete notes of property '${id}' successfully.`);
        }, transactionError);
    });
}

//<---------------------PROPERTY UPDATE------------------------>

$(document).on('vclick', '#page-detail #btn-update', showUpdate);
$(document).on('submit', '#page-detail #frm-update', updateProperty);
$(document).on('vclick', '#page-detail #frm-update #cancel', function () {
    $('#page-detail #frm-update').popup('close');
});

$(document).on('change', '#page-detail #frm-update #city', function () {
    addDistrictOption_Update(('#page-detail #frm-update'), this.value);
    addWardOption_Update(('#page-detail #frm-update'), -1);
});

$(document).on('change', '#page-detail #frm-update #district', function () {
    addWardOption_Update(('#page-detail #frm-update'), this.value);
});

function addDistrictOption_Update(form, cityId, selectedId = -1) {
    districtOption_Update(form, cityId, selectedId);
}

function addWardOption_Update(form, districtId, selectedId = -1) {
    wardOption_Update(form, districtId, selectedId);
}

function districtOption_Update(form, cityId, selectedId = -1) {
    db.transaction(function (tx) {
        var query = `SELECT * FROM District WHERE CityId = ? ORDER BY Name`;
        tx.executeSql(query, [cityId], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of district update successfully.`);

            var optionList = `<option value="-1">
                                Select District
                              </option>`;

            for (let item of result.rows) {
                optionList += `<option value="${item.Id}" ${selectedId == item.Id ? 'selected' : ''}>
                                    ${item.Name}
                                </option>`;
            }

            $(`${form} #district`).html(optionList);
            $(`${form} #district`).selectmenu('refresh', true);
        }
    });
}

function wardOption_Update(form, districtId, selectedId = -1) {
    db.transaction(function (tx) {
        var query = `SELECT * FROM Ward WHERE DistrictId = ? ORDER BY Name`;
        tx.executeSql(query, [districtId], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of ward update successfully.`);

            var optionList = `<option value="-1">
                                Select Ward
                               </option>`;

            for (let item of result.rows) {
                optionList += `<option value="${item.Id}" ${selectedId == item.Id ? 'selected' : ''}>
                                    ${item.Name}
                                </option>`;
            }

            $(`${form} #ward`).html(optionList);
            $(`${form} #ward`).selectmenu('refresh', true);
        }
    });
}

function showUpdate() {
    var id = localStorage.getItem('currentPropertyId');

    db.transaction(function (tx) {
        var query = `SELECT * FROM Property WHERE Id = ?`;

        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            if (result.rows[0] != null) {
                log(`Get details of property '${result.rows[0].Name}' successfully.`);

                $(`#page-detail #frm-update #name`).val(result.rows[0].Name);
                $(`#page-detail #frm-update #address`).val(result.rows[0].Address);                
                $(`#page-detail #frm-update #bedroom`).val(result.rows[0].Bedroom);
                $(`#page-detail #frm-update #reporter`).val(result.rows[0].Reporter);
                $(`#page-detail #frm-update #price`).val(result.rows[0].Price);
                $(`#page-detail #frm-update #date`).val(result.rows[0].Dateadd);
                $(`#page-detail #frm-update #time`).val(result.rows[0].Timeadd);

                cityOption(('#page-detail #frm-update'), result.rows[0].City);
                addDistrictOption_Update(('#page-detail #frm-update'), result.rows[0].City, result.rows[0].District);
                addWardOption_Update(('#page-detail #frm-update'), result.rows[0].District, result.rows[0].Ward);
                
                typeOption(('#page-detail #frm-update'), result.rows[0].Type);
                furnitureOption(('#page-detail #frm-update'), result.rows[0].Furniture);
            }
        }
    });
}

function updateProperty(e) {
    e.preventDefault();

    if (isValid('#page-detail #frm-update')) {
        var id = localStorage.getItem('currentPropertyId');
        var name = $(`#page-detail #frm-update #name`).val();
        var address = $(`#page-detail #frm-update #address`).val();
        var city = $(`#page-detail #frm-update #city`).val();
        var district = $(`#page-detail #frm-update #district`).val();
        var ward = $(`#page-detail #frm-update #ward`).val();
        var type = $(`#page-detail #frm-update #type`).val();
        var furniture = $(`#page-detail #frm-update #furniture`).val();
        var bedroom = $(`#page-detail #frm-update #bedroom`).val();
        var price = $(`#page-detail #frm-update #price`).val();
        var reporter = $(`#page-detail #frm-update #reporter`).val();
        var dateadd = $(`#page-detail #frm-update #date`).val();
        var timeadd = $(`#page-detail #frm-update #time`).val();

        db.transaction(function (tx) {
            var query = `UPDATE Property SET Name = ?, Address = ?, City = ?, District = ?, Ward = ?, Type = ?,    
                                             Bedroom = ?, Price = ?, Furniture = ?, Reporter = ?, Dateadd = ?, Timeadd = ? WHERE Id = ?`;

            tx.executeSql(query, [name, address, city, district, ward, type, bedroom, price, furniture, reporter, dateadd, timeadd, id], transactionSuccess, transactionError);

            function transactionSuccess(tx, result) {
                log(`Update property '${name}' successfully.`);

                showDetail();

                $('#page-detail #frm-update').popup('close');
            }
        });
    }
}

//<---------------------PROPERTY SEARCH------------------------>
$(document).on('keyup', $('#page-list #txt-filter'), searchNormal);

function searchNormal() {
    var search = $('#page-list #txt-search').val().toLowerCase();
    var li = $('#page-list #list-property ul li');

    for (var i = 0; i < li.length; i++) {
        var a = li[i].getElementsByTagName("a")[0];
        var text = a.textContent || a.innerText;

        li[i].style.display = text.toLowerCase().indexOf(search) > -1 ? "" : "none";
    }
}


$(document).on('vclick', '#page-list #panel-open', openFilterSearch);

$(document).on('vclick', '#page-list #btn-reset', showList);
$(document).on('submit', '#page-list #frm-filter-search', filterSearch);

function prepareForm(form) {
    cityOption(form);
    districtOption(form);
    wardOption(form);

    typeOption(form);
    furnitureOption(form);
}

function openFilterSearch(e) {
    e.preventDefault();
    prepareForm('#page-list #frm-filter-search');
    $('#page-list #frm-filter-search').panel('open');
}

$(document).on('change', '#page-list #frm-filter-search #city', function () {
    districtOption('#page-list #frm-filter-search');
    wardOption('#page-list #frm-filter-search');
});

$(document).on('change', '#page-list #frm-filter-search #district', function () {
    wardOption('#page-list #frm-filter-search');
});

function filterSearch(e) {
    e.preventDefault();
    
    var name = $('#page-list #frm-filter-search #name').val();
    var address = $('#page-list #frm-filter-search #address').val();
    var city = $('#page-list #frm-filter-search #city').val();
    var district = $('#page-list #frm-filter-search #district').val();
    var ward = $('#page-list #frm-filter-search #ward').val();
    var type = $('#page-list #frm-filter-search #type').val();
    var furniture = $('#page-list #frm-filter-search #furniture').val();
    var bedroom = $('#page-list #frm-filter-search #bedroom').val();
    var reporter = $('#page-list #frm-filter-search #reporter').val();
    var priceMin = $('#page-list #frm-filter-search #price-min').val();
    var priceMax = $('#page-list #frm-filter-search #price-max').val();

    db.transaction(function (tx) {
        var query = `SELECT Property.Id AS Id, Property.Name AS Name, Price, Bedroom, Type, City.Name AS City
                    FROM Property LEFT JOIN City ON Property.City = City.Id
                    WHERE`;

        if (name) {query += ` Property.Name LIKE "%${name}%"   AND`;}
        if (address) {query += ` Address LIKE "%${address}%"   AND`;}
        if (city != -1) {query += ` City = ${city}   AND`;}
        if (district != -1) {query += ` District = ${district}   AND`;}
        if (ward != -1) {query += ` Ward = ${ward}   AND`;}
        if (type != -1) {query += ` Type = ${type}   AND`;}
        if (furniture != -1) {query += ` Furniture = ${furniture}   AND`;}
        if (bedroom) {query += ` Bedroom = ${bedroom}   AND`;}
        if (reporter) {query += ` Reporter LIKE "%${reporter}%"   AND`;}
        if (priceMin) {query += ` Price >= ${priceMin}   AND`;}
        if (priceMax) {query += ` Price <= ${priceMax}   AND`;}
        
        query = query.substring(0, query.length - 6);
        
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Search properties successfully.`);
            
            var listProperty = `<ul id='list-property' data-role='listview' class='ui-nodisc-icon ui-alt-icon'>`;

            for (let property of result.rows) {
                listProperty += `<li><a data-details='{"Id" : ${property.Id}}'>
                                    <h3 style='margin-bottom: 0px;'>${property.Name}</h3>
                                    <p style='margin-top: 2px; margin-bottom: 10px;'><small>${property.City}</small></p>
                                    
                                    <div>
                                        <img src='img/bedroom.png' height='20px' style='margin-bottom: -3px;'>
                                        <strong style='font-size: 13px;'>${property.Bedroom}<strong>
                                        
                                        &nbsp;&nbsp;
                                        <img src='img/apartments.png' height='20px' style='margin-bottom: -3px;'>
                                        <strong style='font-size: 13px;'>${Object.keys(Type)[property.Type]}<strong>
                                        
                                        &nbsp;&nbsp;
                                        <img src='img/dollar.png' height='20px' style='margin-bottom: -3px;'>
                                        <strong style='font-size: 13px;'>${property.Price.toLocaleString('en-US')} USD / month<strong>
                                    </div>
                                </a></li>`;
            }
            listProperty += `</ul>`;

            // Add list to UI.
            $('#list-property').empty().append(listProperty).listview('refresh').trigger('create');

            log(`Show list of accounts successfully.`);

            $('#page-list #frm-filter-search').trigger('reset');
            $('#page-list #frm-filter-search').panel('close');
        }
    });
}




