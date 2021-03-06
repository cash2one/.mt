// constructor for player instance
function MediaPlayer(settings)
{
	//if data is a string: get settings by key name
	if(isString(settings))
	{
		this.playerKey=settings;
		this.settings = MediaPlayer.getPlayerConfig(settings);
	}
	
	//if data is object: loop for each key, use Object.merge = function (this, data);
	else if(isObject(settings))
	{
		this.settings = settings;
		this.playerKey=this.settings.id;
	}
	this.playlistDiv=$("#{0}Playlist".format(this.settings.id));	
	MediaPlayer[this.playerKey]=this;
}

MediaPlayer.playerSettings=
{
	audio:
	{
		id:"musicPlayer",
	//	skinName: "five",
		type: "audio",
		allowHtml5: true,
		allowFlash: true,
		width: "100%",
		height: 24,
		autostart: false,		
		item: 0,
		repeat: "always",
		controlbar: "top",		
		"playlist.display": "html",
		"playlist.position": "top",
		"playlist.showAllItems": false,
		"playlist.size": 24,
		"playlist.maxHeight": 200
	},
	video:
	{
		id:"videoPlayer",
	//	skinName: "five",
		type: "video",
		allowHtml5: true,
		allowFlash: true,
		size: 1,
		autostart: true,
		item: 0,
		repeat: "list",
		controlbar: "over",
		"playlist.display": "html",
		"playlist.position": "right",
		"playlist.showAllItems": true,
		"playlist.size": 300,
		uiMode: "video"
	},
	slide:
	{
		id:"jwplayerDiv",
		type: "video",
		allowHtml5: true,
		allowFlash: true,
		size: 1,
		autostart: false,
		item: 0,
		repeat: "list",
		controlbar: "over",
		uiMode: "slideshow"
	}

};

MediaPlayer.videoPlayerSizes=[
	["small", 400,225],
	["default",640,360],
	["large", 960,540],
	["hd", 1280,720]
];

//static functions
MediaPlayer.getPlayerConfig = function(key,setting)
{
	if(!key) 		return "";
	keyl=key.toLowerCase();
	if(!setting)	return MediaPlayer.playerSettings[keyl] || key;
	return MediaPlayer.playerSettings[keyl] ? MediaPlayer.playerSettings[keyl][setting] : key;
};

MediaPlayer.getPlayerId = function(key)
{
	return MediaPlayer.getPlayerConfig(key,"id");
};

MediaPlayer.getPlayer = function(key)
{
	return jwplayer(MediaPlayer.getPlayerId(key));
};

MediaPlayer.prototype.getPlayer = function()
{
//	if(!this.player)
	this.player=jwplayer(this.settings.id);
	this.jqplayer = $("#" + this.settings.id); //this.player;
	return this.player;
};

MediaPlayer.prototype.getPlayerElement = function()
{
	this.getPlayer();
	return this.jqplayer;
};


//get skin absolute URL
MediaPlayer.getSkin = function(key)
{
	if(!key) return "";
	var skinName = MediaPlayer.getPlayerConfig(key,"skinName");
	if(!skinName) return "";

	var skinFile = String.combine("skins", skinName, skinName) + ".xml" ;
	//allowFlash ? skinName + ".zip" :
	var skinUrl = "/" + String.combine(window.location.pathname,"jwplayer",skinFile);
	return skinUrl;
};

MediaPlayer.prototype.getSkin = function()
{
	if(!this.settings.skinName) return "";

	var skinFile= String.combine(this.settings.skinName, this.settings.skinName) + ".xml" ;
	var skinUrl= "/" + String.combine(window.location.pathname, "jwplayer", skinFile);
	return skinUrl;
};

//instance methods
MediaPlayer.prototype.getModes = function()
{
	var modes=[];
	if(this.settings.allowFlash)
		modes.push({type: "flash", src: Album.getConfig("MediaPlayer.jwplayer.flash") });
	if(this.settings.allowHtml5)
		modes.push({type: "html5"});
	modes.push({type: "download"});
	return modes;
};

