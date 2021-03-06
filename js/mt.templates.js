//JSRENDER TEMPLATE FUNCTIONS
window.UI = window.UI || {};

UI.linkTemplate = function(templateId, targetId, data)
{
	$.templates(templateId, "#" + templateId);
	if(data && targetId)
		$.link[templateId](data, "#" + targetId);
};

UI.setupTemplates = function()
{
	UI.linkTemplate("extLinkTemplate");
	UI.linkTemplate("versionLinkTemplate");
	UI.linkTemplate("tagTemplate");
	UI.linkTemplate("descriptionTagTemplate");
	UI.linkTemplate("descriptionTemplate");
//	$.views.activeViews = false;

if($.views)
	$.views.helpers({
		getVar: getVar,
		combine: String.combine,
		thumbnailUrl: MediaFile.getThumbnailUrl,
		filePath: MediaFile.getFilePath,
		fileUrl: MediaFile.getFileUrl,
		scriptUrl: MediaFile.getScriptUrl,
		isVideoStream: MediaFile.isVideoStream,
		makeTitle: String.makeTitle,
		getGroup: UI.getGroup,
		setGroup: UI.setGroup,
		dateFormat: dateFormat,
		dateRange: Date.formatDateRange,
		formatTime: formatTime,
		formatSize: formatSize,
		divClasses: UI.divClasses,
		divStyles: UI.divStyles,
		imgClasses: UI.imgClasses,
		dirImgClasses: UI.dirImgClasses,
		captionClasses: UI.captionClasses,
		subtitleClasses: UI.subtitleClasses
	});
};

UI.renderTemplate = function(templateId, targetId, data, funct, params)
{
	var target = null;
	if(!isMissing(targetId))
		target = $(targetId);
	if(isEmpty(target) && isString(targetId))
		target = $("#"+targetId);

	var html="";
	if(data)
		html = $("#"+templateId).render(data, params);

	if(isEmpty(target))	return html;

	funct = valueOrDefault(funct, "html");
	if(funct===true) 
		funct="append";
	if(isFunction(target[funct]))
		target[funct](html);
	else
		target.html(html);	

	return html;
};

UI.getGroupTitle = function(mediaFile)
{
	if(isMissing(mediaFile) || isMissing(window.album)) return false;
	var value =  mediaFile[album.sort];
	if(isMissing(value)) return false;
	if(isFunction(value))
	{
	 	value = mediaFile[album.sort]();
	 	return String.makeTitle(value);
	}

	if(isNumber(value)) return value;
	if(album.sort=="takenDate")
	{
		if(!dateFormat)	return value;

		if(album.reverse)
			return Date.formatTimeSince(value, true);

		var fmt= ["month","year"].contains(album.dateRange.unit) ? "monthYear" : "longDate";
		return dateFormat(value,fmt);
	}
	if(album.sort=="type")
		return value+"S";
	if(album.sort=="subdir")
		return value.makeTitle();
//	if(album.sort=="name" || album.sort=="filename" || album.sort=="title")
	return value.substring(0,1).toUpperCase();

//	return false;
};

UI.setGroup = function(mediaFile)
{
	UI.prevGroup = UI.getGroupTitle(mediaFile);
};

UI.getGroup = function(mediaFile)
{
	if(!album.group && !album.group.length) return false;
	if(album.isMultiColumn() && !album.transpose) return false;
	
	var group=UI.getGroupTitle(mediaFile);
	if(UI.prevGroup != group)
		return group;
	return false;
};
	
// TO TEST
UI.getTextAjax = function (path, file, targetDivId)
{
	var url = path + "/" + file + ".txt";
	var result = null;
	var async = !isEmpty(targetDivId); 
	$.ajax({ url: url, async: async, dataType: 'text'})
	.done(function(contents)
	{
		result = contents;
		if(targetDivId)
			$("#"+targetDivId).html(contents);
	})
	.fail(function(jqXHR, textStatus, errorThrown)
	{
		result = textStatus + "\n" + errorThrown;
		if(targetDivId)
			$("#"+targetDivId).html("failed:" + textStatus + "\n" + errorThrown);
	});
	return result;
}

UI.getTemplateAjax = function(file, templateId, targetDivId)
{
//	var file = 'views/my_template_file.html';
	$.ajax({
		url: file,
		//async: false,
		dataType: 'text',
		success: function(contents) {
			$.templates(templateId, contents);
			if(targetDivId)
				$("#"+targetDivId).html( $.render.my_template()	);
		}
	});
}

UI.getTemplateUrl = function(name)
{
	return 'templates/' + name + '.tmpl.html';
};

UI.renderExtTemplate = function(item)
{
	var file = UI.getTemplateUrl( item.name );
	$.when($.get(file)).done(function(tmplData)
	 {
		 $.templates({ tmpl: tmplData });
		 $(item.selector).html($.render.tmpl(item.data));
	 });    
};

UI.displayArticle = function(mediaFile)
{
//	getArticle	ajax => text
//	parseKeywords with files
//	use file templates, slideshows, video player.
	if(isString(mediaFile))
		mediaFile=album.getMediaFileByName(mediaFile);

	mediaFile = valueOrDefault(mediaFile, UI.currentArticle);
	if(!mediaFile) return;

	UI.getDisplayOptions(album);
	UI.currentArticle = mediaFile;
	
	if(window.UI && UI.setMode)
		UI.setMode("article");

	if(isEmpty(mediaFile.description))
		mediaFile.description = UI.getTextAjax(album.urlAbsPath, mediaFile.name);

	var desc = mediaFile.description;
//	desc = desc.replace(new RegExp("\n\n", "g"), "</div><div class='nofloat left margin'>");
//	desc = desc.replace(new RegExp("\n", "g"), "</div><div>");
	desc = desc.parseKeywords(album.getFileNamesByType("IMAGE"), UI.renderMediaFile);
	desc = desc.parseKeywords(album.getFileNamesByType("VIDEO"), UI.renderMediaFile);

	var article = "<div class='title'>{0}</div><div class'margin'>{1}</div>".format(mediaFile.title, desc);
	if(UI.articleContainer)
	{
		UI.articleContainer.html(article);
		UI.setupFileEvents(UI.articleContainer);
	}
	return article;
};

UI.renderMediaFile = function(match, capture, position, text)
{
	if(isString(match))
		mediaFile = album.getMediaFileByName(match);
	else 
		mediaFile = match;

	if(!mediaFile) return "";

	var before = text[position-1];
	var after = text[position + match.length];
	var lineStart = !before || before == "\n";
	var lineEnd = !after || after == "\n";

	var nextDivClass = "";
	if(lineStart && lineEnd)
		nextDivClass = "nofloat centered"; 
	else if(lineStart)
		nextDivClass = "floaterLeft"; 
	else if(lineEnd)
		nextDivClass = "floaterRight"; 

	var html = UI.renderTemplate("fileboxTemplate", null, mediaFile);
	html = "<div class='{0}'>{1}{2}</div>".format(nextDivClass, html);
	return html;
}