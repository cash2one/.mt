window.UI = window.UI || {};

UI.downloadScript= "download.php";

UI.downloadMultipleFiles = function()
{
	UI.selectedFileList = album.getSelection(true);
	UI.fileIndex = 0;
	UI.downloadFile();
	UI.interval = setInterval(UI.downloadFile, Album.getConfig("downloads.interval"));
};

UI.downloadFile = function()
{
	if(UI.fileIndex >= UI.selectedFileList.length)
	{
		clearInterval(UI.interval);
		return;
	}

	var mediaFile = UI.selectedFileList[UI.fileIndex];
	if(mediaFile.isDir()) //skip dirs
	{
		UI.fileIndex++
		return UI.downloadFile();
	}

	UI.getIframe();	
	var downloadScriptUrl = UI.downloadScript ? mediaFile.getScriptUrl(UI.downloadScript) : mediaFile.getFileUrl(); //getThumbnailUrl(1);

	UI.downloadIframe.attr("src", downloadScriptUrl);
//	UI.addStatus("{0}:{1}".format(UI.fileIndex, downloadScriptUrl));
	return UI.fileIndex++;
};

UI.getIframe = function()
{
	if(!isEmpty(UI.downloadIframe)) return UI.downloadIframe;
	UI.downloadIframe=$('iframe#downloadIframe');
	if(!isEmpty(UI.downloadIframe)) return UI.downloadIframe;
	//if it does not exist, make download iframe	
	$("body").prepend('<iframe class="hidden" src="" id="downloadIframe" height="100"/>');
	return UI.getIframe();
};


//call ajax script for all selected files
UI.doSelectedFiles = function(script, params)
{
	UI.selectedFileList = album.getSelection(true);
	UI.multipleAjaxAsync(script, params);
};

UI.doNextFile = function(response, script, params, callbacks)
{
	if(callbacks.progress)
	{
		var filesize=MediaFile.getFileSize(UI.selectedFileList[UI.fileIndex]);
		UI.progressBar.addProgress(filesize);
	}

	if(++UI.fileIndex < UI.selectedFileList.length)
	{
		if(params)
		{
			delete params.path;
			delete params.file;
		}

		UI.selectedFileList[UI.fileIndex].scriptAjax(script, params, true, false, callbacks);
		return true;
	}

	//when all files processed
	if(callbacks.progress)
	{
		var totalTime = UI.progressBar.totalTime(true);
		UI.addStatus("Finished in {0}.".format(totalTime));
		UI.progressBar.toggle(false);
	}
	return false;
};

UI.displaySelection = function(fileList)
{
	if(isEmpty(fileList))
		fileList = album.getSelection(false);
	if(isEmpty(fileList))
		return UI.setStatus();

	var totalSize = fileList.sum(MediaFile.getUploadFileSize);
	var str = "{0}, {1}".format(plural(fileList.length,"file"), formatSize(totalSize));
	UI.setStatus(str);
};

UI.multipleAjaxSync = function(script, params)
{
	if(isEmpty(UI.selectedFileList)) return false;	
	UI.progressBar.displayFunction = formatSize;
	UI.progressBar.setMax(totalSize);
	UI.progressBar.reset();
	UI.progressBar.show();

	//simple loop, call script 1 after the other
	for(var k=0; k < UI.selectedFileList.length; k++)
	{	
		var startTime = new Date();
		var response = UI.selectedFileList[k].scriptAjax(script, params, true);
		var endTime = new Date();
		var responseTime = ProgressBar.formatSeconds(endTime - startTime);
//		UI.addStatus("{0}/{1} {2} {3}:".format(k, UI.selectedFileList.length, responseTime, UI.selectedFileList[k].name));
//		UI.addStatus(response);
	}
	UI.addStatus("Finished.");
};

UI.multipleAjaxAsync = function(script, params, callbacks)
{
	if(isEmpty(UI.selectedFileList)) return false;	
	if(!callbacks) 		callbacks = {};
	if(!callbacks.next) callbacks.next = UI.doNextFile;

	UI.displaySelection();
	if(callbacks.progress)
	{
		var totalSize = UI.selectedFileList.sum(MediaFile.getUploadFileSize);
		UI.progressBar.displayFunction = formatSize;
		UI.progressBar.setMax(totalSize);
	//	UI.progressBar.setMax(UI.selectedFileList.length);
		UI.progressBar.reset();
		UI.progressBar.show();
	}
	//async: ajax call for each file. when response, call for next.
	//upload file
	UI.fileIndex=0;
	UI.selectedFileList[UI.fileIndex].scriptAjax(script, params, true, true, callbacks);
};


//------------- Multiple upload --------------
UI.uploadMusicFiles = function()
{
	UI.uploadFiles(album.musicFiles);
};

UI.uploadSelectedFiles = function()
{
	UI.uploadFiles(album.getSelection(true));
}

UI.uploadFiles = function(mediaFiles)
{
	UI.selectedFileList = mediaFiles;
	if(isEmpty(UI.selectedFileList)) return;

	var callbacks = {success: MediaFile.imageSuccess, error: MediaFile.imageError, next: UI.uploadNextFile, progress: true};
	if(callbacks.progress)
	{
		UI.progressBar.displayFunction = formatSize;
		UI.progressBar.setMax(UI.selectedFileList.length);
		UI.progressBar.reset();
		UI.progressBar.show();
	}

	var params = {target: album.path };
	UI.multipleAjaxAsync(".upload/curlPostMediaFile.php", params, callbacks);
};

UI.uploadNextFile = function(response, script, params, callbacks)
{
//	UI.addStatus("{0}/{1} {2}:".format(UI.fileIndex, UI.selectedFileList.length, UI.selectedFileList[UI.fileIndex].name));
//	UI.addStatus(response);
	//same file, next chunk 	//response.file.filesize;
	
	if(response.nbChunks>1 && response.chunk < response.nbChunks)
	{
		UI.selectedFileList[UI.fileIndex].nbChunks = response.nbChunks;
		params.chunk=response.chunk;
		params.nbChunks=response.nbChunks;
		if(callbacks.progress)
			UI.progressBar.addProgress(response.file.filesize);
		UI.selectedFileList[UI.fileIndex].scriptAjax(script, params, true, true, callbacks);
		return;
	}

	var filesize=MediaFile.getFileSize(UI.selectedFileList[UI.fileIndex]);
	if(callbacks.progress)
		UI.progressBar.addProgress(filesize);
	++UI.fileIndex;
	//finished
	if(UI.fileIndex == UI.selectedFileList.length)
	{
		var totalTime = UI.progressBar.totalTime(true);
		UI.addStatus("Finished in {0}.".format(totalTime));
		UI.progressBar.hide();
		return;
	}

	//or next file
	if(params)
	{
		delete params.nbChunks;
		delete params.chunk;
		delete params.path;
		delete params.file;
	}
	UI.selectedFileList[UI.fileIndex].scriptAjax(script, params, true, true, callbacks);
};