MediaPlayer.prototype.setupPlayer = function()
{
	this.initSize();
	this.settings.modes=this.getModes();
	this.settings.skin=this.getSkin();
	this.settings["playlist.position"]="none";

//TODO: remove player if it already exists. or load new file and change settings?
	this.getPlayer();
	this.player.setup(this.settings);
	this.setupIcons();
	this.setupEvents();
	return this;
};

//load single file
MediaPlayer.prototype.loadMediaFile = function(mediaFile)
{
	if(!mediaFile) return;
	var fileUrl = mediaFile.getFileUrl(mediaFile.isVideoStream());
	var imageUrl = null;
	if(mediaFile.thumbnailExists(1))
		imageUrl = mediaFile.getThumbnailUrl(1);
	else if(mediaFile.thumbnailExists(0))
		imageUrl = mediaFile.getThumbnailUrl(0);

	this.currentFile = mediaFile;
	return this.loadPlayer(fileUrl, imageUrl, mediaFile.duration);
};

MediaPlayer.prototype.loadHtml5Player = function(fileUrl, imageUrl, duration)
{
	this.initSize();

	var pl=$("#html5player");
	pl.attr("src", fileUrl);
	pl.attr("poster", imageUrl);
	pl.width(this.settings.width);
	pl.height(this.settings.height);
}

MediaPlayer.prototype.loadPlayer = function(fileUrl, imageUrl, duration)
{
	this.initSize();

	this.settings.modes=this.getModes();
	this.settings.skin=this.getSkin();
	this.settings.file=fileUrl;
	this.settings.image=imageUrl;
	this.settings.duration=duration;
	this.settings["playlist.position"]="none";

//TODO: remove player if it already exists. or load new file and change settings?
	this.player=jwplayer(this.settings.id).setup(this.settings);
	this.setupEvents();

	if(fileUrl && this.settings.uiMode)
		UI.setMode(this.settings.uiMode);

	return this;
};


MediaPlayer.getInstance = function(playerKey, mediaFiles)
{
	if(!MediaPlayer[playerKey])
		return new MediaPlayer(playerKey);
	return MediaPlayer[playerKey];
}

MediaPlayer.loadPlaylist = function(playerKey, mediaFiles)
{
	var mp = new MediaPlayer(playerKey);
	if(mp.settings.type=="video")
		return mp.loadVideoPlaylist(mediaFiles);
	return mp.loadMusicPlaylist(mediaFiles);
};

MediaPlayer.prototype.loadVideoPlaylist = function(mediaFiles)
{
	//select only VIDEO_STREAM types
	var videoFiles=mediaFiles.filter(MediaFile.isLocalVideoStream); 
	this.loadPlaylist(videoFiles);
	if(this.settings.uiMode)
		UI.setMode(this.settings.uiMode);
	return this;
};

MediaPlayer.prototype.loadMusicPlaylist = function(audioFiles)
{
//	var hasOgg=Album.selectFiles(audioFiles, {exts:"ogg"});
//	if(($.browser.mozilla || $.browser.webkit) && hasOgg.length>0)
//		allowFlash=false;
//	else if($.browser.msie && hasOgg.length>0)
//		audioFiles=Album.excludeFiles(audioFiles, {exts:"ogg"});

	return this.loadPlaylist(audioFiles);
};

