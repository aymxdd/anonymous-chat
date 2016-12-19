$(document).ready(function() {window.scrollTo(0,1);});

var sb_toggled = false;

function toggleSidebar() {
    $('.ppl-drawer').css({
        'width': $('.ppl-drawer').width(),
        'height': $('.ppl-drawer').height()
    });
    $('.ppl-drawer').animate({'width': 'toggle'});
    if (sb_toggled===true) {
        $("body").css('overflow', 'auto');
        $('#blackout').fadeOut(400);
        sb_toggled = false;
    } else {
        $("body").css('overflow', 'hidden');
        $('#blackout').fadeIn(400);
        sb_toggled = true;
    }
    return false;
}

$('.ppl-toggle').click(function(){toggleSidebar();});
$('.edit-btn').click(function(){
    $('.edit-dial').slideToggle(400);
});
$('#blackout').click(function(){toggleSidebar();});
