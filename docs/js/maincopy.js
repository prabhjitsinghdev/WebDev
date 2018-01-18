// pj92singh
//var audio;

//hide the pause button
//$('#pause').hide();

//Initialize the playlist
initAudio($('#playlist li:first-child'));

function initAudio(element) {
  //takes the first song
  var song = element.attr('song');
  //get the title
  var title = element.text();
  //want cover next
  var cover = element.attr('cover');
  //get artist
  var artist = element.attr('artist');


  //create the audio Object
  audio = new Audio('media/'+ song);

//if the song hasn't started
//show the duration as 0.00
  if(!audio.currentTime){
    $('#duration').html('0:00');
  }

  $('#audio-player .title').text(title);
  $('#audio-player .artist').text(artist);



  //insert the cover image
  $('img.cover').attr('src','images/covers/' + cover);

  $('#playlist li').removeClass('active');

  element.addClass('active');


}
/*
//play function
//grab the button
$('play').click(function()){
  audio.play();
}
*/


//Play Button
$('#play').click(function(){
  audio.play();
 // $('#play').hide();
 // $('#pause').show();
  $('#duration').fadeIn(400);
  showDuration();
  //$('progressbar').fadeIn(400);
});

//Pause Button
$('#pause').click(function(){
  audio.pause();
  //$('#pause').hide();
  //$('#play').show();
});

//Stop Button
$('#stop').click(function(){
  audio.pause();
  audio.currentTime = 0;
 // $('#pause').hide();
 // $('#play').show();
  $('#duration').fadeOut(400);
});

//Next Button
$('#next').click(function(){
    audio.pause();
    var next = $('#playlist li.active').next().next();
    if (next.length == 0) {
        next = $('#playlist li:first-child');
    }
    initAudio(next);
  audio.play();
  showDuration();
});

//Prev Button
$('#prev').click(function(){
    audio.pause();
    var prev = $('#playlist li.active').prev();
    if (prev.length == 0) {
        prev = $('#playlist li:last-child');
    }
    initAudio(prev);
  audio.play();
  showDuration();
});

//Playlist Song Click
$('#playlist li').click(function () {
    audio.pause();
    initAudio($(this));
 // $('#play').hide();
 // $('#pause').show();
  $('#duration').fadeIn(400);
  audio.play();
  showDuration();
});

//Volume Control
$('#volume').change(function(){
  audio.volume = parseFloat(this.value / 10);
});

//Time Duration
function showDuration(){
  $(audio).bind('timeupdate', function(){
    //Get hours and minutes
    var secondds = parseInt(audio.currentTime % 60);
    var minutte = parseInt((audio.currentTime / 60) % 60);
    //Add 0 if seconds less than 10
    if (secondds < 10) {
      secondds = '0' + secondds;
    }
    $('#duration').html(minutte + ':' + secondds);
    var value = 0;
    if (audio.currentTime > 0) {
      value = ((100 / audio.duration) * audio.currentTime);
      /*Math.floor*/
    }
    $('#progress').css('width',value+'%');
  });

}
//click on progressbar to change it
$("#progressbar").mouseup(function(e){var leftOffset=e.pageX-$(this).offset().left;var songPercents=leftOffset/$('#progressbar').width();audio.currentTime=songPercents*audio.duration;});$(audio).on("ended",function(){audio.pause();var next=$('#playlist li.active').next();if(next.length==0){next=$('#playlist li:first-child');}initAudio(next);audio.play();showDuration();});