//instance method 
//TODO, pass startItem : index or filename
MediaPlayer.prototype.loadPlaylist = function(mediaFiles, startItem)
{
	if(this.hasPlaylist())
  		return this;

	if(isEmpty(mediaFiles)) return;

	var playlist=MediaPlayer.makePlaylist(mediaFiles);
	if(!playlist.length) return;

	this.initSize();

	var showPlaylist=this.settings["playlist.display"];
	if(showPlaylist==="flash")
	{
		if(["top","bottom"].contains(this.settings["playlist.position"]))
			this.settings.height+=this.settings["playlist.size"];
		else if(["left","right"].contains(this.settings["playlist.position"]))
			this.settings.width+=this.settings["playlist.size"];
	}
	else if(showPlaylist && window.UI)
	{
		//var playlistDiv=$("#{0}Playlist".format(this.settings.id));
		if(["top","bottom"].contains(this.settings["playlist.position"]))
		{
			this.playlistDiv.width(this.settings.width);
//			if(this.settings["playlist.size"])
//				this.playlistDiv.height(this.settings["playlist.size"]);
		}
		else if(["left","right"].contains(this.settings["playlist.position"]))
		{
			this.playlistDiv.css("max-height", this.settings.height);
			if(this.settings["playlist.size"])
				this.playlistDiv.width(this.settings["playlist.size"]);
		}	
		if(this.settings["playlist.maxHeight"])
			this.playlistDiv.css("max-height", this.settings["playlist.maxHeight"]);
		if(this.settings["playlist.maxWidth"])
			this.playlistDiv.css("max-width", this.settings["playlist.maxWidth"]);
		UI.renderTemplate("playlistItemTemplate", this.settings.id+"Playlist", mediaFiles);
		this.settings["playlist.position"]="none";
	}

	//modify user settings
	this.settings.modes=this.getModes();
	this.settings.skin=this.getSkin();
	//this.settings.playlist=playlist;

	this.getPlayer();
	this.player.setup(this.settings);
	this.player.load(playlist);
	//playlist buttons
	if(playlist.length>1)
		this.setupIcons();
	this.setupEvents();
	
  	return this;
};

MediaPlayer.makePlaylist = function(mediaFiles, filterStream)
{
	var playlist=[];
	for(var k=0;k<mediaFiles.length;k++)
	{
		var mediaFile=mediaFiles[k];
		var streamExt=MediaFile.isVideoStream(mediaFile);
		//if(filterStream && !streamExt) // || streamExt=="youtube") continue;

		var desc= mediaFile.takenDate; //TODO parse and format date
		if(mediaFile.description)
			desc=mediaFile.description+"\n"+desc;
		var item={
			file: MediaFile.getFileUrl(mediaFile, streamExt),
			title: mediaFile.title,
			description: desc,
			image: MediaFile.getThumbnailUrl(mediaFile)
		};
		playlist.push(item);
	}
	return playlist;
};

//call upon player onplay event
//jwplayer mapped function
MediaPlayer.prototype.play = function()
{
	if(this.player && !this.isPlaying())
		this.player.play(true);
};

MediaPlayer.prototype.pause = function()
{
	if(this.player && this.isPlaying())
		this.player.play(false);
};

MediaPlayer.prototype.togglePlay = function(state)
{
	if(!this.player) return;
	if(state != this.isPlaying())
		this.player.play(state);
};

MediaPlayer.prototype.remove = function()
{
	if(this.player)	this.player.remove();
};

MediaPlayer.prototype.refreshPlayPauseIcon = function()
{
	if(!this.player)	return;
	var icon = this.getPlayPauseIcon();
	$("#{0}PlayButton".format(this.settings.id)).attr("src", icon);	
};

MediaPlayer.getPlayPauseIcon = function(player)
{
	if(!player) return;
	var state=player.getState();
	return (state=="PLAYING" || state=="BUFFERING" ) ? "icons/pause.png" : "icons/play.png";
};

MediaPlayer.prototype.getPlayPauseIcon = function()
{
	return MediaPlayer.getPlayPauseIcon(this.player);
};

//if player.isplaying / is active
MediaPlayer.prototype.isPlaying = function()
{
	if(!this.player) return false;
	var state=this.player.getState();
	return (state=="PLAYING" || state=="BUFFERING" );
};

