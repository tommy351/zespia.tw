// Settings
var repeat = localStorage.repeat || 0,
	shuffle = localStorage.shuffle || 'false',
	continous = true,
	autoplay = false,
	playlist = [
	{
		title: 'Tell Your World',
		artist: 'livetune feat.初音ミク',
		album: 'Tell Your World',
		cover: 'http://dl.dropbox.com/u/5480889/coverart/cover/tell_your_world.jpg',
		mp3: 'http://dl.dropbox.com/u/5480889/coverart/music/tell_your_world.mp3',
		ogg: 'http://dl.dropbox.com/u/5480889/coverart/music/tell_your_world.ogg'
	},
	{
		title: 'RPG',
		artist: 'School Food Punishment',
		album: 'RPG',
		cover: 'http://dl.dropbox.com/u/5480889/coverart/cover/rpg.jpeg',
		mp3: 'http://dl.dropbox.com/u/5480889/coverart/music/rpg.mp3',
		ogg: 'http://dl.dropbox.com/u/5480889/coverart/music/rpg.ogg'
	},
	{
		title: 'I want You',
		artist: 'Lin-G',
		album: 'DJ MAX TECHNIKA Original Soundtrack & Special Track',
		cover: 'http://dl.dropbox.com/u/5480889/coverart/cover/i_want_you.png',
		mp3: 'http://dl.dropbox.com/u/5480889/coverart/music/i_want_you.mp3',
		ogg: 'http://dl.dropbox.com/u/5480889/coverart/music/i_want_you.ogg'
	},
	{
		title: 'Mass Destruction',
		artist: '目黒将司',
		album: 'PERSONA MUSIC LIVE BAND',
		cover: 'http://dl.dropbox.com/u/5480889/coverart/cover/mass_destruction.png',
		mp3: 'http://dl.dropbox.com/u/5480889/coverart/music/mass_destruction.mp3',
		ogg: 'http://dl.dropbox.com/u/5480889/coverart/music/mass_destruction.ogg'
	},
	{
		title: '旅の途中',
		artist: '清浦夏実',
		album: '十九色',
		cover: 'http://dl.dropbox.com/u/5480889/coverart/cover/旅の途中.jpg',
		mp3: 'http://dl.dropbox.com/u/5480889/coverart/music/旅の途中.mp3',
		ogg: 'http://dl.dropbox.com/u/5480889/coverart/music/旅の途中.ogg'
	},
	{
		title: 'Can\'t Wait \'Til Christmas',
		artist: '宇多田ヒカル',
		album: 'UTADA HIKARU SINGLE COLLECTION VOL. 2',
		cover: 'http://dl.dropbox.com/u/5480889/coverart/cover/cant_wait_till_christmas.jpg',
		mp3: 'http://dl.dropbox.com/u/5480889/coverart/music/cant_wait_till_christmas.mp3',
		ogg: 'http://dl.dropbox.com/u/5480889/coverart/music/cant_wait_till_christmas.ogg'
	},
	{
		title: '夢ノート',
		artist: 'azusa',
		album: 'azusa',
		cover: 'http://dl.dropbox.com/u/5480889/coverart/cover/夢ノート.jpg',
		mp3: 'http://dl.dropbox.com/u/5480889/coverart/music/夢ノート.mp3',
		ogg: 'http://dl.dropbox.com/u/5480889/coverart/music/夢ノート.ogg'
	},
	{
		title: 'Phonic Nation',
		artist: 'May\'n',
		album: 'May\'n',
		cover: 'http://dl.dropbox.com/u/5480889/coverart/cover/phonic_nation.png',
		mp3: 'http://dl.dropbox.com/u/5480889/coverart/music/phonic_nation.mp3',
		ogg: 'http://dl.dropbox.com/u/5480889/coverart/music/phonic_nation.ogg'
	},
	{
		title: 'ふわふわ時間',
		artist: '桜高軽音部（平沢唯、秋山澪、田井中律、琴吹紬）',
		album: 'TVアニメ「けいおん!」劇中歌 - ふわふわ時間',
		cover: 'http://dl.dropbox.com/u/5480889/coverart/cover/ふわふわ時間.jpg',
		mp3: 'http://dl.dropbox.com/u/5480889/coverart/music/ふわふわ時間.mp3',
		ogg: 'http://dl.dropbox.com/u/5480889/coverart/music/ふわふわ時間.ogg'
	},
	{
		title: 'リップシンク',
		artist: 'nano.RIPE',
		album: '細胞キオク',
		cover: 'http://dl.dropbox.com/u/5480889/coverart/cover/リップシンク.jpg',
		mp3: 'http://dl.dropbox.com/u/5480889/coverart/music/リップシンク.mp3',
		ogg: 'http://dl.dropbox.com/u/5480889/coverart/music/リップシンク.ogg'
	}
];

// Load playlist
for (var i=0; i<playlist.length; i++){
	var item = playlist[i];
	$('#playlist').append('<li>'+item.artist+' - '+item.title+'</li>');
}

var time = new Date(),
	currentTrack = shuffle === 'true' ? time.getTime() % playlist.length : 0,
	trigger = false,
	audio, timeout, isPlaying, playCounts;

var play = function(){
	audio.play();
	$('.playback').addClass('playing');
	timeout = setInterval(updateProgress, 500);
	isPlaying = true;
}

var pause = function(){
	audio.pause();
	$('.playback').removeClass('playing');
	clearInterval(updateProgress);
	isPlaying = false;
}

