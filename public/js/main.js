function makeUsername() {
    var a = ["Alpha","Bravo","Charlie","Delta","Echo","Fox-Trot","Golf","Hotel","India","Juliet","Kilo","Lima","Mike","November","Oscar","Papa","Quebec","Romeo","Sierra","Tango","Uniform","Victor","Whisky","X-Ray","Yankee","Zoulou"];
    var lock1 = Math.floor((Math.random() * 26));
    var lock2 = Math.floor((Math.random() * 26));
    var lock3 = Math.floor((Math.random() * 256)+1);
    var uname = a[lock1]+"-"+a[lock2]+"-"+lock3;
    $("#m").attr('placeholder', 'Your name is '+uname);
    return uname;
}

var uname = makeUsername();

var socket = io.connect('http://localhost:3000', {query: "username="+uname});

socket.on('logedin', function(Uname) {
    if (Uname===uname) {
        $('#chatbox').append($('<div class="message-logedin">You joined the chat.</div>'));
        $("body").scrollTop( $("body")[0].scrollHeight );
    } else {
        $('#chatbox').append($('<div class="message-logedin">'+Uname.toString()+' joined the chat.</div>'));
        $("body").scrollTop( $("body")[0].scrollHeight );
    }
});

socket.on('logedout', function(client) {
    if (client==="NO_USERNAME") {
        $('#chatbox').append($('<div class="message-logedin">A user left the chat.</div>'));
    } else {
        $('#chatbox').append($('<div class="message-logedin">'+client+' left the chat.</div>'));
    }
    $("body").scrollTop( $("body")[0].scrollHeight );
});


function htmlEncode(value){
    return $('<div/>').text(value).html();
}

function sendMsg() {
    var raw = $('#m').val();
    var msg = htmlEncode(raw);
    if (msg!==undefined && msg.trim()!=="") {
        if (msg.length<=1000) {
            var msgArray = {userName:uname, msgText:msg};
            socket.emit('chat message', msgArray);
            $('#m').val('');
        } else {
            alert('Error: Your message must be less than 1000 caracters.');
        }
    }
    return false;
}

var newUserOK = "";

function editUsername() {
    var newUser = $('.edit-input').val();
    newUserOK = htmlEncode(newUser);
    if (newUserOK!==undefined && newUserOK.trim()!=="" && newUserOK.length<=30) {
        var renameArray = {oldUser:uname, newUser:newUserOK};
        socket.emit('rename', renameArray);
    }
}

socket.on('renamed', function(user) {
    if (user.newUser===newUserOK) {
        uname = newUserOK;
        $('.edit-input').val('');
        $('.edit-dial').slideToggle(400);
        $('#chatbox').append($('<div class="message-logedin">You renamed yourself to '+user.newUser.toString()+'.</div>'));
        $("#m").attr('placeholder', 'Your name is '+user.newUser.toString());
        $("body").scrollTop( $("body")[0].scrollHeight );
    } else {
        $('#chatbox').append($('<div class="message-logedin">'+user.oldUser.toString()+' renamed himself to '+user.newUser.toString()+'.</div>'));
        $("body").scrollTop( $("body")[0].scrollHeight );
    }
});

socket.on('alreadyTaken', function(user) {
    if (user===uname) {
        alert('Error: Username already taken');
    }
});

$("#m").keydown(function (e) {
    if (e.keyCode === 13) {
        sendMsg();
    }
});

$(".edit-input").keydown(function (e) {
    if (e.keyCode === 13) {
        editUsername();
    }
});

$('#submitChat').click(function(){
    sendMsg();
});

$('#submitEdit').click(function() {
    editUsername();
});

function urlify(text) {
    var urlRegex = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/ig;
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '" target="_blank" class="link">' + url + '</a>';
    });
}

var unread = 0;

function unreadTitle(param) {
    console.log("FIRED");
    if (param==='new') {
        unread = unread + 1;
        document.title = '('+unread+') AymericM - Anonymous Chat';
    } else if (param==='reset') {
        unread = 0;
        document.title = 'AymericM - Anonymous Chat';
    }
}

$('html').click(function() {unreadTitle('reset');});

socket.on('chat message', function(msg){
    var msg_txt = msg.msgText.toString();
    msg_txt = urlify(msg_txt);
    if (msg.userName===uname) {
        $('#chatbox').append($('<div class="message-container-me"><p class="message-me col-md-9 col-xs-12 col-lg-5 col-sm-10">'+msg_txt+'</p></div>'));
        $("body").scrollTop( $("body")[0].scrollHeight );
    } else {
        unreadTitle('new');
        $('#chatbox').append($('<div class="message-container"><p class="sender">'+msg.userName+'</p><p class="message col-md-9 col-xs-12 col-lg-5 col-sm-10">'+msg_txt+'</p></div>'));
        $("body").scrollTop( $("body")[0].scrollHeight );
    }
});

function arrayCompare(a, b) {
    var i = a.length;
    if (i != b.length) return false;
    while (i--) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

var userList = [];

socket.on('userlist', function(list) {
    var ac = arrayCompare(userList, list);
    if (ac===false) {
        userList = list;
        $('.ppl-name').remove();
        for (var i = 0; i < userList.length; i++) {
            if (list[i]===uname) {
                $("#ppl-list").append('<div class="ppl-name">'+list[i]+' (You)</div>');
            } else {
                $("#ppl-list").append('<div class="ppl-name">'+list[i]+'</div>');
            }
        }
    }
});