MediaPlayer.prototype.isIdle = function()
{
	if(!this.player) return true;
	var state=this.player.getState();
	return (state=="IDLE");
};

MediaPlayer.prototype.isPaused = function()
{
	if(!this.player) return false;
	var state=this.player.getState();
	return (state=="IDLE");
};

//play next
MediaPlayer.prototype.playNext = function()
{
	if(this.player)
		this.player.playlistNext();
};

//play previous item
MediaPlayer.prototype.playPrevious = function()
{
	if(this.player)
		this.player.playlistPrev();
};

MediaPlayer.prototype.getPlaylist = function()
{
	if(this.player)
		return this.player.getPlaylist();
};

MediaPlayer.prototype.countPlaylistItems = function()
{
	if(!this.player) return 0;
	var pl = this.getPlaylist();
	return pl ? pl.length : 0;
};

MediaPlayer.prototype.hasPlaylist = function()
{
	return (this.countPlaylistItems() > 0);
};

MediaPlayer.prototype.getPlaylistItem = function(index)
{
	if(this.player)
		return this.player.getPlaylistItem(index);
};

//play selected item
//by number
//TODO: by name or mediaFile
MediaPlayer.prototype.playItem = function(index)
{
	if(this.player)
		this.player.playlistItem(index);
};

MediaPlayer.prototype.togglePlaylist = function()
{
	this.settings["playlist.showAllItems"] = !this.settings["playlist.showAllItems"];
	this.displaySelectedItem();
};

//TODO pass optional controlDiv id 
//todo play icon even if only 1 item
// onclick functions? instance or static?
MediaPlayer.prototype.setupIcons = function()
{
	if(!this.player) return;
	if(!this.controlDiv)
		this.controlDiv=$("#{0}Controls".format(this.settings.id));

	this.controlDiv.html("");
	this.controlDiv.append('<img id="{0}PrevButton" class="icon icontr" title="previous (P)" src="icons/arrow-first.png" alt="previous" onclick="MediaPlayer.{1}.playPrevious();"/>'.format(this.settings.id, this.playerKey));
	var icon = this.getPlayPauseIcon();
	this.controlDiv.append('<img id="{0}PlayButton" class="icon icontr" title="play/pause (M)" src="{2}" alt="play" onclick="MediaPlayer.{1}.togglePlay();"/>'.format(this.settings.id, this.playerKey, icon));
	this.controlDiv.append('<img id="{0}NextButton" class="icon icontr" title="next (N)" src="icons/arrow-last.png" alt="next" onclick="MediaPlayer.{1}.playNext();"/>'.format(this.settings.id, this.playerKey));
	
	var iconAttr={
		id: this.settings.id + "PlaylistButton",
		src: "icons/playlist.png",
		"class": "icon icontr",
		alt: "playlist",
		title: "playlist",
		onclick: "MediaPlayer.{0}.togglePlaylist()".format(this.playerKey)
	};
	icon=$.makeElement("img", iconAttr);
	this.controlDiv.append(icon);	
	if(!isMissing(this.settings.size))
	{
		iconAttr={
			id: this.settings.id + "{0}ResizeButtonD",
			src: "icons/24-zoom-actual.png",
			"class": "icon icontr",
			alt: "smaller",
			title: "resize player",
			onclick: "MediaPlayer.{0}.nextSize(-1)".format(this.playerKey)
		};
		icon=$.makeElement("img", iconAttr);//.html(iconAttr.alt);
		this.controlDiv.append(icon);	

		iconAttr={
			id: this.settings.id + "{0}ResizeButtonL",
			src: "icons/24-zoom-fill.png",
			"class": "icon icontr",
			alt: "larger",
			title: "resize player",
			onclick: "MediaPlayer.{0}.nextSize(1)".format(this.playerKey)
		};

		icon=$.makeElement("img", iconAttr);//.html(iconAttr.alt);
		this.controlDiv.append(icon);	

		iconAttr={
			id: this.settings.id + "{0}ResizeFullButton",
			src: "icons/playlist.png",
			"class": "icon icontr",
			alt: "full",
			title: "resize player",
			onclick: "MediaPlayer.{0}.resizeFullWindow()".format(this.playerKey)
		};
		icon=$.makeElement("a", iconAttr).html(iconAttr.alt);
		this.controlDiv.append(icon);	
	}
	
	iconAttr={
		id: this.settings.id + "{0}CloseButton",
		src: "icons/delete.png",
		"class": "icon icontr",
		alt: "close",
		title: "close player",
		onclick: "MediaPlayer.{0}.remove()".format(this.playerKey)
	};
	icon=$.makeElement("img", iconAttr);
	this.controlDiv.append(icon);	

	iconAttr={
		id: this.settings.id + "{0}uploadIcon",
		src: "icons/upload16.png",
		"class": "icon upload",
		alt: "upload",
		title: "upload files",
		onclick: "UI.uploadMusicFiles()"
	};
	icon=$.makeElement("img", iconAttr);
	this.controlDiv.append(icon);	
};