// Update progress
var setProgress = function(value){
	var currentSec = parseInt(value%60) < 10 ? '0' + parseInt(value%60) : parseInt(value%60),
		ratio = value / audio.duration * 100;

	$('.timer').html(parseInt(value/60)+':'+currentSec);
	$('.progress .pace').css('width', ratio + '%');
	$('.progress .slider a').css('left', ratio + '%');
}

var updateProgress = function(){
	setProgress(audio.currentTime);
}

// Progress slider
$('.progress .slider').slider({step: 0.1, slide: function(event, ui){
	$(this).addClass('enable');
	setProgress(audio.duration * ui.value / 100);
	clearInterval(timeout);
}, stop: function(event, ui){
	audio.currentTime = audio.duration * ui.value / 100;
	$(this).removeClass('enable');
	timeout = setInterval(updateProgress, 500);
}});

// Volume slider
var setVolume = function(value){
	audio.volume = localStorage.volume = value;
	$('.volume .pace').css('width', value * 100 + '%');
	$('.volume .slider a').css('left', value * 100 + '%');
}

var volume = localStorage.volume || 0.5;
$('.volume .slider').slider({max: 1, min: 0, step: 0.01, value: volume, slide: function(event, ui){
	setVolume(ui.value);
	$(this).addClass('enable');
	$('.mute').removeClass('enable');
}, stop: function(){
	$(this).removeClass('enable');
}}).children('.pace').css('width', volume * 100 + '%');

$('.mute').click(function(){
	if ($(this).hasClass('enable')){
		setVolume($(this).data('volume'));
		$(this).removeClass('enable');
	} else {
		$(this).data('volume', audio.volume).addClass('enable');
		setVolume(0);
	}
});

// Switch track
var switchTrack = function(i){
	if (i < 0){
		track = currentTrack = playlist.length - 1;
	} else if (i >= playlist.length){
		track = currentTrack = 0;
	} else {
		track = i;
	}

	$('audio').remove();
	loadMusic(track);
	if (isPlaying == true) play();
}

// Shuffle
var shufflePlay = function(){
	var time = new Date(),
		lastTrack = currentTrack;
	currentTrack = time.getTime() % playlist.length;
	if (lastTrack == currentTrack) ++currentTrack;
	switchTrack(currentTrack);
}

// Fire when track ended
var ended = function(){
	pause();
	audio.currentTime = 0;
	playCounts++;
	if (continous == true) isPlaying = true;
	if (repeat == 1){
		play();
	} else {
		if (shuffle === 'true'){
			shufflePlay();
		} else {
			if (repeat == 2){
				switchTrack(++currentTrack);
			} else {
				if (currentTrack < playlist.length) switchTrack(++currentTrack);
			}
		}
	}
}

var beforeLoad = function(){
	var endVal = this.seekable && this.seekable.length ? this.seekable.end(0) : 0;
	$('.progress .loaded').css('width', (100 / (this.duration || 1) * endVal) +'%');
}

// Fire when track loaded completely
var afterLoad = function(){
	if (autoplay == true) play();
}

// Load track
var loadMusic = function(i){
	var item = playlist[i],
		newaudio = $('<audio>').html('<source src="'+item.mp3+'"><source src="'+item.ogg+'">').appendTo('#player');
	
	$('.cover').html('<img src="'+item.cover+'" alt="'+item.album+'">');
	$('.tag').html('<strong>'+item.title+'</strong><span class="artist">'+item.artist+'</span><span class="album">'+item.album+'</span>');
	$('#playlist li').removeClass('playing').eq(i).addClass('playing');
	audio = newaudio[0];
	audio.volume = $('.mute').hasClass('enable') ? 0 : volume;
	audio.addEventListener('progress', beforeLoad, false);
	audio.addEventListener('durationchange', beforeLoad, false);
	audio.addEventListener('canplay', afterLoad, false);
	audio.addEventListener('ended', ended, false);
}

loadMusic(currentTrack);
$('.playback').on('click', function(){
	if ($(this).hasClass('playing')){
		pause();
	} else {
		play();
	}
});
$('.rewind').on('click', function(){
	if (shuffle === 'true'){
		shufflePlay();
	} else {
		switchTrack(--currentTrack);
	}
});
$('.fastforward').on('click', function(){
	if (shuffle === 'true'){
		shufflePlay();
	} else {
		switchTrack(++currentTrack);
	}
});
$('#playlist li').each(function(i){
	var _i = i;
	$(this).on('click', function(){
		switchTrack(_i);
	});
});

if (shuffle === 'true') $('.shuffle').addClass('enable');
if (repeat == 1){
	$('.repeat').addClass('once');
} else if (repeat == 2){
	$('.repeat').addClass('all');
}

$('.repeat').on('click', function(){
	if ($(this).hasClass('once')){
		repeat = localStorage.repeat = 2;
		$(this).removeClass('once').addClass('all');
	} else if ($(this).hasClass('all')){
		repeat = localStorage.repeat = 0;
		$(this).removeClass('all');
	} else {
		repeat = localStorage.repeat = 1;
		$(this).addClass('once');
	}
});

$('.shuffle').on('click', function(){
	if ($(this).hasClass('enable')){
		shuffle = localStorage.shuffle = 'false';
		$(this).removeClass('enable');
	} else {
		shuffle = localStorage.shuffle = 'true';
		$(this).addClass('enable');
	}
});