MediaPlayer.prototype.initSize = function()
{
	if(isMissing(this.settings.size)) return;

	var size=MediaPlayer.videoPlayerSizes[this.settings.size];
	this.settings.width=size[1];
	this.settings.height=size[2];
//	this.setMessage(size[0]);
}

MediaPlayer.prototype.nextSize = function(incr)
{
	incr=valueOrDefault(incr,1);
	this.settings.size = modulo(this.settings.size + incr, MediaPlayer.videoPlayerSizes.length);
	return this.setSize();
};

MediaPlayer.prototype.setSize = function()
{
	var size=MediaPlayer.videoPlayerSizes[this.settings.size];
	this.setMessage(size[0]);

	this.playlistDiv.css("max-height", size[2]);
//	this.playlistDiv.height(size[2]);

	if(!this.player) return;

	return this.player.resize(size[1], size[2]);
};

MediaPlayer.prototype.resize = function(width,height)
{
	if(!this.player) return;
	return this.player.resize(width,height);
};

MediaPlayer.prototype.resizeFullWindow = function()
{
	var w=$(window);
	return this.player.resize(w.width(),w.height());
};

MediaPlayer.prototype.setupEvents = function()
{
	if(!this.player) return;
	var mp=this; //reference to this MediaPlayer used from jwplayer event callbacks
	this.player.onPlay(function(event)
	{
		mp.setMessage(); 
		if(mp.settings.uiMode=="slideshow")
			mp.slideshow.togglePlay(true);
		mp.displayItemDuration();		
	});

	this.player.onBufferFull(function(event)
	{
		mp.displayItemDuration();
	});

	this.player.onPause(function(event)
	{ 
		mp.setMessage("paused");
		if(mp.settings.uiMode=="slideshow")
			mp.slideshow.togglePlay(false);
	 });
	this.player.onComplete(function(event)
	{
		mp.setMessage("finished."); 
		if(mp.settings.uiMode=="slideshow" && mp.slideshow.play)
			mp.slideshow.showNextImage();
	});
	this.player.onIdle(function(event) { mp.setMessage(); });
	this.player.onSeek(function(event) { mp.setMessage(); });
//	this.player.onBuffer(function(event)	{ mp.setMessage("buffering...", item); });
	this.player.onMeta(function(event)
	{	
		if(event.metadata.duration)
		{
			mp.currentFile.duration = event.metadata.duration;
			mp.displayItemDuration(event.metadata.duration);
		}

		if(mp.currentFile.height && mp.currentFile.width || !event.metadata.height || !event.metadata.width) return;
	   	mp.currentFile.height = event.metadata.height;
		mp.currentFile.width  = event.metadata.width;
		mp.currentFile.getRatio();
		mp.slideshow.fitImage();
	});

	this.player.onPlaylistItem(function(event) 
	{
		mp.displaySelectedItem(event.index);
	});
	// player.onTime(function(event) 
	// {
		// $("#{0}Playlist > div.selectedItem .duration".format(mp.settings.id)).html(formatTime(event.duration));
        // mp.setMessage(formatTime(event.position) +" / "+formatTime(event.duration));
    // });

	this.player.onFullscreen(function(event)
	{	
//		mp.setMessage("onFullscreen", event);
		mp.fullscreen=event.fullscreen;
		if(!event.fullscreen) UI.preventEsc=true;
//		UI.addStatus(" resized: full screen {0}".format(event.fullscreen));
	});

/*
	this.player.onResize(function(event)
	{	
		mp.setMessage("onResize", event);	
		UI.setStatus("resized: {0}x{1}".format(event.width, event.height));

		//set player top margin
		if(mp.settings.uiMode=="slideshow")
		{
			var playerContainer=mp.getElement();
			var pch = playerContainer.outerHeight(true);
			var wHeight = mp.slideshow.container.height();
			playerContainer.css("margin-top", (wHeight - pch)/2);
			this.setMessage("margin {0} {1} {2}".format(wHeight, pch, (wHeight - pch)/2 ));
		}
	});
*/
};

MediaPlayer.prototype.isFullScreen = function()
{
	return this.fullscreen || false;
};

MediaPlayer.prototype.displayItemDuration = function(duration)
{
	if(isMissing(duration))
	{
		var item=this.getPlaylistItem();
		if(item) 
			duration=item.duration;
	}
	if(!duration || duration <= 0) return;
	var durationDiv=$("#{0}Playlist .selectedItem .duration".format(this.settings.id));
	durationDiv.html(formatTime(duration));
};

MediaPlayer.prototype.displayEvent = function(event)
{
	this.setMessage(Object.toText(event," "));
};

MediaPlayer.prototype.setMessage = function(text,event)
{
	if(!this.messsageDiv || !this.messsageDiv.length==0)
		this.messsageDiv=$("#{0}Message".format(this.settings.id));
	text=valueOrDefault(text,"");
	if(event)
		text+= Object.toText(event," / ");
	this.messsageDiv.html(text);
	this.refreshPlayPauseIcon();
};

MediaPlayer.prototype.displaySelectedItem = function(index)
{
	var selectedItem;
	if(isMissing(index))
		selectedItem=$("#{0}Playlist > div.selectedItem".format(this.settings.id));
	else
		selectedItem=$("#{0}Playlist > div:eq({1})".format(this.settings.id, index));

	var item=this.getPlaylistItem();
	document.title = item ? item.title : album.title;
	
	var otherItems=selectedItem.siblings();
	otherItems.removeClass("selectedItem");
	selectedItem.addClass("selectedItem");
	selectedItem.slideDown("fast");
	//TODO use settings	or player.config
	var showAllPlaylistItems = this.settings["playlist.showAllItems"];
	if(showAllPlaylistItems)
		otherItems.slideDown("fast");
	else
		otherItems.slideUp("fast");
};

// event callbacks
MediaPlayer.prototype.onLoad = function () 
{
};

MediaPlayer.prototype.onClose = function()
{ 
};

MediaPlayer.prototype.getElement = function()
{
	var el;
	if(this.settings.container)
		el = $("#" + this.settings.container);
	else
		el  = $("#" + this.settings.id + "_wrapper");
	if(isEmpty(el))
		el  = $("#" + this.settings.id);
	return el;
};

MediaPlayer.prototype.show = function(options)
{
	return this.getElement().show(options);
};

MediaPlayer.prototype.hide = function(options)
{ 
	return this.getElement().hide(options);
};

MediaPlayer.prototype.toggle = function(options)
{ 
	return this.getElement().toggle(options);
};

MediaPlayer.prototype.playerFocus = function()
{
	return (document.activeElement == this.player);
};